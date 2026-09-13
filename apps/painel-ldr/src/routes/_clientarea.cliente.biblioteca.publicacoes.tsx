import { Navigate, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";

export const Route=createFileRoute("/_clientarea/cliente/biblioteca/publicacoes")({component:PublicacoesHub});

function PublicacoesHub(){
  const location=useLocation();
  const isHub=location.pathname.replace(/\/+$/g,"")==="/cliente/biblioteca/publicacoes";
  if(isHub){
    return <Navigate to="/cliente/biblioteca/publicacoes/$slug" params={{slug:"revista-psicanalise-no-mundo"}} replace/>;
  }
  return <Outlet/>;
}
