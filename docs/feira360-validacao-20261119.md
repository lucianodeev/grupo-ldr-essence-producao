# FEIRA 360 — implementação e validação

A implementação parte do commit `9309bb78d0d34e319c76f09772e344b8e5edd9a9` na branch `feat/feira360-marketplace-20261119`.

## Fluxo do piloto

| Entrada | Operação |
| --- | --- |
| `/` | O botão “Encontrar serviços” abre a FEIRA 360. |
| `/feira360` | Pesquisa por serviço ou parceiro, filtros por categoria, localidade e modalidade, e catálogo de serviços aprovados. |
| `/feira360/p/$partner` | Perfil público, descrição do parceiro e serviços aprovados. |
| `/feira360/p/$partner/s/$service` | Detalhes, preço inicial em EUR ou orçamento personalizado, e pedido com protocolo e referência de origem opcional `?ref=`. |
| `/feira360/parceiro` | Candidatura com primeiro serviço, envio de serviços adicionais para revisão e acompanhamento dos pedidos encaminhados à conta. |
| `/admin/feira360` | Moderação, encaminhamento, registo do valor contratado, taxa, plano, destaque e histórico recente de auditoria. |

O login do cliente reutiliza o Google OAuth existente e conserva a página e a referência de origem. A conta precisa de e-mail confirmado para candidaturas e pedidos. O pedido regista o consentimento versionado, usa o e-mail da conta e limita o número de envios e duplicações. O encaminhamento é operacional e acontece no Painel do Parceiro por ação da Área Master. O parceiro pode marcar a oportunidade como em atendimento.

A comissão incide sobre o valor em EUR informado pela Área Master ao marcar a oportunidade como contratada. A taxa por defeito é de 15% e fica gravada quando o pedido é recebido. O cálculo arredonda ao cêntimo e o valor contratado é registado uma vez por oportunidade. A atribuição de plano Premium e de destaque por 30 dias é manual. O registo de comissão, plano e destaque dispensa integração de cobrança.

## Segurança e dados

A migração adiciona tabelas com RLS e revoga o acesso direto de `anon` e `authenticated`. A RPC pública projeta exclusivamente informações comerciais aprovadas. As operações autenticadas identificam o utilizador com `auth.uid()`. A gestão verifica `private.is_superadmin`. As oportunidades e os contactos ficam indisponíveis a terceiros e ao parceiro até o encaminhamento. Parceiros suspensos perdem o acesso aos pedidos.

Os painéis apresentam até 100 registos recentes por lista, com prioridade para candidaturas pendentes ou pedidos novos na Área Master. O histórico visível apresenta as últimas 30 operações.

## Verificação local

| Comando ou verificação | Resultado |
| --- | --- |
| `npm ci` | Dependências instaladas. |
| `npm run test:feira360` | 4 testes aprovados, incluindo execução da migração em PostgreSQL local via PGlite, isolamento por conta, avanço de estado, filtros e cálculo. |
| `npm --prefix apps/painel-ldr test` | 59 testes aprovados. |
| `npm --prefix apps/painel-ldr run test:regressions` | 298 testes aprovados. |
| `npm --prefix apps/painel-ldr run typecheck` | Aprovado. |
| `NODE_OPTIONS=--max-old-space-size=5632 npm --prefix apps/painel-ldr run build:render` | Build local do adaptador Render. O primeiro build, com heap padrão, esgotou a memória; a ampliação do heap permitiu o build. |
| Teste HTTP local do build Render | HTTP 200 e conteúdo esperado em seis rotas, incluindo a homepage com o botão, a vitrine, perfil, serviço, entrada do parceiro e entrada Master. As permissões foram verificadas na base de dados isolada. |

O Chromium local não abriu devido à restrição de sockets do ambiente. A validação visual interativa e o teste com o OAuth real ficam para a homologação.

## Antes de publicar

Aplicar a migração `20261119095000_feira360.sql` a um Supabase de homologação e repetir a jornada com quatro contas separadas (cliente, dois parceiros e Master), incluindo OAuth real de teste. Confirmar o aviso de privacidade, o prazo de retenção dos pedidos e os termos comerciais antes do piloto público. Definir preços e condições de faturação antes de ligar qualquer cobrança do Premium ou destaque.

Para reverter a disponibilização preservando os registos, regressar ao build anterior e revogar, por transação, a execução de `public.feira360_account(text,jsonb)` para `authenticated` e de `public.feira360_catalog(text,text,text,text,text,text,integer)` para `anon` e `authenticated`. As permissões podem ser restabelecidas com os `GRANT EXECUTE` da migração. A remoção física das tabelas depende de exportação e autorização de eliminação dos dados.
