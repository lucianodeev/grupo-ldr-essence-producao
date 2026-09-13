import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalFormationPublicPage } from "@/components/professional-formation-public-page";

export const Route=createFileRoute("/formacao/$slug")({component:FormationPublicRoute});

function FormationPublicRoute(){
  const {slug}=Route.useParams();
  return <ProfessionalFormationPublicPage slug={slug}/>;
}
