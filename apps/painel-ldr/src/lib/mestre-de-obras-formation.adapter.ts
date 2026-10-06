import type { PF } from "@/lib/professional-formations.catalog";
import { MESTRE_DE_OBRAS_600H } from "@/lib/formacao-mestre-de-obras-600h.catalog";

const modulesPt=MESTRE_DE_OBRAS_600H.modules.map((m)=>m.title);

export const MESTRE_DE_OBRAS_FORMATION:PF[]=[{
  slug:MESTRE_DE_OBRAS_600H.slug as any,
  productKey:MESTRE_DE_OBRAS_600H.productKey,
  publicPath:`/formacoes/${MESTRE_DE_OBRAS_600H.slug}`,
  learnerPath:`/cliente/treinamentos/curso-avulso/${MESTRE_DE_OBRAS_600H.slug}`,
  icon:"🏗️",
  theme:"gold",
  priceBrlCents:0,
  priceEurCents:0,
  hours:600,
  lessons:180,
  modulesCount:20,
  minimumDays:0,
  includedInSubscription:true,
  i18n:{
    pt:{name:MESTRE_DE_OBRAS_600H.title,short:"Mestre de Obras",category:"Construção Civil",description:MESTRE_DE_OBRAS_600H.description,project:"Projeto Integrador — Planejamento, execução, controle e entrega de uma obra didática",disclaimer:MESTRE_DE_OBRAS_600H.disclaimer,portfolio:["Plano de responsabilidades e comunicação de campo","Planejamento executivo e logística de canteiro","Plano de inspeção, qualidade e segurança","Controle de produtividade, medições e desvios","Projeto Integrador Final da obra didática"],modules:modulesPt},
    en:{name:"Master Builder — Construction Management, Execution and Control",short:"Master Builder",category:"Construction",description:"Advanced 600-hour non-degree training in construction-site organization, project reading, planning, execution monitoring, quality, productivity and field leadership.",project:"Final Integrative Project — Planning, execution, control and handover of a simulated construction project",disclaimer:"Non-degree professional development. It does not grant technical responsibility, professional registration or authorization for regulated activities.",portfolio:["Field responsibility and communication plan","Execution plan and site logistics","Quality and safety inspection plan","Productivity and progress control","Final integrative construction project"],modules:modulesPt},
    fr:{name:"Maître de chantier — Gestion, exécution et contrôle des travaux",short:"Maître de chantier",category:"Construction",description:"Formation libre avancée de 600 heures sur l'organisation du chantier, la lecture des projets, la planification, le suivi de l'exécution, la qualité, la productivité et le leadership de terrain.",project:"Projet intégratif final — Planification, exécution, contrôle et livraison d'un chantier simulé",disclaimer:"Formation libre de perfectionnement. Elle ne confère aucune responsabilité technique, inscription professionnelle ou autorisation pour des activités réglementées.",portfolio:["Plan des responsabilités et de communication","Planification et logistique du chantier","Plan d'inspection qualité et sécurité","Contrôle de productivité et d'avancement","Projet intégratif final"],modules:modulesPt},
    es:{name:"Maestro de Obras — Gestión, Ejecución y Control de Obras",short:"Maestro de Obras",category:"Construcción",description:"Formación libre avanzada de 600 horas sobre organización de obra, lectura de proyectos, planificación, seguimiento de ejecución, calidad, productividad y liderazgo de campo.",project:"Proyecto integrador final — Planificación, ejecución, control y entrega de una obra simulada",disclaimer:"Formación libre de perfeccionamiento. No concede responsabilidad técnica, registro profesional ni autorización para actividades reguladas.",portfolio:["Plan de responsabilidades y comunicación","Planificación y logística de obra","Plan de inspección, calidad y seguridad","Control de productividad y avance","Proyecto integrador final"],modules:modulesPt}
  }
}];
