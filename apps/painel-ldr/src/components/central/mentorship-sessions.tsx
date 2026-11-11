import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { confirmSessionFn, updateAppointmentFn, setAppointmentStatusFn } from "@/lib/agenda-admin.functions";
import { toast } from "sonner";

import { Field, GhostButton, PrimaryButton, StatusBadge } from "@/components/central/ui";
import { supabase } from "@/integrations/supabase/client";
import { SESSION_STATUSES, formatDateTime, labelOf, toLocalInput, toneOf } from "@/lib/central";
import { useMentorshipSessions, useAppointments, useMentorships, type MentorshipSession } from "@/lib/central-data";

/** Agenda de sessões da mentoria: mesma origem de dados vista pelo cliente. */
export function MentorshipSessions({ mentorshipId }: { mentorshipId: string }) {
  const queryClient = useQueryClient();
  const sessions = useMentorshipSessions();
  const appointments = useAppointments();
  const mentorships = useMentorships();
  const confirmFn = useServerFn(confirmSessionFn);
  const detailsFn = useServerFn(updateAppointmentFn);
  const statusFn = useServerFn(setAppointmentStatusFn);
  const parent = (mentorships.data ?? []).find(m => m.id === mentorshipId);
  const eligibleAppointments = (appointments.data ?? []).filter(a => a.customer_id === parent?.customer_id && a.order_id === parent?.order_id && !["cancelada","concluida"].includes(a.status));
  const [adding, setAdding] = useState(false);

  const invalidate = () => {
    for(const key of ["mentorship-sessions","appointments","calendar-sync","session-credits"])
      queryClient.invalidateQueries({queryKey:[key]});
  };
  const confirm = useMutation({mutationFn: async ({sessionId,form}:{sessionId:string;form:FormData}) => {
    const date=String(form.get("confirmation_date")??"");
    return confirmFn({data:{sessionId,appointmentId:String(form.get("appointment_id")??""),
      scheduledAt:new Date(date).toISOString(),meetingUrl:String(form.get("confirmation_url")??"")}});
  },onSuccess:(result)=>{invalidate();if(result.ok)toast.success("Sessão confirmada.");else toast.error("Confirmação registada; sincronização pendente. Verifique a agenda.");},onError:(e:Error)=>toast.error(e.message)});

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      const v = (k: string) => String(form.get(k) ?? "").trim();
      const { error } = await supabase.from("mentorship_sessions").insert({
        mentorship_id: mentorshipId,
        title: v("title") || "Sessão de mentoria",
        session_number: v("session_number") ? Number(v("session_number")) : null,
        scheduled_at: v("scheduled_at") ? new Date(v("scheduled_at")).toISOString() : null,
        duration_minutes: v("duration_minutes") ? Number(v("duration_minutes")) : 50,
        meeting_url: null,
        client_notes: v("client_notes") || null,
      });
      if (error) throw new Error("Não foi possível criar a sessão.");
    },
    onSuccess: () => {
      setAdding(false);
      invalidate();
      toast.success("Sessão criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MentorshipSession> }) => {
      const session = (sessions.data ?? []).find(s => s.id === id);
      if (session?.appointment_id && patch.scheduled_at) {
        await detailsFn({data:{appointmentId:session.appointment_id,startsAt:patch.scheduled_at}});return;
      }
      if (session?.appointment_id && patch.status) {
        await statusFn({data:{appointmentId:session.appointment_id,status:patch.status}});return;
      }
      const { error } = await supabase.from("mentorship_sessions").update(patch).eq("id", id);
      if (error) throw new Error("Não foi possível atualizar a sessão.");
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (sessions.data ?? []).filter((s) => s.mentorship_id === mentorshipId);

  return (
    <div className="mt-4 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Sessões e videochamada
        </p>
        <GhostButton onClick={() => setAdding((v) => !v)}>
          {adding ? "Fechar" : "Nova sessão"}
        </GhostButton>
      </div>

      {adding && (
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(new FormData(e.currentTarget));
          }}
        >
          <Field label="Título">
            <input name="title" className="s8-field" placeholder="Sessão de mentoria" />
          </Field>
          <Field label="Número">
            <input name="session_number" type="number" min={1} className="s8-field" />
          </Field>
          <Field label="Data e hora">
            <input name="scheduled_at" type="datetime-local" className="s8-field" />
          </Field>
          <Field label="Duração (min)">
            <input name="duration_minutes" type="number" min={10} defaultValue={50} className="s8-field" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observações para o cliente">
              <textarea name="client_notes" rows={2} className="s8-field" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit" disabled={create.isPending}>
              Salvar sessão
            </PrimaryButton>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhuma sessão registrada.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {list.map((s) => (
            <li key={s.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-primary">
                  {s.title ?? `Sessão ${s.session_number ?? ""}`.trim()} ·{" "}
                  {formatDateTime(s.scheduled_at)}
                </p>
                <StatusBadge tone={toneOf(SESSION_STATUSES, s.status)}>
                  {labelOf(SESSION_STATUSES, s.status)}
                </StatusBadge>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Data e hora">
                  <input
                    type="datetime-local"
                    className="s8-field"
                    defaultValue={toLocalInput(s.scheduled_at)}
                    onBlur={(e) =>
                      update.mutate({
                        id: s.id,
                        patch: {
                          scheduled_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Situação">
                  <select
                    className="s8-field"
                    value={s.status}
                    onChange={(e) =>
                      update.mutate({
                        id: s.id,
                        patch: { status: e.target.value as MentorshipSession["status"] },
                      })
                    }
                  >
                    {SESSION_STATUSES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <form className="sm:col-span-2 grid gap-3 rounded-lg border border-border p-3" onSubmit={e=>{e.preventDefault();confirm.mutate({sessionId:s.id,form:new FormData(e.currentTarget)});}}>
                  <Field label="Agendamento desta sessão">
                    <select name="appointment_id" required className="s8-field" defaultValue={s.appointment_id ?? ""}>
                      <option value="">Selecionar agendamento</option>
                      {eligibleAppointments.filter(a=>!s.appointment_id||a.id===s.appointment_id).map(a=><option key={a.id} value={a.id}>{a.title} · {formatDateTime(a.starts_at)}</option>)}
                    </select>
                  </Field>
                  <Field label="Confirmar data e hora"><input name="confirmation_date" type="datetime-local" required className="s8-field" defaultValue={toLocalInput(s.scheduled_at)} /></Field>
                  <Field label="Link da videochamada"><input name="confirmation_url" type="url" required className="s8-field" defaultValue={s.meeting_url ?? ""} placeholder="https://meet.google.com/..." /></Field>
                  <p className="text-xs text-muted-foreground">O link fica disponível depois da confirmação. Crie o agendamento na agenda caso ainda não exista.</p>
                  <PrimaryButton type="submit" disabled={confirm.isPending}>Confirmar sessão</PrimaryButton>
                </form>
                <div className="sm:col-span-2">
                  <Field label="Observações para o cliente">
                    <textarea
                      rows={2}
                      className="s8-field"
                      defaultValue={s.client_notes ?? ""}
                      onBlur={(e) =>
                        update.mutate({ id: s.id, patch: { client_notes: e.target.value || null } })
                      }
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Notas internas (não visíveis ao cliente)">
                    <textarea
                      rows={2}
                      className="s8-field"
                      defaultValue={s.internal_notes ?? ""}
                      onBlur={(e) =>
                        update.mutate({ id: s.id, patch: { internal_notes: e.target.value || null } })
                      }
                    />
                  </Field>
                </div>
              </div>
              {s.meeting_url ? (
                <a
                  href={s.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-bold text-primary underline"
                >
                  Entrar na videochamada
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
