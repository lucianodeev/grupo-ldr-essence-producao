import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, ShoppingCart } from "lucide-react";
import { clientCreateDigitalCheckout, clientDigitalLibrary } from "@/lib/client-portal.functions";
import { psychoanalysisEbookByKey, type PsychoanalysisEbookKey } from "@/lib/psychoanalysis-ebooks.catalog";

export const Route=createFileRoute("/_clientarea/cliente/ebooks/$productKey")({component:EbookOffer});

const SPECIAL_EBOOK_KEYS=new Set(["ebook_falar_com_quem_feriu","ebook_da_pobreza_ao_primeiro_contrato"]);

function money(cents:number,currency:"BRL"|"EUR"){
 return new Intl.NumberFormat(currency==="BRL"?"pt-BR":"pt-PT",{style:"currency",currency}).format(cents/100);
}

function EbookOffer(){
 const {productKey}=Route.useParams(); const book=psychoanalysisEbookByKey(productKey);
 const libraryFn=useServerFn(clientDigitalLibrary),checkoutFn=useServerFn(clientCreateDigitalCheckout);
 const {data,isLoading}=useQuery({queryKey:["ebook-offer",productKey],queryFn:()=>libraryFn({})});
 const buy=useMutation({mutationFn:(market:"BR"|"INTL")=>checkoutFn({data:{productKey:productKey as PsychoanalysisEbookKey,market}}),onSuccess:r=>location.href=r.url});
 if(!book)return <section className="s8-card">Produto inválido.</section>;
 if(isLoading||!data)return <section className="s8-card">Carregando…</section>;
 const product=data.products.find(p=>p.key===book.key);
 const specialAccess=SPECIAL_EBOOK_KEYS.has(book.key);
 const entitled=Boolean(product?.entitled);
 const selectedMarket:"BR"|"INTL"=data.market==="BR"?"BR":"INTL";
 const premium="premium" in book&&book.premium===true;
 const regularBrl=premium&&"regularPriceBrlCents" in book?book.regularPriceBrlCents:null;
 const regularEur=premium&&"regularPriceEurCents" in book?book.regularPriceEurCents:null;
 const currentPrice=selectedMarket==="BR"?money(book.priceBrlCents,"BRL"):money(book.priceEurCents,"EUR");
 return <main className="mx-auto max-w-5xl space-y-6 pb-10">
  <section className="rounded-[28px] p-7 text-white shadow-xl" style={{background:`linear-gradient(135deg, ${book.color}, #071426)`}}><BookOpen className="h-10 w-10"/><p className="mt-4 text-xs font-black tracking-[.2em] text-[#d6ad63]">{premium?"EBOOK PREMIUM · AVULSO":"eBOOK · AVULSO"}</p><h1 className="mt-2 font-serif text-4xl text-[#fff7e7]">{book.title}</h1><p className="mt-2 text-white/80">{book.subtitle}</p><p className="mt-5 text-sm leading-7 text-white/75">{book.description}</p></section>
  <section className="rounded-3xl border bg-white p-6">{premium?<div><p className="text-xs font-black uppercase tracking-[.14em]" style={{color:book.color}}>PREÇO PROMOCIONAL</p><p className="mt-2 text-sm text-slate-400 line-through">{money(regularBrl!,"BRL")} · {money(regularEur!,"EUR")}</p><p className="mt-1 text-xl font-black">{money(book.priceBrlCents,"BRL")} · {money(book.priceEurCents,"EUR")}</p></div>:<p className="text-sm font-black">{money(book.priceBrlCents,"BRL")} · {money(book.priceEurCents,"EUR")}</p>}<p className="mt-2 text-sm text-slate-600">Pagamento único · acesso vitalício aos conteúdos digitais. Produto independente · não incluído na assinatura mensal da Biblioteca LDR.</p>{entitled?<a href={book.readerPath} className="mt-5 inline-flex w-full justify-center rounded-xl px-5 py-4 text-sm font-black text-white" style={{backgroundColor:book.color}}>LER AGORA</a>:specialAccess?<div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={buy.isPending} onClick={()=>buy.mutate(selectedMarket)} className="w-full rounded-xl px-5 py-4 text-sm font-black text-white" style={{backgroundColor:book.color}}><ShoppingCart className="mr-2 inline h-4 w-4"/>{buy.isPending?"Abrindo pagamento…":`COMPRAR POR ${currentPrice}`}</button><a href={book.readerPath} className="inline-flex w-full justify-center rounded-xl border px-5 py-4 text-sm font-black" style={{borderColor:book.color,color:book.color}}>ACESSAR SE JÁ COMPROU</a></div>:<button disabled={buy.isPending} onClick={()=>buy.mutate(selectedMarket)} className="mt-5 w-full rounded-xl px-5 py-4 text-sm font-black text-white" style={{backgroundColor:book.color}}><ShoppingCart className="mr-2 inline h-4 w-4"/>{buy.isPending?"Abrindo pagamento…":`COMPRAR POR ${currentPrice}`}</button>}<p className="mt-3 text-xs text-slate-500">Pagamento seguro via Stripe. O acesso de leitura é validado no servidor após confirmação do pagamento.</p></section>
  <section className="rounded-3xl border bg-white p-6"><h2 className="font-serif text-2xl">{book.chapters.length} capítulos</h2><ol className="mt-4 grid gap-2 md:grid-cols-2">{book.chapters.map((c,i)=><li key={c} className="rounded-xl border p-3 text-sm"><b>{i+1}.</b> {c}</li>)}</ol></section>
 </main>;
}