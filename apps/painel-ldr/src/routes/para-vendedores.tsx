import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/para-vendedores")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Seja Vendedor Independente — Grupo LDR Essence" },
    { name: "description", content: "Cadastre-se para vender produtos e serviços do Grupo LDR Essence e receber comissões por vendas confirmadas." },
  ]}),
  component: SellerLanding,
});

const COMMISSIONS = [
  ["Produtos digitais", "20%"], ["Treinamentos", "15%"], ["Mentoria e carreira", "15%"],
  ["Marketing e criação de sites", "15%"], ["Bem-estar e serviços individuais", "10%"],
  ["Recrutamento", "10%"], ["Contratos empresariais", "7,5%"],
];

function SellerLanding() {
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [form,setForm]=useState({full_name:"",email:"",phone:"",country:"",preferred_currency:"EUR",experience:""});
  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    const { error }=await supabase.from("seller_applications" as any).insert(form as any);
    setBusy(false);
    if(error){toast.error("Não foi possível enviar sua candidatura.");return;}
    setDone(true); toast.success("Candidatura enviada para análise.");
  }
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"><div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div><p className="text-sm font-black uppercase tracking-[.18em] text-primary">Rede Comercial LDR</p><h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Venda. Conecte. Cresça com o Grupo LDR Essence.</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Estamos formando uma rede de vendedores independentes para apresentar nossos produtos e serviços no Brasil e na Europa. Você organiza sua própria rotina e recebe comissão sobre vendas confirmadas.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#cadastro" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Quero me cadastrar</a><Link to="/login" className="rounded-xl border px-5 py-3 font-bold">Já sou vendedor</Link></div><p className="mt-5 text-xs leading-5 text-muted-foreground">Atuação independente, sem salário fixo. A aprovação da candidatura é necessária antes do acesso ao painel comercial.</p></div>
      <div className="s8-card"><h2 className="font-serif text-2xl">Comissões iniciais</h2><div className="mt-4 divide-y">{COMMISSIONS.map(([name,rate])=><div key={name} className="flex items-center justify-between gap-4 py-3"><span className="text-sm">{name}</span><strong className="text-lg text-primary">{rate}</strong></div>)}</div></div>
    </div></section>
    <section id="cadastro" className="border-t bg-muted/30"><div className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><div className="s8-card"><h2 className="font-serif text-3xl">Candidate-se à Rede Comercial LDR</h2><p className="mt-2 text-sm text-muted-foreground">Após análise, você receberá orientação para acessar o painel e começar a registrar suas vendas.</p>{done?<div className="mt-6 rounded-xl border bg-background p-5"><strong>Candidatura recebida.</strong><p className="mt-2 text-sm text-muted-foreground">Nossa equipe fará a análise e entrará em contato pelos dados informados.</p></div>:<form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><div><label className="s8-label">Nome completo</label><input required className="s8-field" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div><div><label className="s8-label">E-mail</label><input required type="email" className="s8-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label className="s8-label">WhatsApp</label><input className="s8-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div><label className="s8-label">País</label><input required className="s8-field" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div><div><label className="s8-label">Moeda preferida</label><select className="s8-field" value={form.preferred_currency} onChange={e=>setForm({...form,preferred_currency:e.target.value})}><option value="EUR">Euro (EUR)</option><option value="BRL">Real (BRL)</option></select></div><div className="sm:col-span-2"><label className="s8-label">Experiência comercial (opcional)</label><textarea className="s8-field min-h-28" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}/></div><div className="sm:col-span-2"><button disabled={busy} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60">{busy?"Enviando...":"Enviar candidatura"}</button></div></form>}</div></div></section>
  </main></div>;
}
