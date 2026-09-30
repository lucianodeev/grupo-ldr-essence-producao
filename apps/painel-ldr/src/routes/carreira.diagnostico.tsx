import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { professionalDiagnosticAccess, professionalDiagnosticCheckout } from "@/lib/professional-diagnostic.functions";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Target } from "lucide-react";

export const Route = createFileRoute("/carreira/diagnostico")({
  head: () => ({ meta: [
    { title: "Diagnóstico Profissional LDR | LDR Carreira" },
    { name: "description", content: "Responda 12 perguntas e receba uma leitura prática do seu momento profissional e um plano de 30 dias." },
  ] }),
  component: DiagnosticoProfissional,
});

type Answer = { value: string; score: number };
const questions = [
  { id:"momento", title:"Como você se sente em relação ao seu momento profissional?", options:[["Estou perdido e não sei por onde começar",0],["Sei que preciso mudar, mas ainda não tenho direção",1],["Tenho uma direção, mas falta um plano",2],["Estou avançando e quero acelerar",3]] },
  { id:"objetivo", title:"Seu principal objetivo profissional hoje é:", options:[["Conseguir meu primeiro trabalho",1],["Mudar de emprego ou área",2],["Crescer onde já estou",3],["Criar ou ampliar meu próprio negócio",3]] },
  { id:"clareza", title:"Quão claro está o cargo, área ou resultado que você quer alcançar?", options:[["Nada claro",0],["Tenho algumas ideias",1],["Tenho uma direção definida",2],["Sei exatamente o que quero",3]] },
  { id:"experiencia", title:"Quanto da sua experiência atual ajuda no próximo passo que você deseja?", options:[["Ainda não consigo identificar",0],["Pouco",1],["Uma parte importante",2],["Muito",3]] },
  { id:"competencias", title:"Você consegue citar competências que já domina e provar onde as utilizou?", options:[["Ainda não",0],["Consigo citar, mas sem evidências claras",1],["Tenho algumas evidências",2],["Sim, tenho exemplos e resultados concretos",3]] },
  { id:"mercado", title:"Você sabe o que o mercado exige para o objetivo que escolheu?", options:[["Não",0],["Muito pouco",1],["Tenho uma boa noção",2],["Sim, pesquisei requisitos e oportunidades",3]] },
  { id:"curriculo", title:"Seu currículo ou perfil profissional comunica claramente seus resultados?", options:[["Não tenho ou está desatualizado",0],["Precisa de bastante melhoria",1],["Está razoavelmente preparado",2],["Está atualizado e orientado a resultados",3]] },
  { id:"rede", title:"Sua rede de contatos pode ajudar você a chegar ao próximo passo?", options:[["Não tenho uma rede ativa",0],["Tenho poucos contatos",1],["Tenho contatos relevantes",2],["Cultivo relacionamentos profissionais regularmente",3]] },
  { id:"aprendizado", title:"Quando identifica uma competência que falta, o que costuma fazer?", options:[["Adio ou não sei por onde começar",0],["Pesquiso, mas nem sempre executo",1],["Crio um plano e começo a aprender",2],["Aprendo, pratico e produzo evidências",3]] },
  { id:"execucao", title:"Nas últimas 4 semanas, quantas ações concretas você realizou pelo seu objetivo?", options:[["Nenhuma",0],["1 ou 2",1],["3 a 5",2],["Mais de 5",3]] },
  { id:"obstaculo", title:"Qual é o principal obstáculo hoje?", options:[["Não sei qual caminho seguir",0],["Falta de competência ou experiência",1],["Falta de tempo, organização ou consistência",1],["Falta de acesso a oportunidades ou contatos",1]] },
  { id:"prazo", title:"Quando você gostaria de perceber uma mudança concreta?", options:[["Nos próximos 30 dias",3],["Em até 3 meses",2],["Em 3 a 6 meses",1],["Ainda não defini um prazo",0]] },
] as const;

const evidenceLabels: Record<string,string> = {
  clareza:"clareza de objetivo", competencias:"competências com evidências", mercado:"leitura do mercado",
  curriculo:"comunicação profissional", rede:"rede de contatos", aprendizado:"aprendizagem aplicada", execucao:"execução recente",
};

function buildResult(answers: Record<string,Answer>) {
  const ranked = Object.entries(answers).filter(([k])=>evidenceLabels[k]).map(([k,a])=>({key:k,label:evidenceLabels[k],score:a.score,answer:a.value})).sort((a,b)=>b.score-a.score);
  const strengths=ranked.filter(x=>x.score>=2).slice(0,3);
  const gaps=[...ranked].sort((a,b)=>a.score-b.score).filter(x=>x.score<3).slice(0,3);
  const avg=ranked.reduce((s,x)=>s+x.score,0)/Math.max(ranked.length,1);
  const stage=avg<1?"Organizar a base":avg<2?"Transformar intenção em direção":avg<2.6?"Converter direção em evidências":"Acelerar com foco";
  const actions=gaps.map((g,i)=>({
    title:i===0?"Prioridade desta semana":i===1?"Segunda ação":"Terceira ação",
    text:g.key==="clareza"?"Escolha um objetivo profissional principal e descreva cargo/área, contexto e prazo."
      :g.key==="competencias"?"Liste 3 competências importantes para seu objetivo e associe cada uma a um exemplo real do que você já fez."
      :g.key==="mercado"?"Analise 10 oportunidades reais do seu objetivo e registre os 5 requisitos que mais se repetem."
      :g.key==="curriculo"?"Reescreva o resumo e 3 experiências do currículo usando ação + contexto + resultado."
      :g.key==="rede"?"Selecione 5 pessoas relevantes e faça contatos individuais com uma pergunta específica sobre sua área-alvo."
      :g.key==="aprendizado"?"Escolha uma competência prioritária e produza uma pequena evidência prática dela nesta semana."
      :"Reserve três blocos de 30 minutos nesta semana exclusivamente para executar ações ligadas ao seu objetivo."
  }));
  return {stage,strengths,gaps,actions};
}

function DiagnosticoProfissional(){
  const accessFn=useServerFn(professionalDiagnosticAccess),checkoutFn=useServerFn(professionalDiagnosticCheckout);
  const access=useQuery({queryKey:["professional-diagnostic-access"],queryFn:()=>accessFn({}),retry:false});
  const checkout=useMutation({mutationFn:(market:"BR"|"INTL")=>checkoutFn({data:{market}}),onSuccess:r=>{location.href=r.url}});
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Record<string,Answer>>({});
  const [reflection,setReflection]=useState({impact:"",tried:""});
  const objectiveDone=step>=questions.length;
  const done=objectiveDone&&reflection.impact.trim().length>=10&&reflection.tried.trim().length>=10;
  const result=useMemo(()=>done?buildResult(answers):null,[done,answers]);
  const q=questions[step];
  const choose=(value:string,score:number)=>{setAnswers(a=>({...a,[q.id]:{value,score}}));setStep(s=>s+1)};
  const restart=()=>{setAnswers({});setReflection({impact:"",tried:""});setStep(0)};
  if(access.isLoading)return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-3xl px-5 py-16 text-slate-600">Validando seu acesso…</div></main>;
  if(access.isError)return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-3xl px-5 py-12"><Link to="/cliente/login" search={{redirect:"/carreira/diagnostico"} as never} className="inline-flex min-h-12 items-center rounded-xl bg-[#07345b] px-6 font-black text-white">Entrar para comprar ou acessar</Link><p className="mt-3 text-sm text-slate-500">O diagnóstico fica vinculado à sua conta para que o pagamento possa liberar o acesso com segurança.</p></div></main>;
  if(!access.data?.entitled)return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-3xl px-5 py-10"><Link to="/carreira" className="text-sm font-bold text-[#07345b]">← LDR Carreira</Link><section className="mt-8 rounded-[28px] bg-[#07345b] p-7 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-[#f4c76b]">Diagnóstico Profissional LDR</p><h1 className="mt-3 text-3xl font-black md:text-4xl">Descubra seu próximo passo profissional em cerca de 10 minutos.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">12 perguntas objetivas + 2 reflexões. Receba uma leitura baseada nas suas respostas, prioridades, ações para as próximas 72 horas e plano de 30 dias.</p></section><section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[.18em] text-[#c99b2d]">Pagamento único</p><h2 className="mt-2 text-2xl font-black text-[#07345b]">Acesso completo ao diagnóstico</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={checkout.isPending} onClick={()=>checkout.mutate("INTL")} className="min-h-12 rounded-xl bg-[#07345b] px-5 font-black text-white">Comprar por €9,90</button><button disabled={checkout.isPending} onClick={()=>checkout.mutate("BR")} className="min-h-12 rounded-xl border border-[#07345b] px-5 font-black text-[#07345b]">Comprar por R$49</button></div>{checkout.error&&<p className="mt-3 text-sm text-red-700">{String(checkout.error.message)}</p>}<p className="mt-4 text-xs leading-5 text-slate-500">Pagamento processado pelo Stripe. As perguntas são liberadas automaticamente após a confirmação do pagamento.</p></section></div></main>;
  return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-3xl px-5 py-10">
    <Link to="/carreira" className="inline-flex items-center gap-2 text-sm font-bold text-[#07345b]"><ArrowLeft size={16}/> LDR Carreira</Link>
    {!objectiveDone?<><p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-[#c99b2d]">Diagnóstico Profissional LDR</p>
      <h1 className="mt-2 text-3xl font-black text-[#07345b] md:text-4xl">Descubra seu próximo passo profissional</h1>
      <p className="mt-3 text-slate-600">12 perguntas objetivas + 2 reflexões curtas · cerca de 10 minutos · resultado prático baseado nas suas respostas.</p>
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-[#c99b2d] transition-all" style={{width:`${(step/questions.length)*100}%`}}/></div>
      <p className="mt-3 text-sm font-bold text-slate-500">Pergunta {step+1} de {questions.length}</p>
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-black text-[#07345b]">{q.title}</h2>
        <div className="mt-5 grid gap-3">{q.options.map(([label,score])=><button key={label} onClick={()=>choose(label,score)} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left font-semibold transition hover:border-[#c99b2d] hover:bg-[#fff8e8]"><span>{label}</span><ArrowRight size={18}/></button>)}</div>
      </section>
      {step>0&&<button onClick={()=>setStep(s=>s-1)} className="mt-5 text-sm font-bold text-slate-500">← Voltar uma pergunta</button>}
    </>:result&&<><p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-[#c99b2d]">Seu diagnóstico</p>
      <h1 className="mt-2 text-4xl font-black text-[#07345b]">{result.stage}</h1>
      <p className="mt-3 text-slate-600">Esta leitura usa somente as respostas que você forneceu. Ela orienta desenvolvimento profissional e não garante emprego, renda ou contratação.</p>
      <section className="mt-8 rounded-3xl border-2 border-[#c99b2d] bg-[#fff8e8] p-6"><p className="text-xs font-black uppercase tracking-wide text-[#9a7115]">Sua decisão prioritária</p><h2 className="mt-2 text-2xl font-black text-[#07345b]">{result.actions[0]?.text??"Defina uma ação pequena e verificável para esta semana."}</h2><p className="mt-3 text-sm text-slate-600">Por quê: sua resposta sobre {result.gaps[0]?.label??"o momento profissional"} foi “{result.gaps[0]?.answer??"evidência insuficiente"}”.</p></section><section className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="flex items-center gap-2 text-xl font-black text-[#07345b]"><CheckCircle2/> Forças identificadas</h2><div className="mt-4 grid gap-3">{result.strengths.length?result.strengths.map(x=><div key={x.key} className="rounded-2xl bg-emerald-50 p-4"><strong className="capitalize">{x.label}</strong><p className="mt-1 text-sm text-slate-600">Evidência: “{x.answer}”.</p></div>):<p className="text-slate-600">Ainda não há evidência suficiente para destacar uma força. Isso é um ponto de partida, não uma avaliação negativa.</p>}</div></section>
      <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="flex items-center gap-2 text-xl font-black text-[#07345b]"><Target/> Prioridades de desenvolvimento</h2><div className="mt-4 grid gap-3">{result.gaps.map(x=><div key={x.key} className="rounded-2xl bg-amber-50 p-4"><strong className="capitalize">{x.label}</strong><p className="mt-1 text-sm text-slate-600">Base da leitura: “{x.answer}”.</p></div>)}</div></section>
      <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-black text-[#07345b]">Próximas 72 horas</h2><div className="mt-4 grid gap-3">{result.actions.slice(0,3).map((a,i)=><div key={a.title} className="rounded-2xl bg-slate-50 p-4"><strong>{i+1}. {a.text}</strong></div>)}</div></section><section className="mt-5 rounded-3xl bg-[#07345b] p-6 text-white shadow-sm"><h2 className="flex items-center gap-2 text-xl font-black"><Compass/> Seus próximos 30 dias</h2><div className="mt-5 grid gap-4">{result.actions.map((a,i)=><div key={a.title} className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-wide text-[#f4d47b]">Semana {i+1}</p><p className="mt-1 font-bold">{a.text}</p></div>)}<div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-wide text-[#f4d47b]">Semana 4</p><p className="mt-1 font-bold">Revise o que executou, registre evidências e escolha a próxima prioridade com base no que mudou.</p></div></div></section>
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black text-[#07345b]">Seu contexto, nas suas palavras</h2><p className="mt-3 text-sm font-bold">Mudança que teria maior impacto:</p><p className="mt-1 text-slate-600">{reflection.impact}</p><p className="mt-4 text-sm font-bold">O que você já tentou:</p><p className="mt-1 text-slate-600">{reflection.tried}</p></section><section className="mt-5 rounded-3xl bg-[#fff8e8] p-6"><h2 className="text-xl font-black text-[#07345b]">Reavalie em 30 dias</h2><p className="mt-2 text-slate-600">Volte ao diagnóstico após executar o plano. Compare suas respostas, registre novas evidências e veja se sua prioridade mudou.</p></section><div className="mt-6 flex flex-wrap gap-3"><Link to="/carreira/gps" className="rounded-xl bg-[#c99b2d] px-5 py-3 font-bold text-white">Levar objetivo ao Career GPS</Link><button onClick={restart} className="rounded-xl border border-[#07345b] px-5 py-3 font-bold text-[#07345b]">Refazer diagnóstico</button></div>
    </>}
  </div></main>
}
