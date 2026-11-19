import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/features/feira360/public";

export const Route = createFileRoute("/feira360_/p/$partner_/s/$service")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } =>
    typeof search["ref"] === "string" && /^[A-Za-z0-9_-]{1,60}$/.test(search["ref"])
      ? { ref: search["ref"] }
      : {},
  component: Service,
});

function Service() {
  const { partner, service } = Route.useParams();
  return <Detail partner={partner} service={service} source={Route.useSearch().ref ?? ""} />;
}
