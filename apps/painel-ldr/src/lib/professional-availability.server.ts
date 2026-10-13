import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never { throw new Error(message); }
function minutes(value: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return -1;
  const h = Number(m[1]); const min = Number(m[2]);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59 ? h * 60 + min : -1;
}
function validTimezone(value: string) {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date()); return true; } catch { return false; }
}

async function ownProfile(userId: string) {
  const { data: account, error: accountError } = await db.from("professional_accounts")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (accountError) throw accountError;
  if (!account) fail("Complete seu cadastro profissional antes de configurar a agenda.");
  const { data: profile, error: profileError } = await db.from("professional_profiles")
    .select("id,display_name")
    .eq("professional_account_id", account.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) fail("Complete seu perfil antes de configurar a agenda.");
  return profile as { id: string; display_name: string };
}

export async function getProfessionalAvailabilitySettings(userId: string) {
  const profile = await ownProfile(userId);
  const [{ data: services, error: servicesError }, { data: availability, error: availabilityError }] = await Promise.all([
    db.from("professional_services")
      .select("id,name,modality,duration_minutes,booking_enabled,active,approval_status")
      .eq("professional_profile_id", profile.id)
      .eq("active", true)
      .order("sort_order"),
    db.from("professional_availability")
      .select("id,professional_service_id,weekday,start_time,end_time,timezone,slot_interval_minutes,buffer_minutes,modality,location_label,active")
      .eq("professional_profile_id", profile.id)
      .eq("active", true)
      .order("weekday")
      .order("start_time"),
  ]);
  if (servicesError) throw servicesError;
  if (availabilityError) throw availabilityError;
  return { profile, services: services ?? [], availability: availability ?? [] };
}

export async function addProfessionalAvailabilityBlocks(userId: string, input: {
  serviceId?: string | null;
  weekdays: number[];
  startTime: string;
  endTime: string;
  timezone: string;
  intervalMinutes?: number;
  bufferMinutes?: number;
  modality?: "online" | "in_person" | "both";
  locationLabel?: string | null;
}) {
  const profile = await ownProfile(userId);
  const weekdays = [...new Set((input.weekdays ?? []).map(Number))].filter((v) => Number.isInteger(v) && v >= 0 && v <= 6);
  if (!weekdays.length) fail("Selecione pelo menos um dia da semana.");
  const start = minutes(input.startTime);
  const end = minutes(input.endTime);
  if (start < 0 || end < 0 || end <= start) fail("Informe um horário inicial e final válidos.");
  const timezone = input.timezone?.trim() || "Europe/Brussels";
  if (!validTimezone(timezone)) fail("Informe um fuso horário válido, por exemplo Europe/Brussels.");
  const interval = Math.max(15, Math.min(240, Number(input.intervalMinutes || 60)));
  const buffer = Math.max(0, Math.min(120, Number(input.bufferMinutes || 0)));
  const modality = input.modality || "both";

  if (input.serviceId) {
    const { data: service, error } = await db.from("professional_services")
      .select("id,modality")
      .eq("id", input.serviceId)
      .eq("professional_profile_id", profile.id)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!service) fail("Serviço inválido.");
    if (service.modality !== "both" && modality !== "both" && service.modality !== modality) fail("A modalidade escolhida não corresponde ao serviço.");
  }

  const { data: current, error: currentError } = await db.from("professional_availability")
    .select("professional_service_id,weekday,start_time,end_time,timezone,modality,active")
    .eq("professional_profile_id", profile.id)
    .eq("active", true);
  if (currentError) throw currentError;

  // Treat overlapping blocks for the same service/day/timezone/modality as duplicates.
  // This prevents a second Monday block (for example 08:00-21:00 inside 07:00-22:00)
  // from being created while preserving existing records and booking rules.
  const rows = weekdays.filter((weekday) => !(current ?? []).some((row: any) => {
    if (String(row.professional_service_id ?? "") !== String(input.serviceId ?? "")) return false;
    if (Number(row.weekday) !== weekday) return false;
    if (String(row.timezone) !== timezone || String(row.modality) !== modality) return false;
    const rowStart = minutes(String(row.start_time).slice(0, 5));
    const rowEnd = minutes(String(row.end_time).slice(0, 5));
    return rowStart >= 0 && rowEnd >= 0 && start < rowEnd && end > rowStart;
  })).map((weekday) => ({
    professional_profile_id: profile.id,
    professional_service_id: input.serviceId || null,
    weekday,
    start_time: input.startTime,
    end_time: input.endTime,
    timezone,
    slot_interval_minutes: interval,
    buffer_minutes: buffer,
    modality,
    location_label: input.locationLabel?.trim() || null,
    active: true,
  }));

  if (rows.length) {
    const { error } = await db.from("professional_availability").insert(rows);
    if (error) throw error;
  }
  return { ok: true as const, added: rows.length, skipped: weekdays.length - rows.length };
}

export async function disableProfessionalAvailability(userId: string, availabilityId: string) {
  const profile = await ownProfile(userId);
  // Desativar sem apagar o registo preserva histórico e referências de agendamentos.
  const { data, error } = await db.from("professional_availability")
    .update({ active: false })
    .eq("id", availabilityId)
    .eq("professional_profile_id", profile.id)
    .eq("active", true)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) fail("Disponibilidade não encontrada.");
  return { ok: true as const };
}


export async function updateProfessionalAvailability(userId: string, input: {
  availabilityId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  intervalMinutes: number;
  bufferMinutes: number;
  modality: "online" | "in_person" | "both";
  locationLabel?: string | null;
}) {
  const profile = await ownProfile(userId);
  const { data: existing, error: existingError } = await db.from("professional_availability")
    .select("id,professional_service_id,weekday")
    .eq("id", input.availabilityId)
    .eq("professional_profile_id", profile.id)
    .eq("active", true)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) fail("Disponibilidade não encontrada.");
  const start = minutes(input.startTime);
  const end = minutes(input.endTime);
  if (start < 0 || end <= start) fail("Informe horários válidos.");
  const timezone = input.timezone?.trim();
  if (!timezone || !validTimezone(timezone)) fail("Fuso horário inválido.");
  const interval = Number(input.intervalMinutes);
  const buffer = Number(input.bufferMinutes);
  if (!Number.isInteger(interval) || interval < 15 || interval > 240) fail("Intervalo inválido.");
  if (!Number.isInteger(buffer) || buffer < 0 || buffer > 120) fail("Pausa inválida.");
  if (!["online", "in_person", "both"].includes(input.modality)) fail("Modalidade inválida.");
  if (existing.professional_service_id) {
    const { data: service, error: serviceError } = await db.from("professional_services")
      .select("id,modality").eq("id", existing.professional_service_id)
      .eq("professional_profile_id", profile.id).eq("active", true).maybeSingle();
    if (serviceError) throw serviceError;
    if (!service) fail("Serviço indisponível.");
    if (service.modality !== "both" && input.modality !== "both" && service.modality !== input.modality)
      fail("Modalidade incompatível com o serviço.");
  }
  const { data: other, error: otherError } = await db.from("professional_availability")
    .select("id,professional_service_id,weekday,start_time,end_time,timezone,modality")
    .eq("professional_profile_id", profile.id).eq("active", true)
    .neq("id", existing.id);
  if (otherError) throw otherError;
  const overlap = (other ?? []).some((row: any) =>
    String(row.professional_service_id ?? "") === String(existing.professional_service_id ?? "") &&
    Number(row.weekday) === Number(existing.weekday) &&
    row.timezone === timezone && row.modality === input.modality &&
    start < minutes(String(row.end_time).slice(0, 5)) &&
    end > minutes(String(row.start_time).slice(0, 5))
  );
  if (overlap) fail("Este horário sobrepõe outra disponibilidade.");
  const { data: updated, error } = await db.from("professional_availability")
    .update({
      start_time: input.startTime, end_time: input.endTime, timezone,
      slot_interval_minutes: interval, buffer_minutes: buffer,
      modality: input.modality, location_label: input.locationLabel?.trim() || null,
    })
    .eq("id", existing.id).eq("professional_profile_id", profile.id).eq("active", true)
    .select("id").maybeSingle();
  if (error) throw error;
  if (!updated) fail("Disponibilidade não encontrada.");
  return { ok: true as const };
}
