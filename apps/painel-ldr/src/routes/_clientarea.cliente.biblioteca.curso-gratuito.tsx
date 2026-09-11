import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route=createFileRoute("/_clientarea/cliente/biblioteca/curso-gratuito")({component:Shortcut});
function Shortcut(){return <Navigate to="/cliente/biblioteca/curso-gratuito-carreira" replace/>;}
