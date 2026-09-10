import { createFileRoute } from "@tanstack/react-router";
import { DigitalPreviewReader } from "@/components/digital-preview-reader";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca/amostra")({
  component: DigitalPreviewReader,
});
