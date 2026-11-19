import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/features/feira360/public";

import { feiraSource } from "@/features/feira360/model";

export const Route = createFileRoute("/feira360_/p/$partner")({
  validateSearch: feiraSource,
  component: Partner,
});

function Partner() {
  const { partner } = Route.useParams();
  return <Detail key={partner} partner={partner} source={Route.useSearch().ref ?? ""} />;
}
