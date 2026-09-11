import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos/lideranca-gestao-pessoas")({
  beforeLoad: () => {
    throw redirect({ to: "/cliente/treinamentos/lideranca-gestao" });
  },
});
