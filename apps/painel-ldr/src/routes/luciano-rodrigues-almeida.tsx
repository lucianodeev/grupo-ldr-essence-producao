import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/luciano-rodrigues-almeida")({
  beforeLoad: () => { throw redirect({ to: "/ecossistema", replace: true }); },
});
