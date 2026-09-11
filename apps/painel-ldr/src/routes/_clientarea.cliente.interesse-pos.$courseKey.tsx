import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useClientContext } from "@/lib/client-portal-data";
import { postgraduateCourseTitle } from "@/lib/postgraduate-interest.catalog";
import { clientSubmitPostgraduateInterest } from "@/lib/postgraduate-interest.functions";

export const Route = createFileRoute("/_clientarea/cliente/interesse-pos/$courseKey")({
  component: PostgraduateInterestForm,
});

function PostgraduateInterestForm() {
  const { courseKey } = Route.useParams();
  const courseTitle = postgraduateCourseTitle(courseKey);
  const context = useClientContext();
  const submitFn = useServerFn(clientSubmitPostgraduateInterest);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const customer = context.data?.status === "ok" ? context.data.customer : null;

  useEffect(() => {
    if (!customer) return;
    setFullName((current) => current || customer.fullName || "");
    setEmail((current) => current || customer.email || "");
    setPhone((current) => current || customer.phone || "");
  }, [customer]);

  const submit = useMutation({
    mutationFn: () => submitFn({ data: { courseKey, fullName, email, phone } }),
    onSuccess: () => {
      setSent(true);
      toast.success("Interesse registrado. Entraremos em contato sobre o lançamento.");
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível registrar seu interesse."),
  });

  if (!courseTitle) {
    return <section className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm"><h1 className="font-serif text-2xl text-[#0B1F3A]">Curso não encontrado</h1><Link to="/cliente/biblioteca" className="mt-4 inline-flex rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Voltar à Biblioteca</Link></section>;
  }

  if (sent) {
    return <section className="mx-auto max-w-xl rounded-[28px] border border-[#C7A33B]/50 bg-[#F8F3E8] p-6 text-center shadow-sm sm:p-8"><span className="text-4xl">🎓</span><h1 className="mt-4 font-serif text-3xl text-[#0B1F3A]">Interesse registrado</h1><p className="mt-3 text-sm leading-6 text-slate-600">Recebemos seus dados para <strong>{courseTitle}</strong>. A equipe LDR poderá entrar em contato quando houver novidades sobre o lançamento.</p><Link to="/cliente/biblioteca" className="mt-6 inline-flex rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white">Voltar à Biblioteca</Link></section>;
  }

  return <div className="mx-auto max-w-2xl space-y-5">
    <section className="rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#102d50] p-6 text-white shadow-xl sm:p-8">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#d6ad63]">🎓 Pós-Graduação · Lançamento em breve</p>
      <h1 className="mt-3 font-serif text-3xl text-[#fff7e7]">Tenho interesse</h1>
      <p className="mt-3 text-sm leading-6 text-white/75">{courseTitle}</p>
    </section>

    <section className="rounded-[28px] border border-[#d6ad63]/40 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-serif text-2xl text-[#0B1F3A]">Entre na lista de interessados</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Preencha seus dados para receber contato da LDR sobre este curso quando houver novidades de lançamento.</p>
      <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); submit.mutate(); }}>
        <div><label htmlFor="interest-name" className="mb-1.5 block text-sm font-bold text-[#0B1F3A]">Nome completo</label><input id="interest-name" autoComplete="name" required minLength={2} maxLength={160} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C7A33B] focus:ring-2 focus:ring-[#C7A33B]/20" /></div>
        <div><label htmlFor="interest-phone" className="mb-1.5 block text-sm font-bold text-[#0B1F3A]">Telefone / WhatsApp</label><input id="interest-phone" type="tel" autoComplete="tel" required maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Inclua o código do país e DDD" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C7A33B] focus:ring-2 focus:ring-[#C7A33B]/20" /></div>
        <div><label htmlFor="interest-email" className="mb-1.5 block text-sm font-bold text-[#0B1F3A]">E-mail</label><input id="interest-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C7A33B] focus:ring-2 focus:ring-[#C7A33B]/20" /></div>
        <p className="rounded-xl bg-[#F8F3E8] p-3 text-xs leading-5 text-slate-600">Ao enviar, você autoriza a LDR a entrar em contato pelos dados informados exclusivamente sobre este curso e seu lançamento.</p>
        <button type="submit" disabled={submit.isPending} className="w-full rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#14345d] disabled:opacity-60">{submit.isPending ? "Enviando…" : "Registrar meu interesse"}</button>
      </form>
      <Link to="/cliente/biblioteca" className="mt-4 inline-flex text-sm font-bold text-[#0B1F3A] underline">← Voltar à Biblioteca</Link>
    </section>
  </div>;
}
