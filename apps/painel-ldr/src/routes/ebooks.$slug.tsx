import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";
import { PsychoanalysisEbookPublicPage } from "@/components/psychoanalysis-ebook-public-page";
import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";

export const Route=createFileRoute("/ebooks/$slug")({component:Page});

function Page(){
  const {slug}=Route.useParams();
  if(slug==="a-coragem-de-comecar") return <CommercialPublicPage kind="ebook"/>;
  const ebook=PSYCHOANALYSIS_EBOOKS.find((item)=>item.slug===slug);
  if(!ebook) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">eBook não encontrado.</h1><a className="mt-6 inline-flex rounded-xl bg-[#071426] px-5 py-3 text-sm font-black text-white" href="/">Voltar para a LDR Essence Academy</a></main>;
  return <PsychoanalysisEbookPublicPage productKey={ebook.key}/>;
}
