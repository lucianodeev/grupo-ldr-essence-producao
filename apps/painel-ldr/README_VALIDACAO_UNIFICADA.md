# Ecossistema LDR — validação unificada

Branch preparada: `deploy/cloudflare-preview`.

## Objetivo

Executar o mesmo aplicativo LDR em um único host de validação, preservando o comportamento dos domínios oficiais na `main`.

Host de validação esperado:

`https://ecossistema-ldr-validacao.llucianouam.chatgpt.site`

Também é aceito qualquer host `*.workers.dev`, `*.pages.dev` ou localhost.

## Comportamento

No host de validação:

- não redirecionar Clínica Social para outro domínio;
- não redirecionar Biblioteca/Rede Acadêmica para `ldracademy.online`;
- não redirecionar admin/cliente/profissional para os portais oficiais;
- links absolutos internos da LDR são convertidos para a rota equivalente no host atual;
- links externos, Stripe, fontes e terceiros permanecem externos;
- os domínios oficiais continuam com a lógica atual quando esta branch não é usada.

## Rotas mínimas de aceite

- `/`
- `/ecossistema`
- `/cliente/login`
- `/cliente`
- `/cliente/biblioteca`
- `/cliente/rede-academica`
- `/clinica-social`
- `/clinica-social/solicitar`
- `/clinica-social/profissionais`
- `/profissionais`
- `/profissional/login`
- `/painel-profissional`
- `/empresa/login`
- `/empresa`
- `/carreira`
- `/carreira/vagas`
- `/admin`
- `/falar-com-ecossistema`

## Variáveis/secrets obrigatórios no ambiente de publicação

Servidor:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — somente secret server-side, nunca expor no navegador.
- `CLIENT_PANEL_URL` = origem do host de validação quando o provedor aceitar essa variável.

Cliente/build:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Pagamentos, quando forem testados:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- demais IDs/variáveis Stripe já usados pelo projeto.

## Supabase

Projeto preservado: `sfrcsrzuoqdscflfuwik`.

Não criar banco paralelo. Não substituir tabelas. Não remover RLS. A chave `service_role` permanece exclusivamente no servidor.

Para login/redefinição de senha no host de validação, o host publicado precisa constar nas URLs de redirecionamento autorizadas do Supabase Auth.

## Publicação

Antes de apontar domínio oficial:

1. publicar esta branch em preview;
2. configurar secrets;
3. validar login/logout e persistência de sessão;
4. validar Biblioteca, conteúdos e permissões;
5. validar Clínica Social e formulários;
6. validar Rede Acadêmica;
7. validar Carreira/vagas;
8. validar áreas cliente, profissional, empresa e admin;
9. validar refresh direto em cada rota;
10. somente após aceite promover/publicar.

A `main` não deve ser alterada durante esta validação.
