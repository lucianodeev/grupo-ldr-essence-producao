export const categories = {
  consultoria: "Consultoria",
  tecnologia: "Tecnologia",
  formacao: "Formação",
  criativos: "Serviços criativos",
  "bem-estar": "Bem-estar",
  outros: "Outros serviços",
};

export const modalities = { online: "Online", presencial: "Presencial", hibrido: "Híbrido" };

export const statuses: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  suspended: "Suspenso",
  new: "Novo",
  forwarded: "Encaminhado",
  in_progress: "Em atendimento",
  won: "Contratado",
  closed: "Encerrado",
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  category: keyof typeof categories;
  modality: keyof typeof modalities;
  price_cents: number | null;
};

export type Listing = Service & {
  partner_slug: string;
  partner_name: string;
  partner_bio: string;
  locality: string;
  featured: boolean;
};

export type Partner = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  locality: string;
  status: string;
  plan: "basic" | "premium";
  featured_until: string | null;
  services: (Service & { id: string; status: string })[];
};

export type Quote = {
  id: string;
  title: string;
  brief: string;
  customer_email: string;
  status: string;
  created_at: string;
  commission_cents: number | null;
};

export type MasterQuote = Quote & {
  partner_name: string;
  partner_status: string;
  source: string | null;
  contract_cents: number | null;
  commission_bps: number;
};

export type PartnerDashboard = {
  partner: Pick<Partner, "name" | "slug" | "status" | "plan"> | null;
  quotes: Quote[];
  services: (Pick<Service, "slug" | "title"> & { status: string })[];
};
export type MasterDashboard = {
  rate: number;
  partners: Partner[];
  quotes: MasterQuote[];
  audit: { id: number; action: string; target_id: string | null; created_at: string }[];
};

export function money(cents: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function decimalToHundredths(value: string): number | null {
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(/[.,]/);
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
