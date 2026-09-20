import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/falar-com-ecossistema")({
  head: () => ({ meta: [{ title: "Falar com o Ecossistema | LDR" }, { name: "description", content: "Central de suporte, serviços e contato do Ecossistema LDR. Atendimento em até 7 dias." }] }),
  component: EcosystemSupport,
});

const subjects = [
  "Solicitação de serviço", "Quero falar com Luciano", "Assinatura e pagamentos",
  "Problema com compra ou acesso", "Suporte técnico", "Empresa", "Parceria",
  "Imprensa e mídia", "Quero conhecer o Ecossistema", "Outro assunto",
];

function EcosystemSupport() {
  const [sending, setSending] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [error, setError] = useState("");
  const sourceUrl = useMemo(() => typeof window === "undefined" ? "" : document.referrer || window.location.href, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true); setError("");
    const data = new FormData(event.currentTarget);
    const subject = String(data.get("subject") || "");
    const supportDb = supabase as any;\n    const { data: row, error: insertError } = await supportDb.from("ecosystem_contacts").insert({
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim() || null,
      subject,
      message: String(data.get("message") || "").trim(),
      source_project: "LDR Academy / Ecossistema",
      source_url: sourceUrl,
      language: "pt",
      wants_luciano: subject === "Quero falar com Luciano",
      consent_contact: data.get("consent") === "on",
    }).select("protocol").single();
    setSending(false);
    if (insertError || !row) { setError("Não foi possível registrar agora. Tente novamente em alguns instantes."); return; }
    setProtocol(row.protocol);
  }

  if (protocol) return (
    <main className="min-h-screen bg-[#f8f1e7] px-5 py-16 text-[#25170f]">
      <section className="mx-auto max-w-2xl rounded-[32px] border border-[#d6ad63]/50 bg-white p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Solicitação recebida</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Obrigado por falar com o Ecossistema LDR.</h1>
        <p className="mt-4 text-[#6f6358]">Seu protocolo é <strong>{protocol}</strong>. Sua solicitação será respondida em até 7 dias.</p>
        <Link to="/ecossistema" className="mt-7 inline-flex rounded-full bg-[#1d3158] px-6 py-3 text-sm font-black text-white">Voltar ao Ecossistema</Link>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f8f1e7] px-5 py-12 text-[#25170f]">
      <section className="mx-auto max-w-3xl">
        <Link to="/ecossistema" className="text-sm font-bold text-[#8a4c18]">← Voltar ao Ecossistema</Link>
        <div className="mt-6 rounded-[32px] border border-[#d6ad63]/50 bg-white p-6 shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Central única de atendimento</p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Falar com o Ecossistema</h1>
          <p className="mt-4 text-base leading-7 text-[#6f6358]">Quer conhecer melhor nossos projetos, solicitar um serviço, tirar uma dúvida ou falar comigo? <strong>Venha falar comigo também.</strong></p>
          <p className="mt-2 text-sm font-bold text-[#1d3158]">Respondemos às solicitações em até 7 dias.</p>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">Nome<input name="name" required minLength={2} maxLength={120} className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">E-mail<input name="email" type="email" required maxLength={254} className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">WhatsApp / telefone <span className="font-normal text-[#6f6358]">(opcional)</span><input name="phone" maxLength={40} className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">Assunto<select name="subject" required className="rounded-xl border bg-white px-4 py-3 font-normal">{subjects.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-bold">Mensagem<textarea name="message" required minLength={5} maxLength={4000} rows={6} className="rounded-xl border px-4 py-3 font-normal" /></label>
            <label className="flex items-start gap-3 text-sm text-[#6f6358]"><input name="consent" type="checkbox" required className="mt-1" /><span>Autorizo o uso destes dados para responder à minha solicitação.</span></label>
            {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
            <button disabled={sending} className="rounded-xl bg-[#1d3158] px-6 py-4 text-sm font-black uppercase tracking-[.1em] text-white disabled:opacity-60">{sending ? "Enviando…" : "Enviar solicitação"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
