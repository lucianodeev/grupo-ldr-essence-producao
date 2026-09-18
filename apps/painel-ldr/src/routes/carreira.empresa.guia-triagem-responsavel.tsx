import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, FileCheck2, Scale, ShieldCheck, UserCheck } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/empresa/guia-triagem-responsavel")({
  component: ResponsibleTriageGuide,
});

const C = {
  pt: {
    back: "Voltar para área da empresa",
    badge: "LDR Carreira • Guia de triagem responsável",
    title: "Como avaliar candidaturas sem aumentar o risco de reprovação injusta",
    sub: "Um guia prático para empresas analisarem candidatos com critérios objetivos, linguagem respeitosa e uso correto das informações de acessibilidade.",
    principleTitle: "Princípio central",
    principle: "A acessibilidade deve servir para adaptar o processo seletivo, melhorar a comunicação e garantir participação justa — nunca para reduzir a chance de uma pessoa ser chamada.",
    doTitle: "O que considerar na triagem",
    dontTitle: "O que não deve ser usado como filtro negativo",
    decisionTitle: "Registro responsável da decisão",
    flowTitle: "Fluxo recomendado",
    legalTitle: "Atenção jurídica e ética",
    legal: "A empresa continua responsável por cumprir a legislação aplicável no país da vaga. Este guia organiza boas práticas, mas não substitui orientação jurídica quando necessária.",
    doItems: [
      "Experiência relacionada à função.",
      "Requisitos mínimos realmente necessários para a vaga.",
      "Disponibilidade compatível com a modalidade informada.",
      "Competências técnicas e comportamentais descritas no anúncio.",
      "Necessidade de adaptação razoável para entrevista, comunicação ou ambiente de trabalho.",
    ],
    dontItems: [
      "Deficiência, condição de saúde ou necessidade de acessibilidade como motivo automático de recusa.",
      "Pedido de entrevista online, intérprete, apoio de comunicação ou adaptação de horário.",
      "Ausência de foto, idade, aparência, origem, gênero, orientação sexual ou religião.",
      "Informações sensíveis que não sejam necessárias para avaliar a função.",
    ],
    flow: [
      "Ler primeiro o perfil profissional e a experiência.",
      "Comparar com os requisitos mínimos da vaga.",
      "Separar dúvidas objetivas para uma conversa curta com a pessoa candidata.",
      "Verificar adaptações necessárias somente para permitir participação justa.",
      "Registrar o motivo da decisão com linguagem neutra e profissional.",
    ],
    decision: [
      "Use frases como: ‘não atende ao requisito técnico X informado na vaga’.“",
      "Evite frases vagas como: ‘não tem perfil’, ‘não se encaixa’ ou ‘pode ser difícil adaptar’.“",
      "Quando houver dúvida, marque para análise humana em vez de recusar automaticamente.",
    ],
  },
  en: {
    back: "Back to company area",
    badge: "LDR Carreira • Responsible screening guide",
    title: "How to review applications without increasing unfair rejection risk",
    sub: "A practical guide for companies to review candidates using objective criteria, respectful language and proper use of accessibility information.",
    principleTitle: "Core principle",
    principle: "Accessibility information should help adapt the hiring process, improve communication and ensure fair participation — never reduce someone’s chance of being contacted.",
    doTitle: "What to consider during screening",
    dontTitle: "What should not be used as a negative filter",
    decisionTitle: "Responsible decision record",
    flowTitle: "Recommended flow",
    legalTitle: "Legal and ethical attention",
    legal: "The company remains responsible for complying with the applicable law in the job country. This guide organizes good practices, but does not replace legal advice when needed.",
    doItems: [
      "Experience related to the role.",
      "Minimum requirements that are truly necessary for the position.",
      "Availability aligned with the stated work mode.",
      "Technical and behavioral skills described in the job post.",
      "Reasonable accommodation needs for interview, communication or workplace access.",
    ],
    dontItems: [
      "Disability, health condition or accessibility need as an automatic rejection reason.",
      "Requests for online interview, interpreter, communication support or schedule adjustment.",
      "No photo, age, appearance, origin, gender, sexual orientation or religion.",
      "Sensitive information that is not necessary to evaluate the role.",
    ],
    flow: [
      "Read the professional profile and experience first.",
      "Compare it with the minimum job requirements.",
      "Separate objective questions for a short conversation with the candidate.",
      "Check accommodation needs only to enable fair participation.",
      "Record the decision reason using neutral and professional language.",
    ],
    decision: [
      "Use wording such as: ‘does not meet technical requirement X stated in the job post’.“",
      "Avoid vague wording such as: ‘not a fit’, ‘does not match’ or ‘may be hard to accommodate’.“",
      "When in doubt, mark for human review instead of rejecting automatically.",
    ],
  },
  fr: {
    back: "Retour à l’espace entreprise",
    badge: "LDR Carreira • Guide de triage responsable",
    title: "Comment analyser les candidatures sans augmenter le risque de refus injuste",
    sub: "Un guide pratique pour aider les entreprises à examiner les candidatures avec des critères objectifs, un langage respectueux et une utilisation correcte des informations d’accessibilité.",
    principleTitle: "Principe central",
    principle: "L’accessibilité doit servir à adapter le processus de sélection, améliorer la communication et garantir une participation équitable — jamais à réduire les chances d’une personne d’être contactée.",
    doTitle: "Ce qu’il faut considérer pendant le triage",
    dontTitle: "Ce qui ne doit pas être utilisé comme filtre négatif",
    decisionTitle: "Traçabilité responsable de la décision",
    flowTitle: "Flux recommandé",
    legalTitle: "Attention juridique et éthique",
    legal: "L’entreprise reste responsable du respect de la législation applicable dans le pays de l’offre. Ce guide organise de bonnes pratiques, mais ne remplace pas un avis juridique si nécessaire.",
    doItems: [
      "Expérience liée à la fonction.",
      "Exigences minimales réellement nécessaires pour le poste.",
      "Disponibilité compatible avec la modalité annoncée.",
      "Compétences techniques et comportementales décrites dans l’offre.",
      "Besoins d’aménagement raisonnable pour l’entretien, la communication ou l’accès au lieu de travail.",
    ],
    dontItems: [
      "Handicap, état de santé ou besoin d’accessibilité comme motif automatique de refus.",
      "Demande d’entretien en ligne, d’interprète, de soutien à la communication ou d’adaptation d’horaire.",
      "Absence de photo, âge, apparence, origine, genre, orientation sexuelle ou religion.",
      "Informations sensibles non nécessaires à l’évaluation de la fonction.",
    ],
    flow: [
      "Lire d’abord le profil professionnel et l’expérience.",
      "Comparer avec les exigences minimales de l’offre.",
      "Séparer les questions objectives pour un bref échange avec la personne candidate.",
      "Vérifier les aménagements uniquement pour permettre une participation équitable.",
      "Documenter le motif de la décision avec un langage neutre et professionnel.",
    ],
    decision: [
      "Utiliser des formulations comme : ‘ne répond pas à l’exigence technique X indiquée dans l’offre’.“",
      "Éviter des formulations vagues comme : ‘pas le bon profil’, ‘ne correspond pas’ ou ‘difficile à adapter’.“",
      "En cas de doute, marquer pour revue humaine au lieu de refuser automatiquement.",
    ],
  },
  es: {
    back: "Volver al área de empresa",
    badge: "LDR Carreira • Guía de selección responsable",
    title: "Cómo evaluar candidaturas sin aumentar el riesgo de rechazo injusto",
    sub: "Una guía práctica para que las empresas analicen candidaturas con criterios objetivos, lenguaje respetuoso y uso correcto de la información de accesibilidad.",
    principleTitle: "Principio central",
    principle: "La accesibilidad debe servir para adaptar el proceso de selección, mejorar la comunicación y garantizar participación justa — nunca para reducir la posibilidad de que una persona sea contactada.",
    doTitle: "Qué considerar en la selección",
    dontTitle: "Qué no debe usarse como filtro negativo",
    decisionTitle: "Registro responsable de la decisión",
    flowTitle: "Flujo recomendado",
    legalTitle: "Atención jurídica y ética",
    legal: "La empresa sigue siendo responsable de cumplir la legislación aplicable en el país de la vacante. Esta guía organiza buenas prácticas, pero no sustituye orientación jurídica cuando sea necesaria.",
    doItems: [
      "Experiencia relacionada con la función.",
      "Requisitos mínimos realmente necesarios para la vacante.",
      "Disponibilidad compatible con la modalidad informada.",
      "Competencias técnicas y comportamentales descritas en el anuncio.",
      "Necesidad de ajuste razonable para entrevista, comunicación o acceso al lugar de trabajo.",
    ],
    dontItems: [
      "Discapacidad, condición de salud o necesidad de accesibilidad como motivo automático de rechazo.",
      "Solicitud de entrevista online, intérprete, apoyo de comunicación o ajuste de horario.",
      "Ausencia de foto, edad, apariencia, origen, género, orientación sexual o religión.",
      "Información sensible que no sea necesaria para evaluar la función.",
    ],
    flow: [
      "Leer primero el perfil profesional y la experiencia.",
      "Comparar con los requisitos mínimos de la vacante.",
      "Separar dudas objetivas para una conversación breve con la persona candidata.",
      "Verificar ajustes necesarios solo para permitir participación justa.",
      "Registrar el motivo de la decisión con lenguaje neutro y profesional.",
    ],
    decision: [
      "Usar frases como: ‘no cumple el requisito técnico X informado en la vacante’.“",
      "Evitar frases vagas como: ‘no tiene perfil’, ‘no encaja’ o ‘puede ser difícil adaptar’.“",
      "Ante la duda, marcar para revisión humana en vez de rechazar automáticamente.",
    ],
  },
} as const;

type Copy = (typeof C)[keyof typeof C];

function ResponsibleTriageGuide() {
  const { locale } = useI18n();
  const t: Copy = C[locale as keyof typeof C] ?? C.pt;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link reloadDocument to="/carreira/empresa" className="inline-flex items-center gap-2 text-sm font-semibold text-[#07345b] hover:text-[#0b477a]">
            <ArrowLeft size={18} aria-hidden="true" />
            {t.back}
          </Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#052844] via-[#07345b] to-[#0b477a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            {t.badge}
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-white/80">{t.sub}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold">{t.principleTitle}</h2>
              <p className="mt-2 leading-relaxed">{t.principle}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GuideCard icon={<UserCheck aria-hidden="true" />} title={t.doTitle} items={t.doItems} tone="positive" />
          <GuideCard icon={<Scale aria-hidden="true" />} title={t.dontTitle} items={t.dontItems} tone="warning" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GuideCard icon={<FileCheck2 aria-hidden="true" />} title={t.flowTitle} items={t.flow} />
          <GuideCard icon={<CheckCircle2 aria-hidden="true" />} title={t.decisionTitle} items={t.decision} />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#07345b]">{t.legalTitle}</h2>
          <p className="mt-2 text-slate-600">{t.legal}</p>
        </div>
      </section>
    </main>
  );
}

function GuideCard({ icon, title, items, tone = "neutral" }: { icon: React.ReactNode; title: string; items: readonly string[]; tone?: "neutral" | "positive" | "warning" }) {
  const toneClass = tone === "positive" ? "border-emerald-200 bg-emerald-50" : tone === "warning" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white";
  return (
    <article className={`rounded-3xl border p-6 shadow-sm ${toneClass}`}>
      <div className="flex items-center gap-3 text-[#07345b]">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#c99b2d]" size={18} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
