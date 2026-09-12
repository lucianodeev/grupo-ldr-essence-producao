import type { LibraryCardLocale } from "@/lib/library-card-i18n";

const COPY = {
  pt: {
    undergradSection:"🎓 Graduações · Em breve", undergradTitle:"Futuras graduações LDR", undergradIntro:"Propostas acadêmicas preliminares em modelo Live Semipresencial. Conheça as grades e registre seu interesse no lançamento.",
    duration:"Duração prevista:", years:"anos", semesters:"semestres", modality:"Modalidade:", live:"🔴 Live + 🏫 Semipresencial", value:"Valor:", from:"a partir de R$ 99,90/mês*", know:"CONHECER A PROPOSTA",
    postgradSection:"🎓 Pós-Graduações · Lançamento em breve", postgradTitle:"Sua próxima especialização pode começar aqui.", postgradIntro:"Novas pós-graduações online estão sendo desenvolvidas para unir conhecimento, mercado e aplicação prática.", featured:"DESTAQUE", postgradLabel:"Pós-Graduação · Em breve", interested:"Tenho interesse",
    professionalSection:"📚 Formações Profissionais", professionalTitle:"Formações para desenvolver sua prática profissional", professionalIntro:"Acesse as formações já disponíveis na Biblioteca LDR sem alterar suas regras atuais de compra e acesso.",
  },
  en: {
    undergradSection:"🎓 Undergraduate Degrees · Coming soon", undergradTitle:"Future LDR undergraduate degrees", undergradIntro:"Preliminary academic proposals in a live hybrid model. Explore the curricula and register your interest for launch.",
    duration:"Expected duration:", years:"years", semesters:"semesters", modality:"Mode:", live:"🔴 Live + 🏫 Hybrid", value:"Price:", from:"from R$ 99.90/month*", know:"VIEW THE PROPOSAL",
    postgradSection:"🎓 Postgraduate Programs · Coming soon", postgradTitle:"Your next specialization can start here.", postgradIntro:"New online postgraduate programs are being developed to connect knowledge, the market and practical application.", featured:"FEATURED", postgradLabel:"Postgraduate · Coming soon", interested:"I'm interested",
    professionalSection:"📚 Professional Training", professionalTitle:"Training to develop your professional practice", professionalIntro:"Access the professional training already available in the LDR Library without changing current purchase and access rules.",
  },
  fr: {
    undergradSection:"🎓 Licences · Bientôt", undergradTitle:"Futures licences LDR", undergradIntro:"Propositions académiques préliminaires en format hybride avec direct. Consultez les programmes et signalez votre intérêt pour le lancement.",
    duration:"Durée prévue :", years:"ans", semesters:"semestres", modality:"Modalité :", live:"🔴 Direct + 🏫 Hybride", value:"Valeur :", from:"à partir de R$ 99,90/mois*", know:"DÉCOUVRIR LA PROPOSITION",
    postgradSection:"🎓 Postgraduations · Bientôt", postgradTitle:"Votre prochaine spécialisation peut commencer ici.", postgradIntro:"De nouveaux programmes de spécialisation en ligne sont en développement pour relier connaissances, marché et pratique.", featured:"À LA UNE", postgradLabel:"Postgraduation · Bientôt", interested:"Je suis intéressé",
    professionalSection:"📚 Formations Professionnelles", professionalTitle:"Des formations pour développer votre pratique professionnelle", professionalIntro:"Accédez aux formations déjà disponibles dans la Bibliothèque LDR sans modifier les règles actuelles d'achat et d'accès.",
  },
  es: {
    undergradSection:"🎓 Grados · Próximamente", undergradTitle:"Futuros grados LDR", undergradIntro:"Propuestas académicas preliminares en modalidad híbrida en vivo. Conoce los planes y registra tu interés para el lanzamiento.",
    duration:"Duración prevista:", years:"años", semesters:"semestres", modality:"Modalidad:", live:"🔴 En vivo + 🏫 Híbrido", value:"Valor:", from:"desde R$ 99,90/mes*", know:"CONOCER LA PROPUESTA",
    postgradSection:"🎓 Posgrados · Próximamente", postgradTitle:"Tu próxima especialización puede empezar aquí.", postgradIntro:"Se están desarrollando nuevos posgrados online para unir conocimiento, mercado y aplicación práctica.", featured:"DESTACADO", postgradLabel:"Posgrado · Próximamente", interested:"Me interesa",
    professionalSection:"📚 Formaciones Profesionales", professionalTitle:"Formaciones para desarrollar tu práctica profesional", professionalIntro:"Accede a las formaciones ya disponibles en la Biblioteca LDR sin cambiar las reglas actuales de compra y acceso.",
  },
} as const;

export function libraryAcademicCardText(locale: LibraryCardLocale) { return COPY[locale] ?? COPY.pt; }
