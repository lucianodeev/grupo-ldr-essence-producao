import { createFileRoute } from "@tanstack/react-router";
import { Marketplace } from "@/features/feira360/public";

export const Route = createFileRoute("/feira360")({
  head: () => ({ meta: [{ title: "FEIRA 360 | Ecossistema LDR" }] }),
  component: Marketplace,
});
