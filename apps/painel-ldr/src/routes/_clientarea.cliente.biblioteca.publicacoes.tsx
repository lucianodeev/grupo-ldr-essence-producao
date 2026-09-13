import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route=createFileRoute("/_clientarea/cliente/biblioteca/publicacoes")({component:PublicacoesHub});

function PublicacoesHub(){
  return <Navigate to="/cliente/biblioteca/publicacoes/$slug" params={{slug:"revista-psicanalise-no-mundo"}} replace/>;
}
