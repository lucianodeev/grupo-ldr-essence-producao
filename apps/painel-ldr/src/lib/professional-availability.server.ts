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

  const rows = weekdays.filter((weekday) => !(current ?? []).some((row: any) =>
    String(row.professional_service_id ?? "") === String(input.serviceId ?? "") &&
    Number(row.weekday) === weekday &&
    String(row.start_time).slice(0, 5) === input.startTime &&
    String(row.end_time).slice(0, 5) === input.endTime &&
    String(row.timezone) === timezone &&
    String(row.modality) === modality
  )).map((weekday) => ({
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
  const { data, error } = await db.from("professional_availability")
    .update({ active: false })
    .eq("id", availabilityId)
    .eq("professional_profile_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) fail("Disponibilidade não encontrada.");
  return { ok: true as const };
}
