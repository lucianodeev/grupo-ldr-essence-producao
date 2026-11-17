import { Link, createFileRoute } from "@tanstack/react-router";
import { EnterprisePage } from "@/components/enterprise-page";
import { CommercialProposalForm } from "@/components/commercial-proposal-form";
import { COMMERCIAL_SOLUTIONS } from "@/lib/commercial-request";
type ProposalSearch = { solution?: (typeof COMMERCIAL_SOLUTIONS)[number]; source?: "integracao-colaboradores" };
export const Route = createFileRoute("/empresas/proposta")({validateSearch:(search:Record<string,unknown>):ProposalSearch=>{const solution=COMMERCIAL_SOLUTIONS.find(value=>value===search["solution"]);return {...(solution?{solution}:{}),...(search["source"]==="integracao-colaboradores"?{source:"integracao-colaboradores" as const}:{})}},head:()=>({meta:[{title:"Proposta empresarial | Ecossistema LDR"}],links:[{rel:"canonical",href:"https://ldrecossistema.online/empresas/proposta"}]}),component:Proposal});
function Proposal(){
  const search=Route.useSearch();
  return <EnterprisePage title="Vamos construir a proposta certa." intro="Contratação, demonstrações, formação, parcerias e licenciamento. Apresente as necessidades da sua organização ao atendimento comercial institucional.">
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><CommercialProposalForm {...search}/><aside className="space-y-5 text-sm leading-7 text-slate-600"><h2 className="font-serif text-2xl font-bold text-[#12233a]">O próximo passo</h2><p>Analisamos o âmbito, os recursos e a disponibilidade para preparar uma proposta. Preços, prazos, direitos de acesso e condições serão confirmados por escrito. Não é necessário pagar para pedir orçamento; nunca envie dados de cartão por este formulário.</p><p>Parcerias, licenças e aquisições estão sujeitas a análise específica. Uma manifestação de interesse não representa um acordo concluído.</p><Link to="/falar-com-ecossistema" className="inline-block font-bold underline">Contactar o atendimento institucional</Link></aside></div>
  </EnterprisePage>;
}
