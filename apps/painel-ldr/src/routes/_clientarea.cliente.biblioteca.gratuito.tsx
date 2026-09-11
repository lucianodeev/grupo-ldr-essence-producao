import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route=createFileRoute("/_clientarea/cliente/biblioteca/gratuito")({component:FreeShortcut});
function FreeShortcut(){return <Navigate to="/cliente/biblioteca/cursos-gratuitos" replace/>;}
