import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Library, Sparkles } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/produtos")({
  head:()=>({
    meta:[
      {title:"Produtos | Grupo LDR Essence"},
      {name:"description",content:"Produtos, eBooks, livros, formações e acessos digitais do Ecossistema LDR."}
    ],
    links:[{rel:"canonical",href:"https://ldracademy.online/produtos"}]
  }),
  component:ProductsPublicPage
});

const COPY={
  pt:{title:"Produtos do Ecossistema LDR",sub:"Acesse os produtos e formações já existentes sem sair do ecossistema.",back:"← Voltar ao Ecossistema",open:"Abrir",ebooks:"eBooks e livros",learning:"Formações e aprendizagem",access:"Acessos digitais"},
  en:{title:"LDR Ecosystem Products",sub:"Access existing products and programs without leaving the ecosystem.",back:"← Back to Ecosystem",open:"Open",ebooks:"eBooks and books",learning:"Programs and learning",access:"Digital access"},
  fr:{title:"Produits de l’écosystème LDR",sub:"Accédez aux produits et formations existants sans quitter l’écosystème.",back:"← Retour à l’écosystème",open:"Ouvrir",ebooks:"eBooks et livres",learning:"Formations et apprentissage",access:"Accès numériques"},
  es:{title:"Productos del Ecosistema LDR",sub:"Accede a productos y formaciones existentes sin salir del ecosistema.",back:"← Volver al Ecosistema",open:"Abrir",ebooks:"eBooks y libros",learning:"Formaciones y aprendizaje",access:"Accesos digitales"}
} as const;

const ebookItems=[
  {title:"A Coragem de Começar",to:"/acoragemdecomecar"},
  {title:"O Menino que Vendia Mamão",to:"/livros"},
  {title:"A Prática Clínica da Psicanálise",to:"/ebook-pratica-clinica-psicanalise"},
  {title:"A Psicanálise no Mundo",to:"/ebook-psicanalise-no-mundo"},
  {title:"Estudos de Caso",to:"/ebook-estudos-caso-psicanalise"},
  {title:"Psicanálise e Autismo",to:"/ebook-psicanalise-autismo"}
] as const;

const learningItems=[
  {title:"Formação em Psicanálise",to:"/formacao-psicanalise"},
  {title:"Formação em Massoterapia",to:"/formacao-massoterapia"},
  {title:"Tricologia e Terapia Capilar",to:"/formacao-tricologia-terapia-capilar"},
  {title:"Recrutamento & Seleção",to:"/formacao-recrutamento-selecao"},
  {title:"Marketing Digital",to:"/formacao-marketing-digital"},
  {title:"Cursos gratuitos",to:"/cliente/biblioteca/cursos-gratuitos"}
] as const;

const accessItems=[
  {title:"Biblioteca LDR",to:"/cliente/biblioteca"},
  {title:"LDR PASS",to:"/ldr-pass"},
  {title:"Rede Acadêmica",to:"/cliente/rede-academica"},
  {title:"LDR Carreira",to:"/carreira"}
] as const;

function Section({title,items,icon:Icon,open}:{title:string;items:readonly {title:string;to:string}[];icon:typeof BookOpen;open:string}){
  return <section className="rounded-[28px] border border-[#e5d1ac] bg-white p-5 shadow-sm sm:p-7">
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6 text-[#9a6a20]"/>
      <h2 className="font-serif text-2xl font-bold text-[#25170f]">{title}</h2>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map(item=><Link key={item.to} to={item.to} className="rounded-2xl border border-[#ead9b9] bg-[#fffaf2] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <p className="font-bold text-[#25170f]">{item.title}</p>
        <span className="mt-2 inline-flex text-sm font-black text-[#1d3158]">{open} →</span>
      </Link>)}
    </div>
  </section>;
}

function ProductsPublicPage(){
  const {locale}=useI18n();
  const c=COPY[locale]??COPY.pt;
  return <main className="min-h-screen bg-[#f8f3e8] text-[#25170f]">
    <header className="border-b border-[#d6ad63]/40 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link to="/ecossistema" className="font-serif text-2xl font-bold">Grupo LDR Essence</Link>
        <LanguageSelect/>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/ecossistema" className="text-sm font-black text-[#7a4d14]">{c.back}</Link>
      <div className="mt-5 rounded-[32px] border border-[#d6ad63]/45 bg-white p-6 shadow-sm sm:p-9">
        <Sparkles className="h-7 w-7 text-[#9a6a20]"/>
        <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#6f6358]">{c.sub}</p>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Section title={c.ebooks} items={ebookItems} icon={BookOpen} open={c.open}/>
        <Section title={c.learning} items={learningItems} icon={GraduationCap} open={c.open}/>
      </div>
      <div className="mt-5">
        <Section title={c.access} items={accessItems} icon={Library} open={c.open}/>
      </div>
    </div>
  </main>;
}
