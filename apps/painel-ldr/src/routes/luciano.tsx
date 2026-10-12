import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/luciano")({
  beforeLoad: () => {
    throw redirect({ to: "/ecossistema", replace: true });
  },
});
