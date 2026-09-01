# Estrutura do repositório

## Raiz

`lucianodeev/grupo-ldr-essence-producao`

## Aplicações principais

### `apps/painel-ldr`
Aplicação full-stack principal. Contém rotas públicas e autenticadas, painéis, funções server-side, integrações Supabase, Stripe, agenda, biblioteca, marketplace, profissionais, empresas, funcionários, clientes e administração.

Pastas importantes:
- `src/routes`: páginas e rotas API.
- `src/lib`: regras de negócio e server functions.
- `src/components`: componentes de UI.
- `src/integrations/supabase`: cliente, sessão, middleware e autenticação.
- `src/styles.css`: estilos globais/design tokens.

### `apps/luciano-empreendedor`
Site público/estático e funções Netlify legadas. Parte dos fluxos antigos de checkout/biblioteca foi movida para o Painel do Cliente.

## Arquivos de referência

- `PROJETOS.json`: identifica apps/domínios.
- `README_PUBLICAR_NETLIFY.md`: separação de runtimes e publicação.
- `apps/painel-ldr/package.json`: dependências e scripts.

## Para o app

O programador deve tratar `apps/painel-ldr` como fonte principal de regras e contratos. O site público serve como referência de conteúdo/marketing, não como backend mobile.
