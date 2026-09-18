import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  ClipboardCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/empresa/candidaturas")({
  component: CompanyApplications,
});

const C = {
  pt: {
    back: "Voltar ao LDR Carreira",
    eyebrow: "Área da empresa",
    title: "Triagem responsável de candidaturas",
    sub: "Base para receber candidaturas pelo perfil, analisar aderência e proteger dados sensíveis de acessibilidade.",
    preview: "Página de preparação visual. A conexão com dados reais será ativada após validação da estrutura do banco.",
    stagesTitle: "Fluxo sugerido",
    received: "Recebidas",
    receivedText: "Candidaturas chegam organizadas por vaga, perfil e dados de contato.",
    review: "Em análise",
    reviewText: "Avaliação objetiva de experiência, requisitos, disponibilidade e aderência à vaga.",
    interview: "Convite/entrevista",
    interviewText: "Contato com o candidato respeitando preferência de comunicação e possíveis adaptações.",
    finalists: "Finalistas",
    finalistsText: "Registro de decisão com motivo claro, respeitoso e verificável.",
    rulesTitle: "Regras de triagem inclusiva",
    ruleOne: "Avalie primeiro aderência técnica, experiência, disponibilidade e requisitos da vaga.",
    ruleTwo: "Use informações de acessibilidade somente para organizar adaptações, apoio e comunicação.",
    ruleThree: "Nunca trate PcD, apoio de comunicação ou necessidade de adaptação como critério negativo.",
    ruleFour: "Registre decisões com motivo objetivo e linguagem respeitosa.",
    nextTitle: "Próxima conexão",
    nextText: "Na próxima etapa, esta tela poderá ler candidaturas de career_applications e usar career_interest_leads como fallback enquanto a estrutura final não estiver aplicada.",
    safetyTitle: "Proteção da empresa e do candidato",
    safetyText: "A triagem responsável reduz risco de recusa injusta, melhora a documentação do processo e protege dados sensíveis.",
  },
  en: {
    back: "Back to LDR Careers",
    eyebrow: "Company area",
    title: "Responsible application screening",
    sub: "A base to receive profile applications, assess fit and protect sensitive accessibility data.",
    preview: "Visual preparation page. Real data connection will be activated after the database structure is validated.",
    stagesTitle: "Suggested flow",
    received: "Received",
    receivedText: "Applications arrive organized by job, profile and contact data.",
    review: "Under review",
    reviewText: "Objective assessment of experience, requirements, availability and job fit.",
    interview: "Invite/interview",
    interviewText: "Contact the candidate respecting communication preference and possible adjustments.",
    finalists: "Finalists",
    finalistsText: "Decision record with a clear, respectful and verifiable reason.",
    rulesTitle: "Inclusive screening rules",
    ruleOne: "Assess technical fit, experience, availability and job requirements first.",
    ruleTwo: "Use accessibility information only to organize adjustments, support and communication.",
    ruleThree: "Never treat disability, communication support or adjustment needs as a negative screening criterion.",
    ruleFour: "Record decisions with an objective reason and respectful language.",
    nextTitle: "Next connection",
    nextText: "In the next step, this screen can read applications from career_applications and use career_interest_leads as a fallback while the final structure is not applied.",
    safetyTitle: "Company and candidate protection",
    safetyText: "Responsible screening reduces unfair rejection risk, improves process documentation and protects sensitive data.",
  },
  fr: {
    back: "Retour à LDR Carrière",
    eyebrow: "Espace entreprise",
    title: "Tri responsable des candidatures",
    sub: "Base pour recevoir les candidatures via profil, évaluer l’adéquation et protéger les données sensibles d’accessibilité.",
    preview: "Page de préparation visuelle. La connexion aux données réelles sera activée après validation de la structure de la base.",
    stagesTitle: "Flux suggéré",
    received: "Reçues",
    receivedText: "Les candidatures arrivent organisées par offre, profil et données de contact.",
    review: "En analyse",
    reviewText: "Évaluation objective de l’expérience, des exigences, de la disponibilité et de l’adéquation au poste.",
    interview: "Invitation/entretien",
    interviewText: "Contact avec le candidat en respectant sa préférence de communication et les adaptations possibles.",
    finalists: "Finalistes",
    finalistsText: "Enregistrement de la décision avec une raison claire, respectueuse et vérifiable.",
    rulesTitle: "Règles de tri inclusif",
    ruleOne: "Évaluez d’abord l’adéquation technique, l’expérience, la disponibilité et les exigences du poste.",
    ruleTwo: "Utilisez les informations d’accessibilité uniquement pour organiser adaptations, soutien et communication.",
    ruleThree: "Ne traitez jamais le handicap, l’appui de communication ou les besoins d’adaptation comme un critère négatif.",
    ruleFour: "Enregistrez les décisions avec un motif objectif et un langage respectueux.",
    nextTitle: "Prochaine connexion",
    nextText: "À l’étape suivante, cet écran pourra lire les candidatures depuis career_applications et utiliser career_interest_leads comme fallback tant que la structure finale n’est pas appliquée.",
    safetyTitle: "Protection de l’entreprise et du candidat",
    safetyText: "Un tri responsable réduit le risque de refus injuste, améliore la documentation du processus et protège les données sensibles.",
  },
  es: {
    back: "Volver a LDR Carrera",
    eyebrow: "Área de empresa",
    title: "Selección responsable de candidaturas",
    sub: "Base para recibir candidaturas desde el perfil, analizar afinidad y proteger datos sensibles de accesibilidad.",
    preview: "Página de preparación visual. La conexión con datos reales se activará después de validar la estructura de la base.",
    stagesTitle: "Flujo sugerido",
    received: "Recibidas",
    receivedText: "Las candidaturas llegan organizadas por vacante, perfil y datos de contacto.",
    review: "En análisis",
    reviewText: "Evaluación objetiva de experiencia, requisitos, disponibilidad y afinidad con la vacante.",
    interview: "Invitación/entrevista",
    interviewText: "Contacto con la persona candidata respetando preferencia de comunicación y posibles adaptaciones.",
    finalists: "Finalistas",
    finalistsText: "Registro de decisión con motivo claro, respetuoso y verificable.",
    rulesTitle: "Reglas de selección inclusiva",
    ruleOne: "Evalúa primero afinidad técnica, experiencia, disponibilidad y requisitos de la vacante.",
    ruleTwo: "Usa información de accesibilidad solo para organizar adaptaciones, apoyo y comunicación.",
    ruleThree: "Nunca trates discapacidad, apoyo de comunicación o necesidad de adaptación como criterio negativo.",
    ruleFour: "Registra decisiones con motivo objetivo y lenguaje respetuoso.",
    nextTitle: "Próxima conexión",
    nextText: "En la próxima etapa, esta pantalla podrá leer candidaturas desde career_applications y usar career_interest_leads como fallback mientras la estructura final no esté aplicada.",
    safetyTitle: "Protección de la empresa y de la persona candidata",
    safetyText: "La selección responsable reduce riesgo de rechazo injusto, mejora la documentación del proceso y protege datos sensibles.",
  },
} as const;

function CompanyApplications() {
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;

  const stages = [
    { title: t.received, text: t.receivedText, icon: UsersRound },
    { title: t.review, text: t.reviewText, icon: ClipboardCheck },
    { title: t.interview, text: t.interviewText, icon: BriefcaseBusiness },
    { title: t.finalists, text: t.finalistsText, icon: ShieldCheck },
  ];

  const rules = [t.ruleOne, t.ruleTwo, t.ruleThree, t.ruleFour];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/carreira"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#07345b] shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
          >
            <ArrowLeft size={16} aria-hidden="true" /> {t.back}
          </Link>
          <LanguageSelect />
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl bg-[#07345b] text-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-9">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                <BriefcaseBusiness size={16} aria-hidden="true" /> {t.eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/85">{t.sub}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
              <p className="flex items-start gap-3 text-sm leading-6 text-white/90">
                <AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
                <span>{t.preview}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#07345b]">{t.stagesTitle}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <article key={stage.title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#07345b]/10 text-[#07345b]">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-950">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stage.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#07345b]">
              <Accessibility size={24} aria-hidden="true" /> {t.rulesTitle}
            </h2>
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={18} aria-hidden="true" />
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-950 shadow-sm">
              <h2 className="text-xl font-bold">{t.safetyTitle}</h2>
              <p className="mt-3 text-sm leading-6">{t.safetyText}</p>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-blue-950 shadow-sm">
              <h2 className="text-xl font-bold">{t.nextTitle}</h2>
              <p className="mt-3 text-sm leading-6">{t.nextText}</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
