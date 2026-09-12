import { useI18n } from "@/lib/i18n";

type Locale="pt"|"en"|"fr"|"es";
const COPY={
  pt:{eyebrow:"PUBLICAÇÕES LDR",title:"Informação, inspiração e ciência, toda semana.",desc:"Assinaturas editoriais independentes da Biblioteca LDR. Jornal, Revista e LDR Ciência são contratados separadamente.",newspaper:"📰 JORNAL LDR",newspaperTitle:"O mundo em movimento",newspaperDesc:"Negócios, ciência, tecnologia, mundo e entretenimento em uma edição digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideias que movem pessoas e negócios",magazineDesc:"Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.",science:"🔬 LDR CIÊNCIA",scienceTitle:"Ciência que ajuda a decidir melhor",scienceDesc:"Análises próprias da LDR baseadas em estudos científicos reais, com contexto, limites, aplicações práticas e acesso às fontes originais.",week:"semana",subscribeNewspaper:"ASSINAR JORNAL LDR",subscribeMagazine:"ASSINAR REVISTA LDR",subscribeScience:"ASSINAR LDR CIÊNCIA",footer:"Biblioteca LDR, Jornal LDR, Revista LDR e LDR Ciência possuem assinaturas independentes."},
  en:{eyebrow:"LDR PUBLICATIONS",title:"Information, inspiration and science, every week.",desc:"Editorial subscriptions are separate from the LDR Library. Newspaper, Magazine and LDR Science are subscribed to separately.",newspaper:"📰 LDR NEWSPAPER",newspaperTitle:"A world in motion",newspaperDesc:"Business, science, technology, world affairs and entertainment in a digital edition.",magazine:"📖 LDR MAGAZINE",magazineTitle:"Ideas that move people and businesses",magazineDesc:"Career, entrepreneurship, behavior, innovation and inspiring stories.",science:"🔬 LDR SCIENCE",scienceTitle:"Science for better decisions",scienceDesc:"Original LDR analyses based on real scientific studies, with context, limitations, practical applications and links to original sources.",week:"week",subscribeNewspaper:"SUBSCRIBE TO LDR NEWSPAPER",subscribeMagazine:"SUBSCRIBE TO LDR MAGAZINE",subscribeScience:"SUBSCRIBE TO LDR SCIENCE",footer:"LDR Library, LDR Newspaper, LDR Magazine and LDR Science have separate subscriptions."},
  fr:{eyebrow:"PUBLICATIONS LDR",title:"Information, inspiration et science, chaque semaine.",desc:"Les abonnements éditoriaux sont séparés de la Bibliothèque LDR. Le Journal, le Magazine et LDR Science sont souscrits séparément.",newspaper:"📰 JOURNAL LDR",newspaperTitle:"Le monde en mouvement",newspaperDesc:"Affaires, science, technologie, monde et divertissement dans une édition numérique.",magazine:"📖 MAGAZINE LDR",magazineTitle:"Des idées qui font bouger les personnes et les entreprises",magazineDesc:"Carrière, entrepreneuriat, comportement, innovation et histoires inspirantes.",science:"🔬 LDR SCIENCE",scienceTitle:"La science pour mieux décider",scienceDesc:"Analyses originales LDR fondées sur des études scientifiques réelles, avec contexte, limites, applications pratiques et accès aux sources originales.",week:"semaine",subscribeNewspaper:"S’ABONNER AU JOURNAL LDR",subscribeMagazine:"S’ABONNER AU MAGAZINE LDR",subscribeScience:"S’ABONNER À LDR SCIENCE",footer:"La Bibliothèque LDR, le Journal LDR, le Magazine LDR et LDR Science ont des abonnements indépendants."},
  es:{eyebrow:"PUBLICACIONES LDR",title:"Información, inspiración y ciencia, cada semana.",desc:"Las suscripciones editoriales son independientes de la Biblioteca LDR. Periódico, Revista y LDR Ciencia se contratan por separado.",newspaper:"📰 PERIÓDICO LDR",newspaperTitle:"El mundo en movimiento",newspaperDesc:"Negocios, ciencia, tecnología, actualidad y entretenimiento en una edición digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideas que mueven personas y negocios",magazineDesc:"Carrera, emprendimiento, comportamiento, innovación e historias que inspiran.",science:"🔬 LDR CIENCIA",scienceTitle:"Ciencia para decidir mejor",scienceDesc:"Análisis propios de LDR basados en estudios científicos reales, con contexto, límites, aplicaciones prácticas y acceso a las fuentes originales.",week:"semana",subscribeNewspaper:"SUSCRIBIRME AL PERIÓDICO LDR",subscribeMagazine:"SUSCRIBIRME A LA REVISTA LDR",subscribeScience:"SUSCRIBIRME A LDR CIENCIA",footer:"Biblioteca LDR, Periódico LDR, Revista LDR y LDR Ciencia tienen suscripciones independientes."}
} as const;

export function EditorialSalesCards(){
  const {locale:raw}=useI18n();
  const locale=(raw==="pt"||raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as Locale;
  const t=COPY[locale];
  return <section id="editorial-ldr-sales" className="bg-[#f7f3e9] px-4 py-14 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#a77b2e]">{t.eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl text-[#071426] sm:text-4xl">{t.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t.desc}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <a href="/cliente/biblioteca/jornal-ldr" className="rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-7 !text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">{t.newspaper}</p>
          <h3 className="mt-3 font-serif text-3xl !text-[#fff7e7]">{t.newspaperTitle}</h3>
          <p className="mt-3 text-sm leading-6 !text-white/80">{t.newspaperDesc}</p>
          <div className="mt-6"><p className="text-2xl font-black !text-white">R$ 0,90 / {t.week}</p><p className="mt-1 font-black text-[#d6ad63]">€ 0,90 / {t.week}</p></div>
          <span className="mt-6 inline-block rounded-xl bg-[#d6ad63] px-5 py-3 text-xs font-black text-[#281605]">{t.subscribeNewspaper}</span>
        </a>
        <a href="/cliente/biblioteca/revista-ldr" className="rounded-[28px] bg-gradient-to-br from-[#4c071d] via-[#6b0d2b] to-[#2a0a15] p-7 !text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f0c775]">{t.magazine}</p>
          <h3 className="mt-3 font-serif text-3xl !text-[#fff7e7]">{t.magazineTitle}</h3>
          <p className="mt-3 text-sm leading-6 !text-white/80">{t.magazineDesc}</p>
          <div className="mt-6"><p className="text-2xl font-black !text-white">R$ 0,90 / {t.week}</p><p className="mt-1 font-black text-[#f0c775]">€ 0,90 / {t.week}</p></div>
          <span className="mt-6 inline-block rounded-xl bg-[#f0c775] px-5 py-3 text-xs font-black text-[#35101e]">{t.subscribeMagazine}</span>
        </a>
        <a href="/cliente/biblioteca/ldr-ciencia" className="rounded-[28px] bg-gradient-to-br from-[#082f49] via-[#0e5578] to-[#071426] p-7 !text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#8ee3ff]">{t.science}</p>
          <h3 className="mt-3 font-serif text-3xl !text-white">{t.scienceTitle}</h3>
          <p className="mt-3 text-sm leading-6 !text-white/80">{t.scienceDesc}</p>
          <div className="mt-6"><p className="text-2xl font-black !text-white">R$ 0,90 / {t.week}</p><p className="mt-1 font-black text-[#8ee3ff]">€ 0,90 / {t.week}</p></div>
          <span className="mt-6 inline-block rounded-xl bg-[#8ee3ff] px-5 py-3 text-xs font-black text-[#06263a]">{t.subscribeScience}</span>
        </a>
      </div>
      <p className="mt-4 text-xs text-slate-500">{t.footer}</p>
    </div>
  </section>;
}
