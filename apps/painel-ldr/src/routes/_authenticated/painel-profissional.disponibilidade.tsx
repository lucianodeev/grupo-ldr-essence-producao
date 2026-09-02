import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/central/ui";
import {
  professionalAvailabilityAdd,
  professionalAvailabilityDisable,
  professionalAvailabilitySettings,
} from "@/lib/professional-availability.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/painel-profissional/disponibilidade")({
  component: ProfessionalAvailabilityPage,
});

type Row = Record<string, any>;

const COPY = {
  pt: {
    title: "Minha disponibilidade",
    subtitle: "Defina quando clientes podem solicitar seus atendimentos. Os horários pertencem somente ao seu perfil.",
    explain: "Cada profissional configura a própria agenda. Nenhum horário de outro profissional é copiado automaticamente.",
    service: "Serviço",
    allServices: "Todos os serviços",
    days: "Dias disponíveis",
    start: "Início",
    end: "Fim",
    timezone: "Fuso horário",
    interval: "Intervalo entre inícios",
    buffer: "Pausa adicional (min)",
    modality: "Modalidade",
    location: "Local público (opcional)",
    add: "Adicionar disponibilidade",
    adding: "Salvando…",
    current: "Disponibilidade publicada",
    empty: "Você ainda não publicou horários.",
    remove: "Remover",
    online: "Online",
    inPerson: "Presencial",
    both: "Online e presencial",
    recommendation: "Para atendimentos de 50 minutos, recomendamos intervalos de 60 minutos para evitar sobreposição.",
    saved: "Disponibilidade atualizada.",
    removed: "Horário removido.",
  },
  en: {
    title: "My availability",
    subtitle: "Define when clients can request your services. These hours belong only to your profile.",
    explain: "Each professional manages their own schedule. No other professional's hours are copied automatically.",
    service: "Service", allServices: "All services", days: "Available days", start: "Start", end: "End", timezone: "Time zone", interval: "Start interval", buffer: "Extra buffer (min)", modality: "Modality", location: "Public location (optional)", add: "Add availability", adding: "Saving…", current: "Published availability", empty: "You have not published any hours yet.", remove: "Remove", online: "Online", inPerson: "In person", both: "Online and in person", recommendation: "For 50-minute appointments, we recommend 60-minute start intervals to prevent overlap.", saved: "Availability updated.", removed: "Availability removed.",
  },
  fr: {
    title: "Mes disponibilités",
    subtitle: "Définissez quand les clients peuvent demander vos services. Ces horaires appartiennent uniquement à votre profil.",
    explain: "Chaque professionnel gère son propre agenda. Les horaires d'un autre professionnel ne sont jamais copiés automatiquement.",
    service: "Service", allServices: "Tous les services", days: "Jours disponibles", start: "Début", end: "Fin", timezone: "Fuseau horaire", interval: "Intervalle de début", buffer: "Pause supplémentaire (min)", modality: "Modalité", location: "Lieu public (facultatif)", add: "Ajouter une disponibilité", adding: "Enregistrement…", current: "Disponibilités publiées", empty: "Vous n'avez pas encore publié d'horaires.", remove: "Supprimer", online: "En ligne", inPerson: "Présentiel", both: "En ligne et présentiel", recommendation: "Pour des rendez-vous de 50 minutes, nous recommandons des départs toutes les 60 minutes afin d'éviter les chevauchements.", saved: "Disponibilité mise à jour.", removed: "Disponibilité supprimée.",
  },
  es: {
    title: "Mi disponibilidad",
    subtitle: "Define cuándo los clientes pueden solicitar tus servicios. Estos horarios pertenecen solo a tu perfil.",
    explain: "Cada profesional configura su propia agenda. Los horarios de otros profesionales no se copian automáticamente.",
    service: "Servicio", allServices: "Todos los servicios", days: "Días disponibles", start: "Inicio", end: "Fin", timezone: "Zona horaria", interval: "Intervalo de inicio", buffer: "Pausa adicional (min)", modality: "Modalidad", location: "Ubicación pública (opcional)", add: "Añadir disponibilidad", adding: "Guardando…", current: "Disponibilidad publicada", empty: "Todavía no publicaste horarios.", remove: "Eliminar", online: "Online", inPerson: "Presencial", both: "Online y presencial", recommendation: "Para citas de 50 minutos, recomendamos intervalos de 60 minutos para evitar superposiciones.", saved: "Disponibilidad actualizada.", removed: "Horario eliminado.",
  },
} as const;

const DAY_LABELS = {
  pt: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
} as const;

function ProfessionalAvailabilityPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(professionalAvailabilitySettings);
  const addFn = useServerFn(professionalAvailabilityAdd);
  const removeFn = useServerFn(professionalAvailabilityDisable);
  const { locale } = useI18n();
  const c = COPY[locale];
  const dayLabels = DAY_LABELS[locale];

  const [serviceId, setServiceId] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Europe/Brussels");
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [modality, setModality] = useState<"online" | "in_person" | "both">("both");
  const [locationLabel, setLocationLabel] = useState("");

  useEffect(() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) setTimezone(zone);
    } catch { /* mantém fallback */ }
  }, []);

  const settings = useQuery({
    queryKey: ["professional-availability-settings"],
    queryFn: () => listFn({}),
    staleTime: 10_000,
  });

  const add = useMutation({
    mutationFn: () => addFn({ data: {
      serviceId: serviceId || null,
      weekdays: days,
      startTime,
      endTime,
      timezone,
      intervalMinutes,
      bufferMinutes,
      modality,
      locationLabel: locationLabel || null,
    } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["professional-availability-settings"] });
      toast.success(c.saved);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Não foi possível salvar a disponibilidade."),
  });

  const remove = useMutation({
    mutationFn: (availabilityId: string) => removeFn({ data: { availabilityId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["professional-availability-settings"] });
      toast.success(c.removed);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Não foi possível remover o horário."),
  });

  const services = (settings.data?.services ?? []) as Row[];
  const availability = (settings.data?.availability ?? []) as Row[];
  const serviceNames = useMemo(() => new Map(services.map((s) => [String(s.id), String(s.name)])), [services]);

  function toggleDay(day: number) {
    setDays((current) => current.includes(day) ? current.filter((v) => v !== day) : [...current, day].sort());
  }

  return <div>
    <PageHeader title={c.title} subtitle={c.subtitle} />

    <section className="s8-card mb-5">
      <p className="text-sm leading-6 text-muted-foreground">{c.explain}</p>
      <p className="mt-2 rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{c.recommendation}</p>
    </section>

    <section className="s8-card mb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-semibold">{c.service}
          <select className="s8-field" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">{c.allServices}</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}{s.booking_enabled ? "" : " · não reservável"}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.start}<input className="s8-field" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.end}<input className="s8-field" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.timezone}<input className="s8-field" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Europe/Brussels" /></label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.interval}
          <select className="s8-field" value={intervalMinutes} onChange={(e) => setIntervalMinutes(Number(e.target.value))}>
            {[30,45,60,90,120].map((v) => <option key={v} value={v}>{v} min</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.buffer}<input className="s8-field" type="number" min={0} max={120} value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))} /></label>
        <label className="grid gap-1.5 text-sm font-semibold">{c.modality}
          <select className="s8-field" value={modality} onChange={(e) => setModality(e.target.value as typeof modality)}>
            <option value="both">{c.both}</option><option value="online">{c.online}</option><option value="in_person">{c.inPerson}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">{c.location}<input className="s8-field" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} /></label>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold">{c.days}</p>
        <div className="mt-2 flex flex-wrap gap-2">{dayLabels.map((label, day) => <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${days.includes(day) ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`} aria-pressed={days.includes(day)}>{label}</button>)}</div>
      </div>

      <button type="button" disabled={add.isPending || !days.length} onClick={() => add.mutate()} className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">{add.isPending ? c.adding : c.add}</button>
    </section>

    <section>
      <h2 className="font-serif text-2xl">{c.current}</h2>
      {settings.isLoading ? <p className="mt-3 text-sm text-muted-foreground">…</p> : availability.length === 0 ? <div className="s8-card mt-3 text-sm text-muted-foreground">{c.empty}</div> : <div className="mt-3 grid gap-3 md:grid-cols-2">{availability.map((row) => <article key={row.id} className="s8-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold">{row.professional_service_id ? serviceNames.get(String(row.professional_service_id)) ?? c.service : c.allServices}</p>
            <p className="mt-1 text-sm text-muted-foreground">{dayLabels[Number(row.weekday)]} · {String(row.start_time).slice(0,5)}–{String(row.end_time).slice(0,5)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{row.timezone} · {row.slot_interval_minutes} min · {row.modality === "online" ? c.online : row.modality === "in_person" ? c.inPerson : c.both}{row.location_label ? ` · ${row.location_label}` : ""}</p>
          </div>
          <button type="button" onClick={() => remove.mutate(String(row.id))} disabled={remove.isPending} className="rounded-lg border px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50">{c.remove}</button>
        </div>
      </article>)}</div>}
    </section>
  </div>;
}
