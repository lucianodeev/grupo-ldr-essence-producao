type Props={subscription?:boolean;catalogKey:string;title:string;description:string;detail:string;editorial?:string|undefined;href:string;icon:string;accent:string;accessLabel:string;cta:string;badge?:string|undefined;progress?:number|undefined};
/** Shared card presentation for the public showcase and the private library. */
export function AcademyCatalogCard({subscription=true,catalogKey,title,description,detail,editorial,href,icon,accent,accessLabel,cta,badge,progress}:Props){
 return <a data-academy-key={catalogKey} data-academy-subscription={subscription} href={href} className="group flex min-h-[300px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2">
  <div className="h-2" style={{background:accent}}/>
  <div className="flex flex-1 flex-col p-5">
   {badge&&<span className="mb-3 w-fit rounded-full bg-[#071426] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">{badge}</span>}
   <div className="flex items-start justify-between gap-3"><span aria-hidden="true" className="text-3xl">{icon}</span><span className="min-w-0 rounded-full bg-[#f5f0e6] px-2.5 py-1 text-[10px] font-bold text-[#7a5a22]">{detail}</span></div>
   <h3 className="mt-4 font-serif text-xl leading-tight text-[#071426]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
   {editorial&&<p className="mt-3 text-xs leading-5 text-slate-600">{editorial}</p>}
   {progress!==undefined&&<p className="mt-3 text-sm text-slate-700">{progress}%</p>}
   <div className="mt-auto pt-5"><p className="text-sm font-black text-[#071426]">{accessLabel}</p><span className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#071426] px-4 py-3 text-xs font-black text-white">{cta} →</span></div>
  </div>
 </a>;
}
