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

const BENEFITS = [
  ["Treinamento inicial de vendas", "Introdução aos serviços, abordagem comercial, relacionamento com clientes e registro correto das vendas."],
  ["Orientação profissional", "Acesso gradual a conteúdos e orientações para fortalecer posicionamento, comunicação e desenvolvimento profissional."],
  ["Carreira internacional", "Trilha de desenvolvimento e orientação de carreira internacional oferecida progressivamente conforme evolução comercial."],
  ["Treinamentos do ecossistema", "Conforme sua evolução, você poderá usufruir gratuitamente de treinamentos e conteúdos que também fazem parte das soluções LDR."],
  ["Conhecimento multidisciplinar", "Contato com RH, carreira, empreendedorismo, tecnologia, bem-estar e desenvolvimento humano."],
  ["Reconhecimento por desenvolvimento", "Novos benefícios e oportunidades internas de desenvolvimento podem ser liberados conforme metas e consistência."],
] as const;

const CATALOG = [
  ["Pessoas e bem-estar", "Psicanálise, Mentoria, Orientação Profissional, Transição de Carreira e Carreira Internacional."],
  ["Empresas e RH", "Recrutamento operacional e especializado, Consultoria de RH e planos empresariais."],
  ["Bem-estar corporativo", "Massagem Laboral e Hora de Bem-Estar LDR."],
  ["Educação", "Treinamentos empresariais e Plataforma de Treinamento para Empreendedores."],
  ["Marketing e tecnologia", "Marketing, presença digital, sites profissionais, sistemas e automações."],
  ["Produtos digitais e livros", "eBook A Coragem de Começar e O Menino que Vendia Mamão."],
] as const;

function SellerLanding() {
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [form,setForm]=useState({full_name:"",email:"",phone:"",country:"",preferred_currency:"EUR",experience:""});
  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    const { error }=await (supabase as any).from("seller_applications").insert(form);
    setBusy(false);
    if(error){toast.error("Não foi possível enviar sua candidatura.");return;}
    setDone(true); toast.success("Candidatura enviada para análise.");
  }
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"><div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
      <div><p className="text-sm font-black uppercase tracking-[.18em] text-primary">Oportunidade comercial</p><h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">Cresça vendendo soluções de um ecossistema internacional.</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">O Grupo LDR Essence reúne recursos humanos, carreira, desenvolvimento humano, bem-estar, empreendedorismo e soluções digitais. Como parceiro comercial independente, você apresenta essas soluções a novos clientes e recebe comissão pelas vendas confirmadas.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#cadastro" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Quero fazer parte</a><a href="#catalogo" className="rounded-xl border px-5 py-3 font-bold">Conhecer o que vou vender</a><Link to="/login" className="rounded-xl border px-5 py-3 font-bold">Já sou vendedor</Link></div><p className="mt-5 text-xs leading-5 text-muted-foreground">Atuação independente, sem salário fixo. A aprovação da candidatura é necessária antes do acesso ao painel comercial.</p></div>
      <div className="s8-card"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Sobre o Grupo</p><h2 className="mt-2 font-serif text-2xl">Um ecossistema para pessoas, empresas e empreendedores.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">A LDR conecta serviços de RH, bem-estar, saúde mental, carreira, mentoria, tecnologia e educação empreendedora em uma atuação internacional. O vendedor entra como profissional independente e pode desenvolver conhecimento comercial enquanto amplia sua experiência com diferentes áreas do ecossistema.</p></div>
    </div></section>

    <section className="border-y bg-muted/30"><div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Desenvolvimento gradual</p><h2 className="mt-2 max-w-4xl font-serif text-3xl">Quanto mais você evolui, mais recursos do ecossistema pode acessar.</h2><p className="mt-3 text-sm text-muted-foreground">Benefícios são liberados gradualmente conforme metas, desempenho e critérios internos.</p><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{BENEFITS.map(([title,text],index)=><article key={title} className="s8-card"><span className="text-sm font-black text-primary">{String(index+1).padStart(2,"0")}</span><h3 className="mt-2 font-serif text-xl">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div><div className="mt-6 rounded-xl border border-primary/25 bg-background p-5 text-sm leading-6"><strong>Modelo de atuação independente.</strong> <span className="text-muted-foreground">O vendedor atua como prestador de serviços/profissional independente, mediante contrato de prestação de serviços, sem salário fixo, subordinação ou garantia de renda. A remuneração comercial é exclusivamente por comissão sobre vendas validadas.</span></div></div></section>

    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><div className="grid gap-6 lg:grid-cols-2"><div className="s8-card"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Comissões</p><h2 className="mt-2 font-serif text-3xl">Você sempre sabe quanto pode ganhar.</h2><div className="mt-5 divide-y">{COMMISSIONS.map(([name,rate])=><div key={name} className="flex items-center justify-between gap-4 py-3"><span className="text-sm">{name}</span><strong className="text-lg text-primary">{rate}</strong></div>)}</div><p className="mt-5 text-xs leading-5 text-muted-foreground">A comissão é calculada automaticamente conforme a categoria e liberada após conferência da venda pela LDR. Pagamentos são realizados quinzenalmente, no dia 15 e no último dia do mês.</p></div>
      <div id="catalogo" className="s8-card scroll-mt-24"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catálogo LDR</p><h2 className="mt-2 font-serif text-3xl">Entenda o que você vai apresentar aos clientes.</h2><p className="mt-2 text-sm text-muted-foreground">O catálogo completo também fica disponível dentro do seu painel.</p><div className="mt-5 space-y-3">{CATALOG.map(([title,text])=><div key={title} className="rounded-xl border p-4"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></div></section>

    <section className="border-y bg-muted/30"><div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Quem lidera o Grupo</p><h2 className="mt-2 font-serif text-3xl">Estratégia com essência humana.</h2><p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">Luciano Rodrigues Almeida é psicanalista, mentor, gestor de projetos e CEO do Grupo LDR Essence. Sua trajetória conecta desenvolvimento humano, empreendedorismo, gestão de pessoas e visão prática de negócios. A proposta da Rede Comercial é criar uma experiência em que o parceiro aprenda enquanto vende e amplie gradualmente seu repertório profissional.</p><blockquote className="mt-5 max-w-3xl border-l-4 border-primary pl-4 font-serif text-xl">“O sucesso sustentável nasce quando estratégia, pessoas e propósito avançam juntos.”</blockquote></div></section>
    <section id="cadastro" className="scroll-mt-24"><div className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><div className="s8-card"><h2 className="font-serif text-3xl">Quero começar</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Cadastre-se como parceiro comercial independente. Após a análise, você receberá orientação para acessar o painel e começar a registrar suas vendas.</p>{done?<div className="mt-6 rounded-xl border bg-background p-5"><strong>Candidatura recebida.</strong><p className="mt-2 text-sm text-muted-foreground">Nossa equipe fará a análise e entrará em contato pelos dados informados.</p></div>:<form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><div><label className="s8-label">Nome completo</label><input required className="s8-field" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div><div><label className="s8-label">E-mail</label><input required type="email" className="s8-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label className="s8-label">WhatsApp</label><input className="s8-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div><label className="s8-label">País</label><input required className="s8-field" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div><div><label className="s8-label">Moeda preferida</label><select className="s8-field" value={form.preferred_currency} onChange={e=>setForm({...form,preferred_currency:e.target.value})}><option value="EUR">Euro (EUR)</option><option value="BRL">Real (BRL)</option></select></div><div className="sm:col-span-2"><label className="s8-label">Experiência comercial (opcional)</label><textarea className="s8-field min-h-28" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}/></div><div className="sm:col-span-2"><button disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60">{busy?"Enviando...":"Enviar candidatura"}</button></div></form>}</div></div></section>
  </main></div>;
}
