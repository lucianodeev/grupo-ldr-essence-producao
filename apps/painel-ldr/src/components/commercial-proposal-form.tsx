import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useId, useState, type FormEvent } from "react";
import { submitEcosystemSupport } from "@/lib/ecosystem-support.functions";
import {
  COMMERCIAL_INTERESTS,
  COMMERCIAL_SOLUTIONS,
  commercialProtocol,
  commercialSupportPayload,
} from "@/lib/commercial-request";

export type CommercialSolution = (typeof COMMERCIAL_SOLUTIONS)[number];

export function CommercialProposalForm({
  solution,
  source,
  briefingHint = "Inclua objetivos, dimensão da equipa e prazo desejado.",
}: {
  solution?: CommercialSolution;
  source?: "integracao-colaboradores" | "servicos-profissionais";
  briefingHint?: string;
}) {
  const helpId = useId();
  const send = useServerFn(submitEcosystemSupport);
  const [sending, setSending] = useState(false),
    [protocol, setProtocol] = useState(""),
    [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || protocol) return;
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    try {
      const payload = commercialSupportPayload({
        source:
          source === "integracao-colaboradores" &&
          form.get("solution") !== "Integração de novos colaboradores"
            ? undefined
            : source,
        organization: form.get("organization"),
        name: form.get("name"),
        email: form.get("email"),
        interest: form.get("interest"),
        solution: form.get("solution"),
        message: form.get("message"),
        consent: form.get("consent") === "on",
        website: form.get("website") || "",
      });
      setProtocol(commercialProtocol(await send({ data: payload })));
    } catch {
      setError(
        "Não foi possível confirmar o pedido. Verifique os campos ou utilize o atendimento institucional.",
      );
    } finally {
      setSending(false);
    }
  }
  const field =
    "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#866a3c]";
  return (
    <section
      aria-label="Pedido de proposta"
      className="rounded-3xl border border-[#d8c9a9] bg-white p-5 sm:p-8"
    >
      {protocol ? (
        <div role="status">
          <h2 className="font-serif text-3xl">Pedido recebido</h2>
          <p className="mt-4">
            Protocolo: <strong className="break-all">{protocol}</strong>.
          </p>
          <p className="mt-3">
            A equipa recebe o pedido na central administrativa e analisará a sua necessidade. O
            pedido não constitui contrato nem ativa uma cobrança. Se houver proposta comercial, o
            preço e as condições serão apresentados para aprovação antes de qualquer pagamento
            Stripe. Para acompanhar a proposta, entre na Minha Área com o mesmo e-mail informado
            neste pedido. Serviços com agenda só podem ser agendados após confirmação do pagamento.
          </p>
          <Link to="/cliente/propostas" className="mt-6 inline-block font-bold underline">
            Acompanhar minhas propostas
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-5" aria-busy={sending}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              Organização
              <input
                name="organization"
                required
                minLength={2}
                maxLength={160}
                autoComplete="organization"
                className={field}
              />
            </label>
            <label>
              Nome de contacto
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                className={field}
              />
            </label>
          </div>
          <label>
            E-mail profissional
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className={field}
            />
          </label>
          <label>
            Tipo de pedido
            <select name="interest" className={field}>
              {COMMERCIAL_INTERESTS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Solução de interesse
            <select
              name="solution"
              defaultValue={solution ?? "Soluções personalizadas"}
              className={field}
            >
              {COMMERCIAL_SOLUTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Como podemos ajudar?
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={3000}
              rows={6}
              className={field}
              aria-describedby={helpId}
            />
          </label>
          <p id={helpId} className="text-sm leading-6 text-slate-600">
            {briefingHint} Não envie dados clínicos, documentos de candidatos, senhas ou dados
            financeiros.
          </p>
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <label className="flex items-start gap-3 text-sm leading-6">
            <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0" />
            Autorizo o uso destes dados para analisar e responder a este pedido.
          </label>
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-800">
              {error}
            </p>
          )}
          <button
            disabled={sending}
            className="min-h-12 rounded-xl bg-[#12233a] px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {sending ? "A enviar…" : "Enviar pedido institucional"}
          </button>
        </form>
      )}
    </section>
  );
}
