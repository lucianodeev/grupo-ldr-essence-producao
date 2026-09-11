import { useI18n } from "@/lib/i18n";

type Locale="pt"|"en"|"fr"|"es";
const COPY={
  pt:{eyebrow:"JORNAL & REVISTA LDR",title:"Informação e inspiração, toda semana.",desc:"Assinaturas editoriais independentes da Biblioteca LDR. Jornal e Revista são contratados separadamente.",newspaper:"📰 JORNAL LDR",newspaperTitle:"O mundo em movimento",newspaperDesc:"Negócios, ciência, tecnologia, mundo e entretenimento em uma edição digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideias que movem pessoas e negócios",magazineDesc:"Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.",week:"semana",subscribeNewspaper:"ASSINAR JORNAL LDR",subscribeMagazine:"ASSINAR REVISTA LDR",footer:"Biblioteca LDR, Jornal LDR e Revista LDR possuem assinaturas independentes."},
  en:{eyebrow:"LDR NEWSPAPER & MAGAZINE",title:"Information and inspiration, every week.",desc:"Editorial subscriptions are separate from the LDR Library. Newspaper and Magazine are subscribed to separately.",newspaper:"📰 LDR NEWSPAPER",newspaperTitle:"A world in motion",newspaperDesc:"Business, science, technology, world affairs and entertainment in a digital edition.",magazine:"📖 LDR MAGAZINE",magazineTitle:"Ideas that move people and businesses",magazineDesc:"Career, entrepreneurship, behavior, innovation and inspiring stories.",week:"week",subscribeNewspaper:"SUBSCRIBE TO LDR NEWSPAPER",subscribeMagazine:"SUBSCRIBE TO LDR MAGAZINE",footer:"LDR Library, LDR Newspaper and LDR Magazine have separate subscriptions."},
  fr:{eyebrow:"JOURNAL & MAGAZINE LDR",title:"Information et inspiration, chaque semaine.",desc:"Les abonnements éditoriaux sont séparés de la Bibliothèque LDR. Le Journal et le Magazine sont souscrits séparément.",newspaper:"📰 JOURNAL LDR",newspaperTitle:"Le monde en mouvement",newspaperDesc:"Affaires, science, technologie, monde et divertissement dans une édition numérique.",magazine:"📖 MAGAZINE LDR",magazineTitle:"Des idées qui font bouger les personnes et les entreprises",magazineDesc:"Carrière, entrepreneuriat, comportement, innovation et histoires inspirantes.",week:"semaine",subscribeNewspaper:"S’ABONNER AU JOURNAL LDR",subscribeMagazine:"S’ABONNER AU MAGAZINE LDR",footer:"La Bibliothèque LDR, le Journal LDR et le Magazine LDR ont des abonnements indépendants."},
  es:{eyebrow:"PERIÓDICO & REVISTA LDR",title:"Información e inspiración, cada semana.",desc:"Las suscripciones editoriales son independientes de la Biblioteca LDR. Periódico y Revista se contratan por separado.",newspaper:"📰 PERIÓDICO LDR",newspaperTitle:"El mundo en movimiento",newspaperDesc:"Negocios, ciencia, tecnología, actualidad y entretenimiento en una edición digital.",magazine:"📖 REVISTA LDR",magazineTitle:"Ideas que mueven personas y negocios",magazineDesc:"Carrera, emprendimiento, comportamiento, innovación e historias que inspiran.",week:"semana",subscribeNewspaper:"SUSCRIBIRME AL PERIÓDICO LDR",subscribeMagazine:"SUSCRIBIRME A LA REVISTA LDR",footer:"Biblioteca LDR, Periódico LDR y Revista LDR tienen suscripciones independientes."}
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
      <div className="grid gap-5 md:grid-cols-2">
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
      </div>
      <p className="mt-4 text-xs text-slate-500">{t.footer}</p>
    </div>
  </section>;
}
