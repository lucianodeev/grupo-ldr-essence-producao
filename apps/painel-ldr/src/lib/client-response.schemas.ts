import { z } from "zod";

// Public response contracts verified against client-self v3 and the server projection.
const text = z.string();
const optionalText = text.nullable();
export const clientCustomerSchema = z.object({
  id: text, fullName: text, email: optionalText, phone: optionalText,
  country: optionalText.default(null),
});
export const clientContextSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), customer: clientCustomerSchema }),
  z.object({ status: z.literal("blocked") }),
  z.object({ status: z.literal("unlinked"), email: optionalText }),
]);
const orderSchema = z.object({
  id: text, order_number: optionalText, title: text, description: optionalText,
  service_type: text, status: text, payment_status: text, amount_cents: z.number().nullable(),
  currency: text, due_date: optionalText, created_at: text, updated_at: text, assignee_id: optionalText,
});
const mentorshipSchema = z.object({
  id: text, program_name: text, status: text, payment_status: text, scheduled_at: optionalText,
  goal: optionalText, client_summary: optionalText, next_steps: optionalText, created_at: text,
});
const deliverySchema = z.object({
  id: text, order_id: optionalText, title: text, description: optionalText, status: text,
  delivery_url: optionalText, client_note: optionalText, due_date: optionalText,
  delivered_at: optionalText, approved_at: optionalText, needs_client_approval: z.boolean(),
  created_at: text, updated_at: text,
});
const sessionSchema = z.object({
  id: text, mentorship_id: text, appointment_id: optionalText, title: text, session_number: z.number(),
  scheduled_at: optionalText, duration_minutes: z.number(), status: text, client_notes: optionalText,
  confirmed_at: optionalText, meeting_url: optionalText.default(null),
});
const historySchema = z.object({
  id: text, order_id: text, field: text, old_value: optionalText, new_value: optionalText,
  note: optionalText, created_at: text,
});
export const clientOverviewSchema = z.object({
  customer: clientCustomerSchema, orders: z.array(orderSchema), mentorships: z.array(mentorshipSchema),
  deliveries: z.array(deliverySchema), sessions: z.array(sessionSchema), history: z.array(historySchema),
});
export const clientAgendaSchema = z.object({
  customer: clientCustomerSchema,
  appointments: z.array(z.object({
    id: text, orderId: optionalText, orderNumber: optionalText, title: text, status: text,
    startsAt: optionalText, endsAt: optionalText, durationMinutes: z.number(), clientNotes: optionalText,
    meetingUrl: optionalText,
    meetState: z.enum(["aguardando_pagamento", "aguardando_confirmacao", "preparando", "pronto"]),
  })),
  balances: z.array(z.object({
    orderId: text, orderNumber: optionalText, serviceName: text, billingModel: text,
    granted: z.number(), used: z.number(), remaining: z.number(), repeatPaymentUrl: optionalText,
  })),
  schedulable: z.array(z.object({
    orderId: text, orderNumber: optionalText, serviceName: text, catalogKey: optionalText,
    kind: z.enum(["single", "package", "project"]), limit: z.number().nullable(), used: z.number(),
    remaining: z.number().nullable(), consumesCredit: z.boolean(), canRequest: z.boolean(),
    blockedReason: z.enum(["sem_credito", "sessao_unica_usada"]).nullable(),
  })),
});
export const clientLibrarySchema = z.object({
  customer: clientCustomerSchema,
  products: z.array(z.object({
    key: z.enum(["ebook_coragem_comecar", "livro_menino_mamao", "ebook_pratica_clinica_psicanalise",
      "ebook_psicanalise_no_mundo", "ebook_estudos_caso_psicanalise", "ebook_psicanalise_autismo",
      "ebook_psicologia_psicanalise_terapias", "ebook_jornalismo_era_digital", "ebook_corpo_trabalho_escuta",
      "ebook_comportamento_humano", "ebook_estetica_bem_estar", "ebook_tricologia_cuidado",
      "ebook_ia_novos_milionarios", "ebook_imigracao_efeitos_psicologicos", "ebook_psicanalise_vs_psiquiatria"]),
    title: text, description: text, priceBrlCents: z.number(), priceEurCents: z.number(),
    entitled: z.boolean(), purchaseUrl: text,
  })),
});
export const ownerSummarySchema = z.object({
  generatedAt: text,
  metrics: z.object({
    activeProfessionals: z.number(), pendingProfessionals: z.number(), activeCompanies: z.number(),
    activeEmployees: z.number(), activeSubscriptions: z.number(), paidPayments: z.number(),
    pendingPayouts: z.number(), pendingNotifications: z.number(),
  }),
  financialByCurrency: z.array(z.object({
    currency: text, paymentsCount: z.number(), grossCents: z.number(), commissionCents: z.number(),
    providerNetCents: z.number(), pendingPayoutCents: z.number(), paidPayoutCents: z.number(),
  })),
});
