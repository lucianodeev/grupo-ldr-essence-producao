import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (table: string) => any };
}

async function requireSuperadmin(context: any) {
  const { resolveAccess } = await import("@/lib/access.server");
  const access = await resolveAccess(context.supabase, context.userId);
  if (!access.authorized || access.role !== "superadmin") throw new Error("Acesso negado.");
}

export const professionalNotificationTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperadmin(context);
    const database = await db();
    const [{ data: customers }, { data: employees }, { data: professionals }, { data: organizations }, { data: recent }, { data: benefits }, { data: catalog }] = await Promise.all([
      database.from("customers").select("id,full_name,email,phone,language,birth_date,vacation_start,vacation_end,next_day_off,portal_active").order("full_name"),
      database.from("organization_members").select("id,organization_id,full_name,email,phone,birth_date,vacation_start,vacation_end,next_day_off,portal_active").order("full_name"),
      database.from("profiles").select("id,full_name,email,phone,birth_date,vacation_start,vacation_end,next_day_off,is_active").eq("is_active", true).order("full_name"),
      database.from("organizations").select("id,name,billing_email,phone,active").order("name"),
      database.from("notification_outbox").select("id,audience_type,target_id,channel,event_type,recipient,subject,body,status,scheduled_for,sent_at,created_at").order("created_at", { ascending: false }).limit(100),
      database.from("organization_benefit_allocations").select("id,organization_id,member_id,catalog_key,status,credits_granted,credits_used,requested_at,scheduled_at,scheduled_note,schedule_status").in("status", ["assigned","requested"]).order("requested_at", { ascending:false, nullsFirst:false }).limit(300),
      database.from("service_catalog").select("catalog_key,name").eq("active", true),
    ]);
    return { customers: customers ?? [], employees: employees ?? [], professionals: professionals ?? [], organizations: organizations ?? [], recent: recent ?? [], benefits: benefits ?? [], catalog: catalog ?? [] };
  });

export const professionalSendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { audienceType: "client"|"employee"|"professional"|"company"; targetIds: string[]; channels: Array<"in_app"|"email"|"sms">; eventType: "appointment"|"credit_reminder"|"no_credit_offer"|"birthday"|"vacation"|"day_off"|"manual"; subject?: string; body: string; scheduledFor?: string | null }) => data)
  .handler(async ({ context, data }) => {
    await requireSuperadmin(context);
    const ids = [...new Set((data.targetIds ?? []).map(String).filter(Boolean))].slice(0, 500);
    if (!ids.length) throw new Error("Selecione pelo menos um destinatário.");
    if (!data.body?.trim()) throw new Error("Escreva a mensagem.");
    const channels = [...new Set(data.channels ?? [])];
    if (!channels.length) throw new Error("Escolha ao menos um canal.");
    const database = await db();
    let targets: any[] = [];
    if (data.audienceType === "client") {
      const { data: rows } = await database.from("customers").select("id,email,phone").in("id", ids); targets = rows ?? [];
    } else if (data.audienceType === "employee") {
      const { data: rows } = await database.from("organization_members").select("id,organization_id,email,phone").in("id", ids); targets = rows ?? [];
    } else if (data.audienceType === "professional") {
      const { data: rows } = await database.from("profiles").select("id,email,phone").in("id", ids); targets = rows ?? [];
    } else {
      const { data: rows } = await database.from("organizations").select("id,billing_email,phone").in("id", ids); targets = (rows ?? []).map((r:any)=>({ id:r.id, organization_id:r.id, email:r.billing_email, phone:r.phone }));
    }
    const scheduledFor = data.scheduledFor || new Date().toISOString();
    const rows: any[] = [];
    for (const target of targets) for (const channel of channels) {
      const recipient = channel === "email" ? target.email : channel === "sms" ? target.phone : null;
      if (channel !== "in_app" && !recipient) continue;
      rows.push({ audience_type:data.audienceType, target_id:target.id, organization_id:target.organization_id ?? null, channel, event_type:data.eventType, recipient, subject:data.subject?.trim() || null, body:data.body.trim(), scheduled_for:scheduledFor, status:channel === "in_app" ? "sent" : "provider_pending", sent_at:channel === "in_app" ? new Date().toISOString() : null, created_by:context.userId });
    }
    if (!rows.length) throw new Error("Nenhum destinatário possui os canais selecionados disponíveis.");
    const { error } = await database.from("notification_outbox").insert(rows);
    if (error) throw error;
    return { ok:true as const, created:rows.length, providerPending:rows.filter(r=>r.status==="provider_pending").length };
  });

export const professionalScheduleOrganizationBenefit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { benefitId: string; scheduledAt: string; note?: string | null }) => data)
  .handler(async ({ context, data }) => {
    await requireSuperadmin(context);
    const when = new Date(data.scheduledAt);
    if (!data.benefitId || Number.isNaN(when.getTime())) throw new Error("Data ou benefício inválido.");
    const database = await db();
    const { data: benefit, error } = await database.from("organization_benefit_allocations")
      .select("id,organization_id,member_id,catalog_key,status")
      .eq("id", data.benefitId).maybeSingle();
    if (error || !benefit) throw new Error("Benefício não encontrado.");
    const [{ data: member }, { data: service }, { data: organization }] = await Promise.all([
      database.from("organization_members").select("id,full_name,email,phone").eq("id", benefit.member_id).maybeSingle(),
      database.from("service_catalog").select("name").eq("catalog_key", benefit.catalog_key).maybeSingle(),
      database.from("organizations").select("id,name,billing_email,phone").eq("id", benefit.organization_id).maybeSingle(),
    ]);
    const { error: updateError } = await database.from("organization_benefit_allocations")
      .update({ scheduled_at:when.toISOString(), scheduled_note:data.note?.trim() || null, schedule_status:"scheduled" })
      .eq("id", benefit.id);
    if (updateError) throw updateError;
    const serviceName = service?.name ?? "serviço";
    const dateText = when.toLocaleString("pt-BR", { timeZone:"Europe/Brussels" });
    const body = `Seu atendimento de ${serviceName} foi agendado para ${dateText}. Acesse sua área para acompanhar os detalhes.`;
    const rows:any[] = [
      { audience_type:"employee", target_id:member?.id, organization_id:benefit.organization_id, channel:"in_app", event_type:"appointment", body, scheduled_for:new Date().toISOString(), status:"sent", sent_at:new Date().toISOString(), created_by:context.userId },
    ];
    if (member?.email) rows.push({ audience_type:"employee", target_id:member.id, organization_id:benefit.organization_id, channel:"email", event_type:"appointment", recipient:member.email, subject:"Agendamento confirmado — Grupo LDR Essence", body, scheduled_for:new Date().toISOString(), status:"provider_pending", created_by:context.userId });
    if (member?.phone) rows.push({ audience_type:"employee", target_id:member.id, organization_id:benefit.organization_id, channel:"sms", event_type:"appointment", recipient:member.phone, body, scheduled_for:new Date().toISOString(), status:"provider_pending", created_by:context.userId });
    if (organization?.id) rows.push({ audience_type:"company", target_id:organization.id, organization_id:organization.id, channel:"in_app", event_type:"appointment", body:`${member?.full_name ?? "Funcionário"}: ${body}`, scheduled_for:new Date().toISOString(), status:"sent", sent_at:new Date().toISOString(), created_by:context.userId });
    const { error: notifyError } = await database.from("notification_outbox").insert(rows);
    if (notifyError) throw notifyError;
    return { ok:true as const };
  });

export const portalNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const database = await db();
    const userId = context.userId;
    const [{ data: customer }, { data: member }, { data: organization }, { data: profile }] = await Promise.all([
      database.from("customers").select("id").eq("auth_user_id", userId).maybeSingle(),
      database.from("organization_members").select("id,organization_id").eq("auth_user_id", userId).maybeSingle(),
      database.from("organizations").select("id").eq("owner_auth_user_id", userId).maybeSingle(),
      database.from("profiles").select("id").eq("id", userId).maybeSingle(),
    ]);
    const filters:any[] = [];
    if (customer?.id) filters.push(["client", customer.id]);
    if (member?.id) filters.push(["employee", member.id]);
    if (organization?.id) filters.push(["company", organization.id]);
    if (profile?.id) filters.push(["professional", profile.id]);
    if (!filters.length) return [];
    const or = filters.map(([type,id])=>`and(audience_type.eq.${type},target_id.eq.${id})`).join(",");
    const { data, error } = await database.from("notification_outbox").select("id,audience_type,event_type,subject,body,created_at,scheduled_for").eq("channel","in_app").eq("status","sent").or(or).order("created_at", { ascending:false }).limit(30);
    if (error) throw error;
    return data ?? [];
  });
