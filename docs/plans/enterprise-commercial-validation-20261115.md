# PR #301 — implementação comercial e validação

Estado: desenvolvimento, sem merge ou alterações de produção. Continuação de fc7c55404cfa803bd9185bb9429d112f39b804fd, na mesma branch e no mesmo PR.

## Comportamento implementado

- A raiz do domínio oficial passa a servir a homepage empresarial. `/ecossistema` continua disponível e `/?area=academy` mantém a entrada explícita da Academy.
- Os seis cartões empresariais selecionam a solução no formulário existente. Consultoria estratégica, tecnologia/IA e mentoria foram acrescentadas às opções válidas.
- O orçamento continua gratuito: `ecosystem_contacts` é a entrada, `orders` é a proposta/pedido e `ecosystem_contact_messages` é a notificação interna. Não há outro CRM.
- Na central `/admin/contatos`, Master verificado e ativo pode preparar um rascunho e aprová-lo separadamente. O responsável inicial é o administrador; a gestão operacional completa existente continua em `/painel-profissional/pedidos`.
- Cliente, empresa, serviço, origem, preço, moeda, validade, âmbito, responsável, marcos de aprovação/aceitação, sessão Stripe e agenda são consultáveis na mesma operação.
- `/cliente/propostas` lista apenas propostas aprovadas/aceitas para o e-mail confirmado da identidade autenticada. Rascunhos, notas internas e URLs de checkout não são enviados pela listagem.
- O cliente confirma o aceite e inicia Checkout. O servidor lê o preço aprovado e associa a conta verificada. Não aceita preços do navegador. Cliques concorrentes e tentativas após falha reutilizam a mesma identidade Stripe e os parâmetros congelados.
- O webhook assinado valida pedido, cliente, produto, sessão, moeda, valor e modo Stripe para propostas/projetos. A confirmação financeira é condicional e o recibo é gravado depois da transição. Eventos duplicados, tardios, falhados, expirados e reembolsos integrais/parciais têm testes.
- Sessões de propostas usam produtos ativos do catálogo e o emissor de créditos existente. Projetos sem sessões têm zero créditos e não aparecem no agendamento autónomo. Pedidos cancelados também são excluídos. Um reembolso impede novos pedidos de horário.
- Projetos de preço fixo podem usar o mesmo checkout e ledger, mediante liberação explícita de chaves. Fluxos e preços de assinaturas existentes não foram alterados.

## Proteção de banco obrigatória

Migração preparada, NÃO aplicada em produção:
`apps/painel-ldr/supabase/migrations/20261115083845_enterprise_quote_financial_guard.sql`.

O trigger impede falsificação de aprovação, aceite e preço pela Data API, conserva o histórico e congela os termos aprovados, a identidade aceita e a validade do checkout. O probe `ldr_enterprise_quote_checkout_ready()` tem execução restrita a `service_role`. Preparação, aprovação e cobrança de propostas falham de forma fechada quando esta proteção não está instalada. Projetos fixos também exigem o probe antes da criação do pedido.

Reutiliza RLS, `orders`, `session_credits` e RPCs da agenda; não cria tabelas ou permissões públicas novas. As políticas e colunas existentes foram verificadas em modo leitura no projeto Supabase. O teste SQL usa o snapshot de esquema capturado e dados sintéticos, sem copiar linhas de produção.

## Evidências locais

- `node --test apps/painel-ldr/tests/*.test.cjs`: 186 testes passaram, incluindo 12 comportamentos de propostas, permissões Master, retorno do login, Academy, produtos e catálogo.
- `AGENDA_PG_PACKAGE="$PWD/apps/painel-ldr/package.json" node --test scripts/agenda/payment-webhook.test.mjs scripts/agenda/calendar-saga.test.mjs`: 33 testes passaram.
- `node --test scripts/agenda/calendar.test.mjs`: 15 testes de transporte Google passaram com mocks, incluindo conflito, identidade, falha e cancelamento.
- `ENTERPRISE_SQL_DRIVER=pglite ENTERPRISE_SQL_PACKAGE=/tmp/ldr-enterprise-sql/package.json node scripts/agenda/enterprise-quotes-sql.mjs`: 11 verificações passaram em PostgreSQL WASM isolado. Foram aplicados o esquema capturado, a migração existente da agenda e a nova proteção financeira; testados privilégios, imutabilidade, aceite, pagamento sintético, créditos únicos, reagendamento por dono, reembolso e projetos sem créditos.
- TypeScript e build Render locais passaram. Nenhum build local faz deploy.
- O teste antigo de roteamento `invoice.paid` do LDR ONE foi alinhado ao roteamento já existente para eventos recorrentes. Não houve alteração funcional de preços ou assinaturas.
- Nova workflow `Enterprise commercial safe checks`: permissões somente de leitura; aplicação, regressões e dois bancos PostgreSQL descartáveis, incluindo os testes existentes de concorrência e RLS da agenda. Não recebe credenciais de produção e não publica.

## Integrações: o que foi e não foi comprovado

Stripe: o endpoint oficial `/api/stripe/webhook` está ativo e inclui conclusão, confirmação assíncrona, falha, expiração e reembolso. A conexão disponível oferece somente a conta live. Não foi criada cobrança, não foram usados cartões e não foi executado um ciclo real em sandbox. As simulações descritas acima são isoladas; não equivalem a pagamento validado no provedor.

Supabase: colunas e políticas existentes conferidas em modo leitura. Não foi executada migração, inserção de pedidos ou confirmação financeira no banco de produção.

Google Calendar: registro do refresh token presente, protegido por RLS e armazenado pelo código AES-256-GCM existente, com escopos de eventos e disponibilidade. Credenciais intactas. Testes desta etapa são mocks e SQL isolado; não foi feito novo teste remoto de disponibilidade/criação/limpeza em Calendar nesta missão.

Visual: preparados renders isolados dos novos componentes em 390 e 1280 px, com CSS compilado e dados fictícios. A inspeção desses arquivos pelo navegador foi bloqueada pela política de protocolo local. Esses renders não são uma aprovação visual. Revisão completa desktop/telemóvel e navegação com sessão de teste permanecem pendentes numa prévia HTTPS de desenvolvimento.

Limite operacional: reembolso bloqueia novos agendamentos e a visualização de links pagos. A remoção de um evento Google já confirmado continua pelo cancelamento operacional existente; não foi acrescentada uma rotina automática de limpeza de Calendar disparada por reembolso.

## Checklist antes de pedir aprovação de publicação

- [ ] GitHub Actions aprovado no SHA final, inclusive PostgreSQL real e concorrência.
- [ ] Sandbox Stripe e Supabase de desenvolvimento provisionados/conectados sem trocar chaves de produção.
- [ ] Aplicar a migração apenas no banco de desenvolvimento e confirmar probe.
- [ ] Configurar somente no ambiente de desenvolvimento `ENTERPRISE_QUOTES_CHECKOUT_ENABLED=true`, chave Stripe de teste, assinatura do webhook de teste e, para sessões, agenda de testes.
- [ ] Para projetos fixos, liberar explicitamente `FIXED_PROJECT_CHECKOUT_ENABLED=true` e `FIXED_PROJECT_CHECKOUT_CATALOG_KEYS` com chaves ativas de pagamento único revisadas. Nunca incluir assinaturas/planos mensais nessa liberação.
- [ ] Testar a jornada real de teste: solicitar gratuitamente, preparar, aprovar, consultar por conta correta, aceitar, pagar no sandbox e receber evento assinado. Confirmar pedido/entrega ou créditos e agenda conforme o serviço.
- [ ] Validar falha, expiração, reembolso, repetição e a operação de cancelamento quando já existir evento Google; limpar apenas dados/eventos de teste.
- [ ] Revisão visual e navegação em computador e telemóvel, inclusive Master e cliente.
- [ ] Aprovação expressa para migração de produção, configuração, merge e publicação. Não habilitar a nova cobrança em produção apenas por ter um build aprovado.

## Rotas de revisão (na prévia da branch, ainda não disponíveis em produção)

| Rota | Verificação |
| --- | --- |
| `/` | Homepage empresarial e seis serviços |
| `/?area=academy` | Entrada Academy preservada |
| `/ecossistema` | Mapa e vitrine atuais |
| `/empresas/proposta` | Solicitação gratuita e seleção do serviço |
| `/admin/contatos` | Rascunho, aprovação e aviso de nova solicitação; exige Master |
| `/cliente/propostas` | Proposta aprovada, aceite e checkout; exige conta verificada |
| `/cliente/contratar` | Serviços fixos e liberação por catálogo |
| `/cliente/agenda` | Somente sessões com pagamento/créditos |
| `/painel-profissional/pedidos` | Gestão existente de estados, responsável e histórico |

Não utilizar a prévia ligada a dados reais para criar propostas ou pedidos de teste. O formulário e as ações de pagamento só devem ser exercitados quando o backend e as chaves estiverem confirmados como ambientes de desenvolvimento.
