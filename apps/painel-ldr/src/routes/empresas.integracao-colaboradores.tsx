import { Link, createFileRoute } from "@tanstack/react-router";
import { EnterprisePage } from "@/components/enterprise-page";
import { ONBOARDING_CHECKLIST, ONBOARDING_SOLUTION, ONBOARDING_SOURCE, onboardingChecklistText } from "@/lib/employee-onboarding";

export const Route = createFileRoute("/empresas/integracao-colaboradores")({
  head: () => ({
    meta: [
      { title: "Integração de novos colaboradores | Ecossistema LDR" },
      { name: "description", content: "Organize os primeiros 30 dias de um novo colaborador: plano de acolhimento, manual adaptado, checklist do gestor e acompanhamento. Checklist básico gratuito e proposta personalizada." },
    ],
    links: [{ rel: "canonical", href: "https://ldrecossistema.online/empresas/integracao-colaboradores" }],
  }),
  component: EmployeeOnboarding,
});

const stages = [
  { number: "01", period: "Preparar a chegada", detail: "Antes do primeiro dia", text: "Identificar a função, os intervenientes e os recursos necessários. A empresa valida quem recebe o colaborador e quem resolve cada pendência.", output: "Plano de acolhimento e responsabilidades." },
  { number: "02", period: "Dar contexto e orientação", detail: "Primeiro dia", text: "Apresentar a equipa, os canais de comunicação e as primeiras tarefas. O manual reúne a informação prática que o colaborador precisa de consultar.", output: "Manual de acolhimento adaptado à empresa." },
  { number: "03", period: "Acompanhar a prática", detail: "Primeira semana", text: "Combinar objetivos observáveis e acompanhar as primeiras atividades. O gestor identifica dúvidas, acessos em falta e necessidades de apoio.", output: "Checklist do gestor e pontos de acompanhamento." },
  { number: "04", period: "Rever e dar continuidade", detail: "Até ao dia 30", text: "Rever o percurso com o gestor, recolher feedback e definir o que precisa de continuidade. As decisões ficam registadas com um responsável.", output: "Reunião de encerramento e plano de ações." },
];

const deliverables = [
  ["Plano dos primeiros 30 dias", "Sequência de ações com marcos, responsáveis e datas ajustados à função e à modalidade de trabalho."],
  ["Manual de acolhimento", "Documento editável com apresentação da empresa, contactos úteis, canais de comunicação e orientações internas validadas pela organização."],
  ["Checklist do gestor", "Instrumento para verificar a preparação, acompanhar tarefas e resolver pendências, com espaço para responsável e prazo."],
  ["Acompanhamento e encerramento", "Pontos de revisão e reunião final para consolidar feedback, decisões e próximos passos. Quantidade, participantes e formato definidos na proposta."],
];

function ProposalButton({ secondary = false }: { secondary?: boolean }) {
  return <Link to="/empresas/proposta" search={{ solution: ONBOARDING_SOLUTION, source: ONBOARDING_SOURCE }}
    className={`inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-center font-bold focus-visible:outline-2 focus-visible:outline-offset-4 ${secondary ? "border border-[#12233a] text-[#12233a]" : "bg-[#12233a] text-white"}`}>
    Solicitar proposta gratuita
  </Link>;
}

function EmployeeOnboarding() {
  const download = `data:text/plain;charset=utf-8,${encodeURIComponent(onboardingChecklistText())}`;
  return <EnterprisePage title="Uma chegada preparada. Um primeiro mês com direção."
    intro="Integração de novos colaboradores para pequenas empresas: organize o acolhimento, distribua responsabilidades e acompanhe os primeiros 30 dias com um plano que a equipa consegue pôr em prática.">
    <section aria-label="Começar a integração" className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-3xl bg-[#12233a] p-6 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e5d2ac]">Integração de novos colaboradores</p>
        <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-white">Da contratação às primeiras tarefas, cada pessoa sabe qual é o próximo passo.</h2>
        <p className="mt-5 leading-7 text-slate-200">Quando as orientações ficam dispersas, o novo colaborador depende de descobrir sozinho como trabalhar. A LDR ajuda a transformar essas informações num percurso organizado, com o gestor como referência.</p>
        <p className="mt-5 text-sm leading-6 text-slate-200">Indicado para empresas que vão receber pessoas, abrir uma equipa ou organizar um processo de acolhimento que hoje depende de instruções informais.</p>
      </div>
      <aside className="flex flex-col justify-between rounded-3xl border border-[#d8c9a9] bg-white p-6 sm:p-8">
        <div><p className="text-sm font-bold text-[#866a3c]">Comece com o que precisa agora</p>
          <h2 className="mt-3 font-serif text-2xl font-bold">Um recurso gratuito ou um plano acompanhado.</h2>
          <p className="mt-4 leading-7 text-slate-600">Utilize o checklist básico por sua conta. Para adaptar os materiais e organizar o acompanhamento, peça uma proposta com âmbito, prazo e valor definidos.</p></div>
        <div className="mt-6 flex flex-col gap-3"><ProposalButton /><a href="#checklist-gratuito" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d8c9a9] px-5 py-3 text-center font-bold">Ver checklist gratuito</a></div>
      </aside>
    </section>

    <section aria-labelledby="onboarding-plan" className="mt-16">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#866a3c]">O percurso</p>
      <h2 id="onboarding-plan" className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Os primeiros 30 dias, organizados em quatro etapas.</h2>
      <p className="mt-4 max-w-3xl leading-7 text-slate-600">O plano conta a partir da entrada do colaborador. A preparação dos materiais começa no prazo acordado após a contratação; datas e intervenientes são confirmados com a empresa.</p>
      <ol className="mt-7 grid gap-5 md:grid-cols-2">{stages.map(stage => <li key={stage.number} className="rounded-2xl border border-[#d8c9a9] bg-white p-6">
        <div className="flex items-center justify-between gap-4"><span className="font-serif text-4xl text-[#866a3c]">{stage.number}</span><span className="text-sm text-slate-600">{stage.detail}</span></div>
        <h3 className="mt-4 font-serif text-2xl font-bold">{stage.period}</h3><p className="mt-3 leading-7 text-slate-600">{stage.text}</p>
        <p className="mt-5 border-t border-slate-200 pt-4 text-sm font-semibold">Entrega: {stage.output}</p>
      </li>)}</ol>
    </section>

    <section aria-labelledby="onboarding-deliverables" className="mt-16 rounded-3xl border border-[#d8c9a9] bg-white p-6 sm:p-9">
      <h2 id="onboarding-deliverables" className="font-serif text-3xl font-bold">O que pode integrar a sua proposta.</h2>
      <dl className="mt-7 grid gap-7 sm:grid-cols-2">{deliverables.map(([title, text]) => <div key={title}><dt className="text-lg font-bold">{title}</dt><dd className="mt-2 leading-7 text-slate-600">{text}</dd></div>)}</dl>
      <p className="mt-7 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-600">Para dimensionar o trabalho, analisamos o número de pessoas e funções, a data de entrada, os materiais existentes e a disponibilidade do gestor. A empresa valida o conteúdo interno e mantém a responsabilidade pela gestão dos colaboradores.</p>
    </section>

    <section id="checklist-gratuito" aria-labelledby="onboarding-checklist" className="mt-16 scroll-mt-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#866a3c]">Acesso livre · Sem registo ou pagamento</p>
      <h2 id="onboarding-checklist" className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Checklist básico para começar hoje.</h2>
      <p className="mt-4 max-w-3xl leading-7 text-slate-600">Doze ações para preparar a chegada e acompanhar o primeiro mês. No ficheiro editável, preencha o responsável, o prazo e o estado de cada ação.</p>
      <a href={download} download="LDR-checklist-integracao-colaboradores.txt" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#12233a] px-6 py-3 text-center font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4">Descarregar checklist gratuito (.txt)</a>
      <ol className="mt-7 grid gap-4 sm:grid-cols-2">{ONBOARDING_CHECKLIST.map((item, index) => <li key={item.task} className="rounded-2xl border border-[#d8c9a9] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#866a3c]">{String(index + 1).padStart(2, "0")} · {item.period}</p>
        <p className="mt-3 font-semibold leading-7">{item.task}</p><p className="mt-2 text-sm leading-6 text-slate-600">Verificação: {item.evidence}</p>
      </li>)}</ol>
      <p className="mt-5 text-sm leading-7 text-slate-600">Adapte o recurso aos procedimentos da empresa. Não inclua palavras-passe, documentos de identificação ou dados clínicos. O checklist organiza o acolhimento e não substitui obrigações laborais ou formação obrigatória.</p>
    </section>

    <section aria-labelledby="onboarding-hiring" className="mt-16 rounded-3xl border border-[#d8c9a9] bg-[#eee8dc] p-6 sm:p-9">
      <h2 id="onboarding-hiring" className="font-serif text-3xl font-bold">Como contratar o acompanhamento.</h2>
      <ol className="mt-6 grid gap-5 sm:grid-cols-2">
        <li><h3 className="font-bold">1. Apresente a necessidade</h3><p className="mt-2 leading-7 text-slate-700">O pedido de proposta é gratuito. Indique funções, número de pessoas, modalidade de trabalho e data prevista de entrada.</p></li>
        <li><h3 className="font-bold">2. Reveja a proposta</h3><p className="mt-2 leading-7 text-slate-700">A equipa prepara e aprova o âmbito, as entregas, o prazo e o valor. A proposta fica disponível na Minha Área, na conta com o mesmo e-mail do pedido.</p></li>
        <li><h3 className="font-bold">3. Aceite e pague com segurança</h3><p className="mt-2 leading-7 text-slate-700">Após o seu aceite, o pagamento é feito pelo Stripe. Solicitar informação ou descarregar o checklist não gera cobrança.</p></li>
        <li><h3 className="font-bold">4. Acompanhe a execução</h3><p className="mt-2 leading-7 text-slate-700">A execução começa após confirmação segura do pagamento, no prazo acordado. Reuniões são organizadas conforme a proposta; quando há sessões agendáveis, o agendamento só é liberado após o pagamento.</p></li>
      </ol><div className="mt-7"><ProposalButton /></div>
    </section>

    <section aria-labelledby="onboarding-questions" className="mt-16">
      <h2 id="onboarding-questions" className="font-serif text-3xl font-bold">Antes de pedir a proposta.</h2>
      <div className="mt-6 divide-y divide-[#d8c9a9] border-y border-[#d8c9a9]">
        {[
          ["A empresa precisa de ter departamento de RH?", "Não. O trabalho pode ser organizado com o responsável da empresa ou o gestor da equipa. É necessário indicar uma pessoa que valide os materiais e acompanhe a integração."],
          ["O programa serve para trabalho remoto?", "Sim, o plano pode considerar equipas presenciais, remotas ou híbridas. A proposta confirma canais de comunicação, intervenientes e formato das reuniões."],
          ["Qual é o preço e quando começa?", "Não há preço fixo nesta página. O valor e o prazo são definidos após analisar o âmbito. A proposta aprovada apresenta as condições antes do aceite e do pagamento."],
          ["A LDR substitui o gestor ou garante a permanência do colaborador?", "O gestor continua responsável pela orientação e pelas decisões de gestão. O serviço organiza o acolhimento e o acompanhamento; não garante retenção, desempenho ou resultados individuais."],
        ].map(([question, answer]) => <details key={question} className="py-5"><summary className="cursor-pointer text-lg font-semibold leading-7 focus-visible:outline-2 focus-visible:outline-offset-4">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-slate-600">{answer}</p></details>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-4"><ProposalButton secondary /><Link to="/empresas/servicos" className="inline-flex min-h-12 items-center px-2 font-bold underline">Explorar serviços empresariais</Link></div>
    </section>
  </EnterprisePage>;
}
