import { createFileRoute } from "@tanstack/react-router";
import { DigitalReaderV2 } from "@/components/digital-reader-v2";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca/$productKey")({ component: DigitalReaderRoute });

function DigitalReaderRoute(){
  const {productKey}=Route.useParams();
  if(productKey!=="ebook_coragem_comecar"&&productKey!=="livro_menino_mamao"){
    return <section className="s8-card">Produto inválido.</section>;
  }
  return <DigitalReaderV2 productKey={productKey}/>;
}
