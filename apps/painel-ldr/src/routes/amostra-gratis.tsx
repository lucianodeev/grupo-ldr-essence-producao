import { createFileRoute } from "@tanstack/react-router";
import { DigitalPreviewReader } from "@/components/digital-preview-reader";

export const Route = createFileRoute("/amostra-gratis")({
  component: DigitalPreviewReader,
});
