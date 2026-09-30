import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { aiReadyAccess, aiReadyCheckout } from "@/lib/ai-ready.functions";
import { CheckCircle2, Download, ShieldCheck } from "lucide-react";

export const Route=createFileRoute("/_clientarea/cliente/ai-ready")({component:AiReadyClient});

const lessons=[
 ["1. Fundamentos de IA generativa","O que são modelos generativos, onde ajudam e por que não devem ser tratados como fonte infalível."],
 ["2. IA no ambiente profissional","Defina finalidades permitidas, responsáveis e situações que exigem aprovação humana."],
 ["3. Dados, privacidade e confidencialidade","Não inserir segredos comerciais, dados pessoais sensíveis ou informações de clientes sem base e controles adequados."],
 ["4. Erros e alucinações","Resultados podem conter fatos, referências ou conclusões incorretas. Revise antes de usar."],
 ["5. Revisão humana","Decisões relevantes não devem ser delegadas cegamente à ferramenta. Registre responsáveis e critérios."],
 ["6. Boas práticas para equipes","Use instruções claras, valide fontes, minimize dados, documente usos relevantes e reporte incidentes."],
 ["7. Checklist final","Antes de usar uma saída de IA: posso compartilhar estes dados? verifiquei fatos? existe impacto sobre pessoas? alguém precisa revisar?"],
];

function AiReadyClient(){
 const accessFn=useServerFn(aiReadyAccess),checkoutFn=useServerFn(aiReadyCheckout);
 const q=useQuery({queryKey:["ai-ready-access"],queryFn:()=>accessFn({})});
 const checkout=useMutation({mutationFn:(market:"BR"|"INTL")=>checkoutFn({data:{market}}),onSuccess:r=>{location.href=r.url}});
 if(q.isLoading)return <div className="p-8">Carregando AI READY 2026…</div>;
 if(!q.data?.entitled)return <div className="mx-auto max-w-3xl space-y-6 py-8"><section className="rounded-[28px] bg-[#071426] p-7 text-white"><p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">AI READY 2026</p><h1 className="mt-3 font-serif text-4xl font-bold">Prepare sua empresa para o uso responsável de IA.</h1><p className="mt-4 text-sm leading-6 text-white/75">Treinamento + kit empresarial + certificados de conclusão para até 10 colaboradores.</p></section><section className="rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl font-bold text-[#0b2341]">Oferta de lançamento</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={checkout.isPending} onClick={()=>checkout.mutate("INTL")} className="min-h-12 rounded-xl bg-[#0b2341] px-5 font-black text-white">Comprar por €49</button><button disabled={checkout.isPending} onClick={()=>checkout.mutate("BR")} className="min-h-12 rounded-xl border border-[#0b2341] px-5 font-black text-[#0b2341]">Comprar por R$297</button></div>{checkout.error&&<p className="mt-3 text-sm text-red-700">{String(checkout.error.message)}</p>}<p className="mt-4 text-xs leading-5 text-slate-500">Pagamento único. Programa educacional; não constitui certificação governamental, parecer jurídico ou garantia de conformidade.</p></section></div>;
 return <div className="mx-auto max-w-4xl space-y-6 py-8"><section className="rounded-[28px] bg-[#071426] p-7 text-white"><div className="flex items-center gap-3"><CheckCircle2 className="h-7 w-7 text-[#d6ad63]"/><p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">Acesso liberado</p></div><h1 className="mt-4 font-serif text-4xl font-bold">AI READY 2026</h1><p className="mt-3 text-sm text-white/75">Treinamento empresarial de alfabetização e uso responsável de Inteligência Artificial.</p></section><section className="rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl font-bold text-[#0b2341]">Treinamento essencial</h2><div className="mt-5 space-y-3">{lessons.map(([t,d])=><article key={t} className="rounded-xl border bg-slate-50 p-4"><h3 className="font-black text-[#0b2341]">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></article>)}</div></section><section className="rounded-2xl border bg-[#fffaf0] p-6"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#9a6c20]"/><h2 className="font-serif text-2xl font-bold text-[#0b2341]">Kit empresarial</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Política interna, checklist, inventário de ferramentas e guia de RH serão disponibilizados aqui em formato para uso interno. A primeira versão comercial preserva o treinamento e o acesso pago enquanto os documentos finais são publicados.</p><span className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold text-slate-500"><Download className="h-4 w-4"/> Materiais em preparação</span></section></div>
}
