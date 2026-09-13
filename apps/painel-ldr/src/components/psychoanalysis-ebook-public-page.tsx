import { BookOpen, CheckCircle2 } from "lucide-react";
import { psychoanalysisEbookByKey, type PsychoanalysisEbookKey } from "@/lib/psychoanalysis-ebooks.catalog";

export function PsychoanalysisEbookPublicPage({productKey}:{productKey:PsychoanalysisEbookKey}){
  const book=psychoanalysisEbookByKey(productKey);
  if(!book)return null;
  return <main className="min-h-screen bg-[#f7f3e9] text-[#071426]">
    <section className="px-4 py-16 text-white" style={{background:`linear-gradient(135deg, ${book.color}, #071426)`}}>
      <div className="mx-auto max-w-6xl">
        <BookOpen className="h-12 w-12 text-[#fff7e7]"/>
        <p className="mt-5 text-xs font-black tracking-[.2em] text-[#d6ad63]">eBOOK · LDR ACADEMY</p>
        <h1 className="mt-3 max-w-5xl font-serif text-4xl text-[#fff7e7] sm:text-6xl">{book.title}</h1>
        <p className="mt-3 max-w-4xl text-xl text-white/85">{book.subtitle}</p>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{book.description}</p>
        <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">20 CAPÍTULOS</span><span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">LEITOR DIGITAL</span><span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">ACESSO VITALÍCIO</span><span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">AVULSO</span></div>
        <div className="mt-8 flex flex-wrap gap-3"><a href={`/cliente/ebooks/${book.key}`} className="rounded-xl bg-[#d6ad63] px-6 py-4 text-sm font-black text-[#281605]">COMPRAR / ACESSAR</a><span className="rounded-xl border border-white/20 px-6 py-4 text-sm font-black">R$ 20,00 · € 3,99</span></div>
        <p className="mt-3 text-xs text-white/65">Pagamento único · acesso vitalício aos conteúdos digitais · produto independente, não incluído na assinatura mensal.</p>
        <p className="mt-2 text-xs text-white/65">Pagamento seguro via Stripe. Precisa de outra forma de pagamento? Entre em contato.</p>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs font-black uppercase tracking-[.16em]" style={{color:book.color}}>PARA QUEM É</p><p className="mt-3 max-w-4xl text-base leading-7 text-slate-700">{book.audience}</p>
      <h2 className="mt-10 font-serif text-3xl">Sumário — 20 capítulos</h2>
      <div className="mt-7 grid gap-3 md:grid-cols-2">{book.chapters.map((c,i)=><article key={c} className="rounded-2xl border bg-white p-4"><p className="text-xs font-black" style={{color:book.color}}>{String(i+1).padStart(2,"0")}</p><h3 className="mt-1 font-bold leading-6">{c}</h3></article>)}</div>
      <section className="mt-10 rounded-3xl bg-[#071426] p-7 text-white"><CheckCircle2 className="h-8 w-8 text-[#d6ad63]"/><h2 className="mt-4 font-serif text-3xl text-[#fff7e7]">Leitura dentro da LDR Academy</h2><p className="mt-3 max-w-3xl text-white/75">O leitor digital é o formato principal. Após a confirmação do pagamento, o conteúdo fica disponível na conta do comprador com acesso vitalício.</p></section>
    </section>
  </main>;
}
