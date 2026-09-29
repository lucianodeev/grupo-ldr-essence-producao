import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen } from "lucide-react";
import { clientDigitalLibrary } from "@/lib/client-portal.functions";
import { psychoanalysisEbookByKey } from "@/lib/psychoanalysis-ebooks.catalog";

export const Route=createFileRoute("/_clientarea/cliente/ebooks/$productKey")({component:EbookOffer});


function money(cents:number,currency:"BRL"|"EUR"){
 return new Intl.NumberFormat(currency==="BRL"?"pt-BR":"pt-PT",{style:"currency",currency}).format(cents/100);
}

function EbookOffer(){
 const {productKey}=Route.useParams(); const book=psychoanalysisEbookByKey(productKey);
 const libraryFn=useServerFn(clientDigitalLibrary);
 const {data,isLoading}=useQuery({queryKey:["ebook-offer",productKey],queryFn:()=>libraryFn({})});

 if(!book)return <section className="s8-card">Produto inválido.</section>;
 if(isLoading||!data)return <section className="s8-card">Carregando…</section>;
 const product=data.products.find(p=>p.key===book.key);
 const entitled=Boolean(product?.entitled);
 const premium="premium" in book&&book.premium===true;
 const regularBrl=premium&&"regularPriceBrlCents" in book?book.regularPriceBrlCents:null;
 const regularEur=premium&&"regularPriceEurCents" in book?book.regularPriceEurCents:null;
 return <main className="mx-auto max-w-5xl space-y-6 pb-10">
  <section className="rounded-[28px] p-7 text-white shadow-xl" style={{background:`linear-gradient(135deg, ${book.color}, #071426)`}}><BookOpen className="h-10 w-10"/><p className="mt-4 text-xs font-black tracking-[.2em] text-[#d6ad63]">{premium?"EBOOK PREMIUM · AVULSO":"eBOOK · AVULSO"}</p><h1 className="mt-2 font-serif text-4xl text-[#fff7e7]">{book.title}</h1><p className="mt-2 text-white/80">{book.subtitle}</p><p className="mt-5 text-sm leading-7 text-white/75">{book.description}</p></section>
  <section className="rounded-3xl border bg-white p-6">{entitled?<><p className="text-sm font-black">Acesso liberado</p><a href={book.readerPath} className="mt-5 inline-flex w-full justify-center rounded-xl px-5 py-4 text-sm font-black text-white" style={{backgroundColor:book.color}}>LER AGORA</a></>:<><p className="text-sm font-black">Acesso com LDR ONE</p><p className="mt-2 text-sm text-slate-600">Novas compras avulsas foram encerradas. Compras anteriores continuam com acesso preservado.</p><a href="/ldr-pass" className="mt-5 inline-flex w-full justify-center rounded-xl px-5 py-4 text-sm font-black text-white" style={{backgroundColor:book.color}}>CONHECER O LDR ONE</a></>}</section>
  <section className="rounded-3xl border bg-white p-6"><h2 className="font-serif text-2xl">{book.chapters.length} capítulos</h2><ol className="mt-4 grid gap-2 md:grid-cols-2">{book.chapters.map((c,i)=><li key={c} className="rounded-xl border p-3 text-sm"><b>{i+1}.</b> {c}</li>)}</ol></section>
 </main>;
}