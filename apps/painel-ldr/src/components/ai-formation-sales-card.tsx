import { useI18n } from "@/lib/i18n";

type Locale="pt"|"en"|"fr"|"es";
const COPY={
  pt:{eyebrow:"NOVA FORMAÇÃO",title:"Formação em Inteligência Artificial Aplicada aos Negócios e à Carreira",desc:"Aprenda a usar IA para criar conteúdo, programar, estruturar produtos digitais, vender, automatizar processos e desenvolver soluções reais.",meta:"600 horas · 15 módulos · 225 aulas · 100% online · 6 avaliações de projeto",price:"R$ 299,99 · € 49,90",payment:"PAGAMENTO ÚNICO · ACESSO VITALÍCIO",cta:"CONHECER A FORMAÇÃO"},
  en:{eyebrow:"NEW PROGRAM",title:"Artificial Intelligence Applied to Business and Career",desc:"Learn to use AI to create content, build software, structure digital products, sell, automate processes and develop real solutions.",meta:"600 hours · 15 modules · 225 lessons · 100% online · 6 project assessments",price:"R$ 299,99 · € 49,90",payment:"ONE-TIME PAYMENT · LIFETIME ACCESS",cta:"VIEW PROGRAM"},
  fr:{eyebrow:"NOUVELLE FORMATION",title:"Intelligence Artificielle Appliquée aux Entreprises et à la Carrière",desc:"Apprenez à utiliser l’IA pour créer du contenu, programmer, structurer des produits numériques, vendre, automatiser des processus et développer des solutions concrètes.",meta:"600 heures · 15 modules · 225 cours · 100% en ligne · 6 évaluations de projet",price:"R$ 299,99 · € 49,90",payment:"PAIEMENT UNIQUE · ACCÈS À VIE",cta:"DÉCOUVRIR LA FORMATION"},
  es:{eyebrow:"NUEVA FORMACIÓN",title:"Inteligencia Artificial Aplicada a los Negocios y a la Carrera",desc:"Aprende a usar IA para crear contenido, programar, estructurar productos digitales, vender, automatizar procesos y desarrollar soluciones reales.",meta:"600 horas · 15 módulos · 225 clases · 100% online · 6 evaluaciones de proyecto",price:"R$ 299,99 · € 49,90",payment:"PAGO ÚNICO · ACCESO DE POR VIDA",cta:"CONOCER LA FORMACIÓN"}
} as const;

export function AIFormationSalesCard(){
  const {locale:raw}=useI18n();
  const locale=(raw==="pt"||raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as Locale;
  const t=COPY[locale];
  return <section id="formacao-ia" className="bg-white px-4 py-14 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <a href="/cliente/biblioteca" className="block overflow-hidden rounded-[30px] border border-[#143d59]/20 bg-gradient-to-br from-[#071426] via-[#0b3555] to-[#14658c] p-7 !text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8fd8ff]">🤖 {t.eyebrow}</p>
            <h2 className="mt-3 max-w-4xl font-serif text-3xl !text-white sm:text-4xl">{t.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 !text-white/80">{t.desc}</p>
            <p className="mt-5 text-sm font-black !text-[#bfeaff]">{t.meta}</p>
          </div>
          <div className="min-w-[240px] rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-2xl font-black !text-white">{t.price}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[.13em] !text-white/70">{t.payment}</p>
            <span className="mt-5 inline-flex w-full justify-center rounded-xl bg-[#8fd8ff] px-5 py-3 text-xs font-black text-[#071426]">{t.cta}</span>
          </div>
        </div>
      </a>
    </div>
  </section>;
}
