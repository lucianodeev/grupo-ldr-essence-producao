import { createFileRoute } from "@tanstack/react-router";
import { PartnerArea } from "@/features/feira360/dashboards";

export const Route = createFileRoute("/feira360_/parceiro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel do Parceiro | FEIRA 360" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PartnerArea,
});
