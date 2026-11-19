import { createFileRoute } from "@tanstack/react-router";
import { MasterArea } from "@/features/feira360/dashboards";

export const Route = createFileRoute("/_authenticated/admin/feira360")({
  component: MasterArea,
});
