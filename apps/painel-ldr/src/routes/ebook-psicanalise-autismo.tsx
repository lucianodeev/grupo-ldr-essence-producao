import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisEbookPublicPage } from "@/components/psychoanalysis-ebook-public-page";
export const Route=createFileRoute("/ebook-psicanalise-autismo")({component:()=> <PsychoanalysisEbookPublicPage productKey="ebook_psicanalise_autismo"/>});
