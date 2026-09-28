export type PressMentionData = {
  id: string;
  mediaOutlet: string;
  title: string;
  description: string;
  publicationDate?: string;
  originalUrl: string;
  language: string;
  country: string;
  mediaType: string;
  relatedProject: string;
  logoSrc?: string;
};

export const startupValleyMention: PressMentionData = {
  id: "startupvalley-foundertalk-uk-ldr-academy",
  mediaOutlet: "StartupValley Magazine",
  title: "FounderTalk UK — LDR Academy, entrepreneurship and education",
  description: "Entrevista editorial sobre educação, empreendedorismo, tecnologia e produtos digitais no contexto da LDR Academy e do Ecossistema LDR.",
  originalUrl: "https://startupvalley.news/uk/ldr-academy-entrepreneurship-education/",
  language: "English",
  country: "United Kingdom",
  mediaType: "Interview",
  relatedProject: "LDR Academy / Ecossistema LDR",
  logoSrc: "/media/press/startupvalley-logo.png?v=official-20260921",
};

export const rysentraMention: PressMentionData = { logoSrc:"brand:rysentra", id:"rysentra-luciano-2026", mediaOutlet:"Rysentra Magazine", title:"How Luciano Almeida Built Opportunities Across Brazil and Europe", description:"Entrevista editorial sobre a trajetória entre Brasil e Europa e a construção do Ecossistema LDR.", publicationDate:"2026-09-27", originalUrl:"https://rysentra.com/luciano-rodrigues-almeida-building-opportunities/", language:"English", country:"International", mediaType:"Feature Interview", relatedProject:"Ecossistema LDR" };

export const escapeArtistMention: PressMentionData = { logoSrc:"brand:escapeartist", id:"escape-artist-luciano-2026", mediaOutlet:"Escape Artist", title:"From Selling Bananas in Brazil to Building a Life in Europe", description:"História editorial sobre a trajetória de Bahia a São Paulo e Europa, publicada pela Escape Artist.", publicationDate:"2026-09-24", originalUrl:"https://www.escapeartist.com/blog/moving-from-brazil-to-europe/", language:"English", country:"International", mediaType:"Feature Story", relatedProject:"Luciano Rodrigues Almeida / Ecossistema LDR" };

export const internationalPressMentions=[startupValleyMention, rysentraMention, escapeArtistMention];

export function PressMention({ mention = startupValleyMention }: { mention?: PressMentionData }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-[#d9d2c0] bg-white p-6 shadow-sm">
      <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center">
        {mention.logoSrc ? (
          <div className="flex min-h-20 w-full min-w-0 items-center justify-center rounded-2xl bg-white p-4 ring-1 ring-slate-200 xl:w-52 xl:shrink-0">
            {mention.logoSrc === "brand:rysentra" ? (
              <div role="img" aria-label="Rysentra Magazine" className="w-full max-w-[220px] text-center">
                <div className="whitespace-nowrap font-sans text-[27px] font-black leading-none tracking-[-.05em]"><span className="text-[#e31b23]">RYS</span><span className="text-black">ENTRA</span></div>
                <div className="mt-2 text-[12px] font-semibold uppercase tracking-[.42em] text-black">Magazine</div>
                <div className="mt-2 border-t border-[#e31b23]/60 pt-1 text-[10px] italic text-slate-700">Rise of <span className="font-bold text-[#e31b23]">entrepreneurs</span></div>
              </div>
            ) : mention.logoSrc === "brand:escapeartist" ? (
              <div role="img" aria-label="Escape Artist" className="flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#d8cabf] font-serif text-[42px] leading-none text-white">EA</div>
              </div>
            ) : (
              <div role="img" aria-label="StartupValley.news" className="flex w-full max-w-[220px] flex-col items-center justify-center px-2 py-3">
                <div className="whitespace-nowrap text-center font-sans text-[32px] font-extrabold leading-none tracking-[-0.055em] sm:text-[34px]"><span className="text-[#1789d5]">Startup</span><span className="text-[#111111]">Valley</span></div>
                <div className="mt-2 h-px w-full bg-[#111111]" aria-hidden="true" />
                <div className="mt-1 self-end font-sans text-[15px] font-semibold leading-none text-[#111111]">.news</div>
              </div>
            )}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#8b6c1f]">Cobertura editorial internacional</p>
          <h3 className="mt-2 break-words text-xl font-black leading-tight text-slate-950 sm:text-2xl">{mention.mediaOutlet}</h3>
          <p className="mt-2 break-words font-bold leading-6 text-slate-800">{mention.title}</p>
          <p className="mt-3 break-words leading-7 text-slate-600">{mention.description}</p>
          <p className="mt-3 break-words text-xs leading-5 text-slate-500">{mention.mediaType} · {mention.language} · {mention.relatedProject}</p>
          <a href={mention.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 max-w-full items-center justify-center rounded-full text-center leading-snug bg-[#071f36] px-5 py-3 text-sm font-black text-white">
            Ler entrevista original
          </a>
        </div>
      </div>
      <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        Registro de publicação editorial. A presença nesta área não representa parceria comercial, patrocínio, certificação ou endosso institucional.
      </p>
    </article>
  );
}

export function InternationalPressMentions(){return <div className="grid gap-5 lg:grid-cols-3">{internationalPressMentions.map((mention)=><PressMention key={mention.id} mention={mention}/>)}</div>}
