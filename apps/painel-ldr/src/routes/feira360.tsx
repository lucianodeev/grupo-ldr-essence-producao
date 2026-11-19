import { createFileRoute } from "@tanstack/react-router";
import { Marketplace } from "@/features/feira360/public";

import { feiraSource } from "@/features/feira360/model";

export const Route = createFileRoute("/feira360")({
  head: () => ({ meta: [{ title: "FEIRA 360 | Ecossistema LDR" }] }),
  validateSearch: feiraSource,
  component: () => <Marketplace source={Route.useSearch().ref ?? ""} />,
});
