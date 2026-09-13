import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisEbookPublicPage } from "@/components/psychoanalysis-ebook-public-page";
export const Route=createFileRoute("/ebook-psicanalise-no-mundo")({component:()=> <PsychoanalysisEbookPublicPage productKey="ebook_psicanalise_no_mundo"/>});
