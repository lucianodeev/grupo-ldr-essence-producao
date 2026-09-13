import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisEbookPublicPage } from "@/components/psychoanalysis-ebook-public-page";
export const Route=createFileRoute("/ebook-estudos-caso-psicanalise")({component:()=> <PsychoanalysisEbookPublicPage productKey="ebook_estudos_caso_psicanalise"/>});
