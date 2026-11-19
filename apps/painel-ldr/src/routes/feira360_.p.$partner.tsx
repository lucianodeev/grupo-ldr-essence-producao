import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/features/feira360/public";

export const Route = createFileRoute("/feira360_/p/$partner")({
  component: Partner,
});

function Partner() {
  const { partner } = Route.useParams();
  return <Detail key={partner} partner={partner} />;
}
