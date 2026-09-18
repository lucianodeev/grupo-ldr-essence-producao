import { createFileRoute } from "@tanstack/react-router";
import { DigitalReaderV2 } from "@/components/digital-reader-v2";

const READER_PRODUCTS = new Set([
  "ebook_coragem_comecar",
  "livro_menino_mamao",
  "ebook_pratica_clinica_psicanalise",
  "ebook_psicanalise_no_mundo",
  "ebook_estudos_caso_psicanalise",
  "ebook_psicanalise_autismo",
  "ebook_psicologia_psicanalise_terapias",
  "ebook_jornalismo_era_digital",
  "ebook_corpo_trabalho_escuta",
  "ebook_comportamento_humano",
  "ebook_estetica_bem_estar",
  "ebook_tricologia_cuidado",
  "ebook_ia_novos_milionarios",
  "ebook_imigracao_efeitos_psicologicos",
  "ebook_psicanalise_vs_psiquiatria",
  "ebook_falar_com_quem_feriu",
  "ebook_da_pobreza_ao_primeiro_contrato",
]);

export const Route = createFileRoute("/_clientarea/cliente/biblioteca/$productKey")({ component: DigitalReaderRoute });

function DigitalReaderRoute(){
  const {productKey}=Route.useParams();
  if(!READER_PRODUCTS.has(productKey)){
    return <section className="s8-card">Produto inválido.</section>;
  }
  return <DigitalReaderV2 productKey={productKey as any}/>;
}
