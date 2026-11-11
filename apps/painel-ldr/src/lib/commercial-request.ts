import { z } from "zod";
export const COMMERCIAL_INTERESTS = ["Contratação de serviços", "Demonstração comercial", "Parceria institucional", "Licenciamento de módulos", "Proposta de aquisição de ativos"] as const;
export const COMMERCIAL_SOLUTIONS = ["Recrutamento e seleção", "Consultoria de recursos humanos", "Desenvolvimento de talentos", "Gestão de pessoas", "Formação empresarial", "Empregabilidade e carreira", "Bem-estar organizacional", "Rede Acadêmica", "LDR ONE", "Soluções personalizadas"] as const;
const schema = z.object({
  organization: z.string().trim().min(2).max(160), name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254), interest: z.enum(COMMERCIAL_INTERESTS), solution: z.enum(COMMERCIAL_SOLUTIONS),
  message: z.string().trim().min(5).max(3000), consent: z.literal(true), website: z.string().max(0),
});
export function commercialSupportPayload(input: unknown) {
  const d = schema.parse(input);
  return { p_name: d.name, p_email: d.email.toLowerCase(), p_phone: "", p_subject: "Serviços para empresas",
    p_message: `Organização: ${d.organization}\nInteresse: ${d.interest}\nSolução: ${d.solution}\n\n${d.message}`,
    p_source_project: "Central Empresas LDR", p_source_url: "https://ldrecossistema.online/empresas/proposta",
    p_language: "pt", p_wants_luciano: false, p_consent: d.consent, p_website: d.website };
}
export function commercialProtocol(result: unknown): string {
  const value = typeof result === "string" ? result : typeof result === "object" && result !== null && "protocol" in result ? result.protocol : null;
  if (typeof value !== "string" || !value.trim()) throw new Error("Protocolo não confirmado.");
  return value.trim();
}
