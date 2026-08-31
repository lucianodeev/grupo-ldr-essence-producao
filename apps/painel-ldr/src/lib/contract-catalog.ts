// Whitelist client-safe dos serviços que o cliente pode contratar sozinho.
// Nenhum preço é definido aqui: valores e links vêm sempre do catálogo do banco.

export type ContractGroup = "psicanalise" | "mentoria" | "servicos";

export type ContractOption = {
  catalogKey: string;
  group: ContractGroup;
  region: "eu" | "br" | null;
  originalCents: number | null;
};

const serviceKeys = [
  "landing_page", "site_one_page", "site_institucional_entrada", "site_empresarial_entrada",
  "catalogo_digital_entrada", "loja_virtual_entrada", "diagnostico_digital", "plano_marketing",
  "identidade_visual_entrada", "criativos_5", "criativos_10", "email_marketing_conteudo",
  "meta_ads_setup", "google_ads_setup", "manutencao_essencial", "manutencao_profissional",
  "manutencao_empresarial", "social_inicial", "social_crescimento", "social_profissional",
  "social_empresarial", "ads_uma_plataforma", "ads_meta_google", "orientacao_profissional_eu",
  "orientacao_profissional_br", "plano_carreira_eu", "plano_carreira_br", "transicao_carreira_eu",
  "transicao_carreira_br", "carreira_internacional_eu", "carreira_internacional_br", "diagnostico_projeto",
] as const;

export const CONTRACT_OPTIONS: ContractOption[] = [
  { catalogKey: "psicanalise_clinica_eu", group: "psicanalise", region: "eu", originalCents: null },
  { catalogKey: "psicanalise_pacote_4_eu", group: "psicanalise", region: "eu", originalCents: 12000 },
  { catalogKey: "psicanalise_pacote_8_eu", group: "psicanalise", region: "eu", originalCents: 24000 },
  { catalogKey: "psicanalise_pacote_12_eu", group: "psicanalise", region: "eu", originalCents: 36000 },
  { catalogKey: "psicanalise_clinica_br", group: "psicanalise", region: "br", originalCents: null },
  { catalogKey: "psicanalise_pacote_4_br", group: "psicanalise", region: "br", originalCents: 72000 },
  { catalogKey: "psicanalise_pacote_8_br", group: "psicanalise", region: "br", originalCents: 144000 },
  { catalogKey: "psicanalise_pacote_12_br", group: "psicanalise", region: "br", originalCents: 216000 },
  { catalogKey: "mentoria_sessao", group: "mentoria", region: null, originalCents: null },
  { catalogKey: "mentoria_4", group: "mentoria", region: null, originalCents: null },
  { catalogKey: "mentoria_8", group: "mentoria", region: null, originalCents: null },
  ...serviceKeys.map((catalogKey) => ({
    catalogKey,
    group: "servicos" as const,
    region: catalogKey.endsWith("_br") ? ("br" as const) : catalogKey.endsWith("_eu") ? ("eu" as const) : null,
    originalCents: null,
  })),
];

export const CONTRACT_KEYS = CONTRACT_OPTIONS.map((o) => o.catalogKey);

export function contractOption(catalogKey: string): ContractOption | undefined {
  return CONTRACT_OPTIONS.find((o) => o.catalogKey === catalogKey);
}

export type ContractItem = {
  catalogKey: string;
  name: string;
  group: ContractGroup;
  region: "eu" | "br" | null;
  currency: string;
  amountCents: number;
  originalCents: number | null;
  sessions: number;
  paymentUrl: string | null;
};
