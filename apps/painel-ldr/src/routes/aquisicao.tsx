import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/aquisicao")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
  head: () => ({
    meta: [
      { title: "Ecossistema LDR" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: () => null,
});
