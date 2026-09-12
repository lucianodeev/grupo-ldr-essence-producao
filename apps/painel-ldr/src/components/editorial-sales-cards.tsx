import { useI18n } from "@/lib/i18n";

type Locale="pt"|"en"|"fr"|"es";
const COPY={
  pt:{eyebrow:"PUBLICAÇÕES LDR",title:"Informação, inspiração e ciência, toda semana.",desc:"Assinaturas editoriais independentes da Biblioteca LDR. Jornal, Revista, LDR Ciência e Revista Psicanálise no Mundo são contratados separadamente.",newspaper:"📰 JORNAL LDR",newspaperTitle:"O mundo em movimento",newspaperDesc:"Negócios, ciência, tecnologia, mundo e entretenimento em uma edição digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideias que movem pessoas e negócios",magazineDesc:"Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.",science:"🔬 LDR CIÊNCIA",scienceTitle:"Ciência que ajuda a decidir melhor",scienceDesc:"Análises próprias da LDR baseadas em estudos científicos reais, com contexto, limites, aplicações práticas e acesso às fontes originais.",psy:"🧠 DESTAQUE · PSICANÁLISE NO MUNDO",psyTitle:"Revista Psicanálise no Mundo",psyDesc:"Psicanálise contemporânea, clínica, teoria, estudos de caso, cultura, sociedade e pesquisa em diferentes países.",week:"semana",subscribeNewspaper:"ASSINAR JORNAL LDR",subscribeMagazine:"ASSINAR REVISTA LDR",subscribeScience:"ASSINAR LDR CIÊNCIA",subscribePsy:"ASSINAR REVISTA",footer:"Biblioteca LDR, Jornal LDR, Revista LDR, LDR Ciência e Revista Psicanálise no Mundo possuem assinaturas independentes."},
  en:{eyebrow:"LDR PUBLICATIONS",title:"Information, inspiration and science, every week.",desc:"Editorial subscriptions are separate from the LDR Library. Newspaper, Magazine, LDR Science and Psychoanalysis Around the World Magazine are subscribed to separately.",newspaper:"📰 LDR NEWSPAPER",newspaperTitle:"A world in motion",newspaperDesc:"Business, science, technology, world affairs and entertainment in a digital edition.",magazine:"📖 LDR MAGAZINE",magazineTitle:"Ideas that move people and businesses",magazineDesc:"Career, entrepreneurship, behavior, innovation and inspiring stories.",science:"🔬 LDR SCIENCE",scienceTitle:"Science for better decisions",scienceDesc:"Original LDR analyses based on real scientific studies, with context, limitations, practical applications and links to original sources.",psy:"🧠 FEATURED · PSYCHOANALYSIS AROUND THE WORLD",psyTitle:"Psychoanalysis Around the World Magazine",psyDesc:"Contemporary psychoanalysis, clinical practice, theory, case studies, culture, society and research across countries.",week:"week",subscribeNewspaper:"SUBSCRIBE TO LDR NEWSPAPER",subscribeMagazine:"SUBSCRIBE TO LDR MAGAZINE",subscribeScience:"SUBSCRIBE TO LDR SCIENCE",subscribePsy:"SUBSCRIBE TO MAGAZINE",footer:"LDR Library, LDR Newspaper, LDR Magazine, LDR Science and Psychoanalysis Around the World Magazine have separate subscriptions."},
  fr:{eyebrow:"PUBLICATIONS LDR",title:"Information, inspiration et science, chaque semaine.",desc:"Les abonnements éditoriaux sont séparés de la Bibliothèque LDR. Le Journal, le Magazine, LDR Science et la Revue Psychanalyse dans le Monde sont souscrits séparément.",newspaper:"📰 JOURNAL LDR",newspaperTitle:"Le monde en mouvement",newspaperDesc:"Affaires, science, technologie, monde et divertissement dans une édition numérique.",magazine:"📖 MAGAZINE LDR",magazineTitle:"Des idées qui font bouger les personnes et les entreprises",magazineDesc:"Carrière, entrepreneuriat, comportement, innovation et histoires inspirantes.",science:"🔬 LDR SCIENCE",scienceTitle:"La science pour mieux décider",scienceDesc:"Analyses originales LDR fondées sur des études scientifiques réelles, avec contexte, limites, applications pratiques et accès aux sources originales.",psy:"🧠 À LA UNE · PSYCHANALYSE DANS LE MONDE",psyTitle:"Revue Psychanalyse dans le Monde",psyDesc:"Psychanalyse contemporaine, clinique, théorie, études de cas, culture, société et recherche dans différents pays.",week:"semaine",subscribeNewspaper:"S’ABONNER AU JOURNAL LDR",subscribeMagazine:"S’ABONNER AU MAGAZINE LDR",subscribeScience:"S’ABONNER À LDR SCIENCE",subscribePsy:"S’ABONNER À LA REVUE",footer:"La Bibliothèque LDR, le Journal LDR, le Magazine LDR, LDR Science et la Revue Psychanalyse dans le Monde ont des abonnements indépendants."},
  es:{eyebrow:"PUBLICACIONES LDR",title:"Información, inspiración y ciencia, cada semana.",desc:"Las suscripciones editoriales son independientes de la Biblioteca LDR. Periódico, Revista, LDR Ciencia y Revista Psicoanálisis en el Mundo se contratan por separado.",newspaper:"📰 PERIÓDICO LDR",newspaperTitle:"El mundo en movimiento",newspaperDesc:"Negocios, ciencia, tecnología, actualidad y entretenimiento en una edición digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideas que mueven personas y negocios",magazineDesc:"Carrera, emprendimiento, comportamiento, innovación e historias que inspiran.",science:"🔬 LDR CIENCIA",scienceTitle:"Ciencia para decidir mejor",scienceDesc:"Análisis propios de LDR basados en estudios científicos reales, con contexto, límites, aplicaciones prácticas y acceso a las fuentes originales.",psy:"🧠 DESTACADO · PSICOANÁLISIS EN EL MUNDO",psyTitle:"Revista Psicoanálisis en el Mundo",psyDesc:"Psicoanálisis contemporáneo, clínica, teoría, estudios de caso, cultura, sociedad e investigación en distintos países.",week:"semana",subscribeNewspaper:"SUSCRIBIRME AL PERIÓDICO LDR",subscribeMagazine:"SUSCRIBIRME A LA REVISTA LDR",subscribeScience:"SUSCRIBIRME A LDR CIENCIA",subscribePsy:"SUSCRIBIRME A LA REVISTA",footer:"Biblioteca LDR, Periódico LDR, Revista LDR, LDR Ciencia y Revista Psicoanálisis en el Mundo tienen suscripciones independientes."}
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

      <a href="/cliente/biblioteca/publicacoes/revista-psicanalise-no-mundo" className="mb-6 block overflow-hidden rounded-[30px] border-2 border-[#d6ad63] bg-gradient-to-br from-[#2b1642] via-[#5b2c72] to-[#140b22] p-7 !text-white shadow-2xl ring-4 ring-[#d6ad63]/10 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(43,22,66,.35)] sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#f0c775] px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-[#2b1642]">NOVO · DESTAQUE</span>
            <p className="mt-4 text-xs font-black uppercase tracking-[.2em] text-[#f0c775]">{t.psy}</p>
            <h3 className="mt-3 font-serif text-4xl !text-white sm:text-5xl">{t.psyTitle}</h3>
            <p className="mt-4 max-w-2xl text-base leading-7 !text-white/80">{t.psyDesc}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-right backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[.12em] text-white/60">{locale==="fr"?"ABONNEMENT HEBDOMADAIRE":locale==="en"?"WEEKLY SUBSCRIPTION":locale==="es"?"SUSCRIPCIÓN SEMANAL":"ASSINATURA SEMANAL"}</p>
            <p className="mt-2 text-3xl font-black !text-white">R$ 3,90</p>
            <p className="mt-1 text-lg font-black text-[#f0c775]">€ 3,90 / {t.week}</p>
          </div>
        </div>
        <span className="mt-7 inline-flex rounded-xl bg-[#f0c775] px-6 py-3 text-xs font-black text-[#2b1642] shadow-lg">{t.subscribePsy} →</span>
      </a>

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
