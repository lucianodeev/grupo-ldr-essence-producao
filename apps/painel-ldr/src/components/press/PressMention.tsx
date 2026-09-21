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
  logoSrc: "/media/press/startupvalley-logo.png",
};

export function PressMention({ mention = startupValleyMention }: { mention?: PressMentionData }) {
  return (
    <article className="rounded-3xl border border-[#d9d2c0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {mention.logoSrc ? (
          <div className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:w-52">
            <img src={mention.logoSrc} alt={mention.mediaOutlet} className="max-h-14 max-w-full object-contain" loading="lazy" width="320" height="96" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#8b6c1f]">Cobertura editorial internacional</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{mention.mediaOutlet}</h3>
          <p className="mt-2 font-bold text-slate-800">{mention.title}</p>
          <p className="mt-3 leading-7 text-slate-600">{mention.description}</p>
          <p className="mt-3 text-xs text-slate-500">{mention.mediaType} · {mention.language} · {mention.relatedProject}</p>
          <a href={mention.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071f36] px-5 py-3 text-sm font-black text-white">
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
