import { createFileRoute } from "@tanstack/react-router";
import { DigitalReaderV2 } from "@/components/digital-reader-v2";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca/$productKey")({ component: DigitalReaderRoute });

function DigitalReaderRoute(){
  const {productKey}=Route.useParams();
  if(!new Set(["ebook_coragem_comecar","livro_menino_mamao","ebook_pratica_clinica_psicanalise","ebook_psicanalise_no_mundo","ebook_estudos_caso_psicanalise","ebook_psicanalise_autismo"]).has(productKey)){
    return <section className="s8-card">Produto inválido.</section>;
  }
  return <DigitalReaderV2 productKey={productKey as any}/>;
}
