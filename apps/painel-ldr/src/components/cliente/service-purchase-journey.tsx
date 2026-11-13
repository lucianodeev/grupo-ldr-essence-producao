import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

const COPY = {
  pt: { title: "Do serviço escolhido ao atendimento", refresh: "Atualizar status", pendingPayment: "O pagamento ainda não foi confirmado. Se já pagou, aguarde e atualize o status do pedido.", paid: "Pagamento confirmado. Consulte seus créditos e solicite um horário na Minha agenda.", noResults: "Nenhum serviço encontrado nesta moeda ou pesquisa. Consulte o atendimento para outras opções.", steps: ["Escolha o serviço e confira o valor total.", "Aguarde a confirmação do pagamento e dos créditos no pedido.", "Solicite o horário na Minha agenda.", "A equipe confirma o atendimento e libera o link da reunião."], note: "O pagamento não reserva um horário automaticamente. A duração e a modalidade são confirmadas com o profissional.", orders: "Meus pedidos", agenda: "Minha agenda", included: "Sessões incluídas", onePayment: "Pagamento único pelo valor total apresentado", assisted: "Contratação com apoio da equipe", contact: "Consultar atendimento", pay: "Continuar para pagamento", preparing: "Preparando…", error: "Não foi possível iniciar a contratação. Tente novamente ou consulte o atendimento." },
  en: { title: "From choosing a service to your appointment", refresh: "Refresh status", pendingPayment: "Payment has not been confirmed yet. If you have already paid, please wait and refresh the order status.", paid: "Payment confirmed. Check your credits and request a time in My schedule.", noResults: "No service matches this currency or search. Contact our team for other options.", steps: ["Choose the service and check the total price.", "Wait for payment and credits to be confirmed on your order.", "Request a time in My schedule.", "Our team confirms the appointment and releases the meeting link."], note: "Payment does not automatically reserve a time. Duration and modality are confirmed with the professional.", orders: "My orders", agenda: "My schedule", included: "Sessions included", onePayment: "One payment for the total price shown", assisted: "Assisted booking", contact: "Contact our team", pay: "Continue to payment", preparing: "Preparing…", error: "We could not start your booking. Try again or contact our team." },
  fr: { title: "Du choix du service au rendez-vous", refresh: "Actualiser le statut", pendingPayment: "Le paiement n’est pas encore confirmé. Si vous avez déjà payé, patientez puis actualisez le statut de la commande.", paid: "Paiement confirmé. Consultez vos crédits et demandez un créneau dans Mon agenda.", noResults: "Aucun service ne correspond à cette devise ou recherche. Contactez notre équipe pour d’autres options.", steps: ["Choisissez le service et vérifiez le prix total.", "Attendez la confirmation du paiement et des crédits dans votre commande.", "Demandez un créneau dans Mon agenda.", "L’équipe confirme le rendez-vous et donne accès au lien de réunion."], note: "Le paiement ne réserve pas automatiquement un créneau. La durée et la modalité sont confirmées avec le professionnel.", orders: "Mes commandes", agenda: "Mon agenda", included: "Séances incluses", onePayment: "Un paiement pour le prix total indiqué", assisted: "Réservation accompagnée", contact: "Contacter notre équipe", pay: "Continuer vers le paiement", preparing: "Préparation…", error: "Impossible de commencer la réservation. Réessayez ou contactez notre équipe." },
  es: { title: "Del servicio elegido a tu cita", refresh: "Actualizar estado", pendingPayment: "El pago todavía no está confirmado. Si ya pagaste, espera y actualiza el estado del pedido.", paid: "Pago confirmado. Consulta tus créditos y solicita un horario en Mi agenda.", noResults: "No hay servicios que coincidan con esta moneda o búsqueda. Consulta al equipo para otras opciones.", steps: ["Elige el servicio y comprueba el precio total.", "Espera la confirmación del pago y los créditos en tu pedido.", "Solicita un horario en Mi agenda.", "El equipo confirma la cita y habilita el enlace de la reunión."], note: "El pago no reserva un horario automáticamente. La duración y la modalidad se confirman con el profesional.", orders: "Mis pedidos", agenda: "Mi agenda", included: "Sesiones incluidas", onePayment: "Un pago por el precio total indicado", assisted: "Contratación asistida", contact: "Consultar al equipo", pay: "Continuar al pago", preparing: "Preparando…", error: "No se pudo iniciar la contratación. Inténtalo de nuevo o consulta al equipo." },
} as const;

export function useServicePurchaseCopy() {
  return COPY[useI18n().locale];
}

export function ServicePurchaseJourney() {
  const c = useServicePurchaseCopy();
  return <section className="s8-card">
    <h2 className="font-serif text-2xl">{c.title}</h2>
    <ol className="mt-4 grid list-inside list-decimal gap-3 text-sm sm:grid-cols-2">
      {c.steps.map((step) => <li key={step} className="rounded-xl bg-muted/50 p-3">{step}</li>)}
    </ol>
    <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <Link to="/cliente/pedidos" className="rounded-lg border px-4 py-2 text-sm font-bold">{c.orders}</Link>
      <Link to="/cliente/agenda" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{c.agenda}</Link>
    </div>
  </section>;
}

export function IndividualServiceSummary({ sessions }: { sessions: number }) {
  const c = useServicePurchaseCopy();
  return <div className="mt-3 text-sm text-muted-foreground">
    <p><strong>{c.included}: {sessions}</strong></p>
    <p className="mt-1">{c.onePayment}</p>
    <p className="mt-2 text-xs">{c.note}</p>
  </div>;
}

export function ServiceCheckoutAction({ name, enabled, busy, pending, onCheckout }: {
  name: string; enabled: boolean; busy: boolean; pending: boolean; onCheckout: () => void;
}) {
  const c = useServicePurchaseCopy();
  if (enabled) return <button type="button" disabled={busy} onClick={onCheckout}
    className="mt-4 min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60">
    {pending ? c.preparing : c.pay}
  </button>;
  return <div className="mt-4">
    <p className="text-xs font-semibold text-muted-foreground">{c.assisted}</p>
    <a href={`/falar-com-ecossistema?assunto=${encodeURIComponent(name)}&source=contratar-servico-individual`}
      className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary">
      {c.contact}
    </a>
  </div>;
}
