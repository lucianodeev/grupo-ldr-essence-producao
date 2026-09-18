import { createFileRoute } from "@tanstack/react-router";
import { CompanyJobsPage } from "@/components/career-company-form";
export const Route = createFileRoute("/carreira/empresa/publicar")({ component: CompanyJobsPage });
