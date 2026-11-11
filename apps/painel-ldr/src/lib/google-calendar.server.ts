// Server-only Google Calendar API client using Google's OAuth 2.0 refresh-token grant.
// Secrets are supplied exclusively by the server environment; never by VITE_ variables.
const GOOGLE_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export const CALENDAR_ID = process.env["GOOGLE_CALENDAR_ID"] || "";
function calendarId(): string {
  const id = process.env["GOOGLE_CALENDAR_ID"];
  if (!id) throw new CalendarError("nao_configurado");
  return id;
}
export const CALENDAR_TIMEZONE = "Europe/Brussels";

export type CalendarErrorCode =
  | "nao_configurado" | "credencial_invalida" | "permissao_negada"
  | "nao_encontrado" | "limite_google" | "indisponivel"
  | "resposta_invalida" | "evento_existente";

export class CalendarError extends Error {
  code: CalendarErrorCode;
  constructor(code: CalendarErrorCode) {
    super(code);
    this.code = code;
  }
}

export function isCalendarConfigured(): boolean {
  return Boolean(process.env["GOOGLE_OAUTH_CLIENT_ID"] &&
    process.env["GOOGLE_OAUTH_CLIENT_SECRET"] &&
    process.env["GOOGLE_CALENDAR_ID"]);
}

function mapStatus(status: number): CalendarErrorCode {
  if (status === 401) return "credencial_invalida";
  if (status === 403) return "permissao_negada";
  if (status === 409) return "evento_existente";
  if (status === 404 || status === 410) return "nao_encontrado";
  if (status === 429) return "limite_google";
  return "indisponivel";
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let pendingRefresh: Promise<string> | null = null;

async function getRefreshToken(): Promise<string> {
  if (process.env["GOOGLE_OAUTH_REFRESH_TOKEN"]) return process.env["GOOGLE_OAUTH_REFRESH_TOKEN"]!;
  try {
    const { loadCalendarOAuthRefreshToken } = await import("./google-calendar-oauth-storage.server.ts");
    return (await loadCalendarOAuthRefreshToken()) || "";
  } catch { return ""; }
}

async function accessToken(): Promise<string> {
  if (!isCalendarConfigured()) throw new CalendarError("nao_configurado");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new CalendarError("nao_configurado");
    let response: Response;
    try {
      response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        signal: AbortSignal.timeout(15_000),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env["GOOGLE_OAUTH_CLIENT_ID"]!,
          client_secret: process.env["GOOGLE_OAUTH_CLIENT_SECRET"]!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });
    } catch {
      throw new CalendarError("indisponivel");
    }
    if (!response.ok) throw new CalendarError(response.status >= 400 && response.status < 500 ? "credencial_invalida" : "indisponivel");
    let data: { access_token?: string; expires_in?: number };
    try { data = await response.json() as typeof data; }
    catch { throw new CalendarError("resposta_invalida"); }
    if (!data.access_token || !Number.isFinite(data.expires_in) || (data.expires_in ?? 0) <= 0) {
      throw new CalendarError("resposta_invalida");
    }
    cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in! * 1000 };
    return data.access_token;
  })();
  try { return await pendingRefresh; }
  finally { pendingRefresh = null; }
}

async function gateway<T>(
  path: string,
  init: { method: string; body?: unknown } = { method: "GET" },
): Promise<T> {
  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(`${GOOGLE_API}${path}`, {
      method: init.method,
      signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
  } catch { throw new CalendarError("indisponivel"); }
  if (response.status === 401) cachedToken = null;
  if (!response.ok) throw new CalendarError(mapStatus(response.status));
  if (response.status === 204) return {} as T;
  try { return await response.json() as T; }
  catch { throw new CalendarError("resposta_invalida"); }
}

const calendarPath = () => `/calendars/${encodeURIComponent(calendarId())}`;

type GoogleEvent = {
  id?: string;
  status?: string;
  hangoutLink?: string;
  htmlLink?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
};

export type CalendarEventResult = {
  eventId: string;
  meetUrl: string | null;
};

function extractMeetUrl(event: GoogleEvent): string | null {
  const entry = event.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video" && typeof e.uri === "string",
  );
  return entry?.uri ?? event.hangoutLink ?? null;
}

function toResult(event: GoogleEvent): CalendarEventResult {
  if (!event.id) throw new CalendarError("resposta_invalida");
  return { eventId: event.id, meetUrl: extractMeetUrl(event) };
}

/** Verifica conflito no calendário principal (apenas janelas ocupadas). */
export async function hasConflict(
  startsAtIso: string,
  endsAtIso: string,
  ignoreEventId: string | null,
): Promise<boolean> {
  const data = await gateway<{
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }>; errors?: unknown[] }>;
  }>("/freeBusy", {
    method: "POST",
    body: { timeMin: startsAtIso, timeMax: endsAtIso, items: [{ id: calendarId() }] },
  });

  const calendar = data.calendars?.[calendarId()];
  if (!calendar || calendar.errors?.length || !Array.isArray(calendar.busy)) {
    throw new CalendarError("indisponivel");
  }
  const busy = calendar.busy;
  if (busy.length === 0) return false;
  if (!ignoreEventId) return true;

  // freeBusy merges occupied windows. Subtracting the own interval can hide a
  // second event at exactly the same time; inspect event identities instead.
  const events = await gateway<{ items?: Array<GoogleEvent & { transparency?: string }>; nextPageToken?: string }>(
    `${calendarPath()}/events?singleEvents=true&timeMin=${encodeURIComponent(startsAtIso)}&timeMax=${encodeURIComponent(endsAtIso)}&maxResults=2500`,
  );
  if (!Array.isArray(events.items) || events.nextPageToken) throw new CalendarError("indisponivel");
  return events.items.some((event) => event.id !== ignoreEventId && event.status !== "cancelled" && event.transparency !== "transparent");
}

/** Recupera evento por id, ou pelo marcador privado do agendamento (anti-órfão). */
export async function findEventByAppointment(
  appointmentId: string | null,
  eventId: string | null,
): Promise<{ eventId: string; meetUrl: string | null; start: number; end: number } | null> {
  try {
    if (eventId) {
      const event = await gateway<GoogleEvent & { start?: { dateTime?: string }; end?: { dateTime?: string } }>(
        `${calendarPath()}/events/${encodeURIComponent(eventId)}`,
      );
      if (!event.id || event.status === "cancelled") return null;
      return {
        eventId: event.id,
        meetUrl: extractMeetUrl(event),
        start: new Date(event.start?.dateTime ?? 0).getTime(),
        end: new Date(event.end?.dateTime ?? 0).getTime(),
      };
    }

    if (!appointmentId) return null;
    const list = await gateway<{
      items?: Array<GoogleEvent & { start?: { dateTime?: string }; end?: { dateTime?: string } }>;
    }>(
      `${calendarPath()}/events?privateExtendedProperty=${encodeURIComponent(
        `ldr_appointment=${appointmentId}`,
      )}&showDeleted=false&maxResults=5`,
    );
    const found = (list.items ?? []).find((e) => e.id && e.status !== "cancelled");
    if (!found?.id) return null;
    return {
      eventId: found.id,
      meetUrl: extractMeetUrl(found),
      start: new Date(found.start?.dateTime ?? 0).getTime(),
      end: new Date(found.end?.dateTime ?? 0).getTime(),
    };
  } catch (error) {
    if (error instanceof CalendarError && error.code === "nao_encontrado") return null;
    throw error;
  }
}

type EventInput = {
  appointmentId: string;
  generation?: number;
  /** Título seguro: nome do serviço no catálogo. Sem pedido, preço ou notas. */
  summary: string;
  startsAtIso: string;
  endsAtIso: string;
  attendeeEmail: string;
};

const SAFE_DESCRIPTION =
  "Encontro agendado pelo painel do Grupo LDR Essence. O link de acesso também está disponível na Área do Cliente.";

/** Cria evento privado com Google Meet e um único convidado (o cliente). */
export async function createEvent(input: EventInput): Promise<CalendarEventResult> {
  let event: GoogleEvent;
  try {
  event = await gateway<GoogleEvent>(
    `${calendarPath()}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      body: {
        id: `ldr${input.appointmentId.replaceAll("-", "")}g${input.generation ?? 0}`,
        summary: input.summary,
        description: SAFE_DESCRIPTION,
        visibility: "private",
        transparency: "opaque",
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: false,
        guestsCanModify: false,
        start: { dateTime: input.startsAtIso, timeZone: CALENDAR_TIMEZONE },
        end: { dateTime: input.endsAtIso, timeZone: CALENDAR_TIMEZONE },
        attendees: [{ email: input.attendeeEmail }],
        extendedProperties: { private: { ldr_appointment: input.appointmentId } },
        conferenceData: {
          createRequest: {
            // Determinístico por agendamento: repetir a ação não cria outra sala.
            requestId: `ldr-${input.appointmentId}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    },
  );
  } catch (error) {
    if (!(error instanceof CalendarError) || error.code !== "evento_existente") throw error;
    event = await gateway<GoogleEvent>(`${calendarPath()}/events/${encodeURIComponent(`ldr${input.appointmentId.replaceAll("-", "")}g${input.generation ?? 0}`)}`);
    if (event.status === "cancelled") throw new CalendarError("nao_encontrado");
    return patchEvent(toResult(event).eventId, input);
  }
  return toResult(event);
}

/** Reagendamento: atualiza SEMPRE o mesmo evento, preservando a sala Meet. */
export async function patchEvent(
  eventId: string,
  input: Omit<EventInput, "appointmentId">,
): Promise<CalendarEventResult> {
  const event = await gateway<GoogleEvent>(
    `${calendarPath()}/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "PATCH",
      body: {
        summary: input.summary,
        start: { dateTime: input.startsAtIso, timeZone: CALENDAR_TIMEZONE },
        end: { dateTime: input.endsAtIso, timeZone: CALENDAR_TIMEZONE },
        attendees: [{ email: input.attendeeEmail }],
      },
    },
  );
  return toResult(event);
}

/** Cancelamento: remove o mesmo evento e notifica o convidado. */
export async function cancelEvent(eventId: string): Promise<void> {
  try {
    await gateway<unknown>(
      `${calendarPath()}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE" },
    );
  } catch (error) {
    // Evento já removido no Google é sucesso do ponto de vista do cancelamento.
    if (error instanceof CalendarError && error.code === "nao_encontrado") return;
    throw error;
  }
}
