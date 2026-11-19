import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/features/feira360/public";

import { feiraSource } from "@/features/feira360/model";

export const Route = createFileRoute("/feira360_/p/$partner_/s/$service")({
  validateSearch: feiraSource,
  component: Service,
});

function Service() {
  const { partner, service } = Route.useParams();
  return <Detail partner={partner} service={service} source={Route.useSearch().ref ?? ""} />;
}
