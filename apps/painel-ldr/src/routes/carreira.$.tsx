import { Link, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/carreira/$")({component: CareerNotFound});
function CareerNotFound() { return <main className="mx-auto max-w-4xl px-5 py-12"><h1 className="text-3xl font-bold text-[#07345b]">Página não encontrada</h1><p className="mt-4">Escolha uma área para continuar.</p><nav className="mt-6 flex flex-wrap gap-5"><Link to="/carreira">LDR Carreira</Link><Link to="/carreira/vagas">Vagas abertas</Link><Link to="/carreira/empresa">Área da empresa</Link></nav></main>; }
