import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisEbookPublicPage } from "@/components/psychoanalysis-ebook-public-page";
export const Route=createFileRoute("/ebook-pratica-clinica-psicanalise")({component:()=> <PsychoanalysisEbookPublicPage productKey="ebook_pratica_clinica_psicanalise"/>});
