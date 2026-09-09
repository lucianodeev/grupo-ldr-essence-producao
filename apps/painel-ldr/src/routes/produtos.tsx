import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const PRODUCTS_PUBLIC_URL = "https://crimson-island-3178.hosted.pageshare.ai";

function ProductsPublicRedirect() {
  useEffect(() => {
    window.location.replace(PRODUCTS_PUBLIC_URL);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Produtos LDR</h1>
        <p className="mt-3 text-sm text-muted-foreground">Abrindo a página pública de produtos…</p>
        <a
          href={PRODUCTS_PUBLIC_URL}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
        >
          Abrir produtos
        </a>
      </div>
    </main>
  );
}

export const Route=createFileRoute("/produtos")({
  head:()=>({
    meta:[
      {title:"Produtos | Grupo LDR Essence"},
      {name:"description",content:"Treinamento, eBook e livro digital do ecossistema LDR."}
    ],
    links:[{rel:"canonical",href:"https://ldrrhestrategia.com/produtos"}]
  }),
  component:ProductsPublicRedirect
});
