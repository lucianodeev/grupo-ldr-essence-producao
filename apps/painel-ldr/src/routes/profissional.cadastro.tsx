import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/profissional/cadastro")({
  head: () => ({ meta: [{ title: "Cadastro Profissional — Rede LDR" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ProfessionalRegistrationAlias,
});

function ProfessionalRegistrationAlias() {
  useEffect(() => {
    const target = new URL("/profissional/login", window.location.origin);
    target.searchParams.set("mode", "cadastro");
    const source = new URLSearchParams(window.location.search);
    const sellerRef = source.get("seller_ref");
    if (sellerRef) target.searchParams.set("seller_ref", sellerRef);
    window.location.replace(target.pathname + target.search);
  }, []);

  return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Abrindo cadastro profissional…</div>;
}
