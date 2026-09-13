import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CheckCircle2 } from "lucide-react";

export const Route=createFileRoute("/livros/$slug")({component:Page});

function Page(){
  const {slug}=Route.useParams();
  if(slug!=="o-menino-que-vendia-mamao") return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">Livro não encontrado.</h1><a className="mt-6 inline-flex rounded-xl bg-[#071426] px-5 py-3 text-sm font-black text-white" href="/">Voltar para a LDR Essence Academy</a></main>;
  return <main className="min-h-screen bg-[#f7f3e9] text-[#071426]">
    <section className="bg-gradient-to-br from-[#7a3f16] to-[#071426] px-4 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <BookOpen className="h-12 w-12 text-[#fff7e7]"/>
        <p className="mt-5 text-xs font-black tracking-[.2em] text-[#d6ad63]">LIVRO · LDR ESSENCE ACADEMY</p>
        <h1 className="mt-3 max-w-5xl font-serif text-4xl text-[#fff7e7] sm:text-6xl">O Menino que Vendia Mamão</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">Uma história de Luciano Rodrigues Almeida sobre coragem, iniciativa, recomeços e construção de oportunidades.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="/cliente/biblioteca/livro_menino_mamao" className="rounded-xl bg-[#d6ad63] px-6 py-4 text-sm font-black text-[#281605]">COMPRAR / ACESSAR</a><span className="rounded-xl border border-white/20 px-6 py-4 text-sm font-black">R$ 49,90 · € 20,00</span></div>
        <p className="mt-3 text-xs text-white/65">Pagamento único · acesso pela Biblioteca LDR Essence Academy.</p>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-4 md:grid-cols-3"><Card title="Uma história real" text="Experiências de trabalho, começo, adaptação e construção de caminhos possíveis."/><Card title="Empreendedorismo" text="Reflexões sobre iniciativa, oportunidade, persistência e transformação de experiência em ação."/><Card title="Leitura na Academy" text="Após a confirmação do pagamento, o conteúdo fica vinculado à conta do comprador."/></div><section className="mt-10 rounded-3xl bg-[#071426] p-7 text-white"><CheckCircle2 className="h-8 w-8 text-[#d6ad63]"/><h2 className="mt-4 font-serif text-3xl text-[#fff7e7]">Seu livro, seu acesso</h2><p className="mt-3 max-w-3xl text-white/75">Esta é a página pública individual e compartilhável do livro. O acesso do comprador continua usando a Biblioteca e a infraestrutura já existente da LDR Essence Academy.</p></section></section>
  </main>;
}
function Card({title,text}:{title:string;text:string}){return <article className="rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>}
