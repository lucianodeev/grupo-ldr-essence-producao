# PR #316 — Validação E2E isolada de LDR Store e Serviços Profissionais

**Resultado:** os dois fluxos da aplicação passaram em Chromium, com Supabase Auth, PostgREST e PostgreSQL descartáveis e com pedidos e eventos Stripe simulados localmente. O ensaio com a infraestrutura da Stripe em modo de teste continua pendente.

## Ambiente executado

- Chromium headless a 390 px, build Render local e acesso por cookies da aplicação.
- PostgreSQL 18.6, Supabase Auth 2.198.0 e PostgREST 16.6, executados em loopback sem Docker. O banco utilizou os esquemas de teste já mantidos no repositório e uma edição de eBook sintética.
- A aplicação enviou as sessões a um simulador isolado. O runner assinou eventos com uma chave efémera e entregou-os ao endpoint de webhook da própria aplicação. Os valores, as sessões e os protocolos abaixo são sintéticos.

## Resultados observados

| Etapa | Evidência |
| --- | --- |
| Autenticação | A área de propostas redirecionou uma sessão anónima. O endpoint de sessão rejeitou um token inválido. O Supabase Auth bloqueou uma conta sem confirmação de e-mail. |
| Checkout do eBook | € 4,90. A primeira resposta do simulador perdeu-se após criar a sessão. Repetir no navegador manteve um pedido, a mesma chave de idempotência e a mesma sessão. Pedido `a925ad0b-1022-585e-a1ce-0ab8f1863de6`, sessão `cs_test_301331cf6fbe693cd01ec5ee`. |
| Pagamento e leitura | A falha de teste mudou o pedido para `falhou` e manteve o leitor bloqueado. O evento assinado de sucesso mudou o pedido para `pago` e abriu a edição na Biblioteca. O reenvio do evento foi reconhecido como duplicado. |
| Isolamento | Um segundo cliente autenticado não conseguiu abrir o livro, ver o pedido na API de dados nem ler o conteúdo diretamente por PostgREST. Também não viu a proposta, e o briefing ficou invisível ao seu papel. |
| Reembolso | O evento assinado de reembolso integral mudou o pedido para `reembolsado`. O cliente voltou a receber a tela de conteúdo indisponível. Uma confirmação de pagamento atrasada não reativou a leitura. |
| Serviço empresarial | O briefing gerou o protocolo `LDR-BE8DF5E55F` e chegou à Área Master. A proposta de € 123,45 foi preparada, aprovada e aceite pelo cliente autenticado. O checkout de teste recebeu URLs de retorno em loopback. |
| Reconciliação do serviço | O webhook marcou `pago` com a proposta em `accepted`. O cliente e a Área Master mostraram a confirmação. Pedido `0ab49d82-0991-51f9-ad29-ef6598214869`, sessão `cs_test_8fc13578d7c232e01e9faa6f`. |
| Duplicação | Duas sessões distintas para os dois pedidos. A tabela de recibos conservou uma entrada por evento reenviado. A integração existente de propostas confirmou ainda uma única concessão de créditos. |

O typecheck e o build Render passaram. Também passaram 59 testes unitários, 300 regressões, 29 testes de webhook, 11 verificações de integração com Supabase local e oito verificações de navegador. O workflow [Enterprise commercial safe checks](../.github/workflows/enterprise-commercial-safe-checks.yml) usa a mesma suíte de navegador e recolhe as duas capturas sintéticas no artefacto `ldr-commerce-browser-evidence`.

## Correções verificadas

- O checkout de eBook usa a mesma chave de tentativa e o mesmo pedido durante um retry. O Stripe recebe uma chave estável de idempotência. A sessão fica associada ao pedido pendente antes do redirecionamento.
- A proposta executada com o sandbox local volta para o endereço local, com as mesmas verificações de Stripe de teste e Supabase em loopback. O retorno habitual das propostas mantém a configuração anterior.
- O leitor consulta o direito de acesso ao reabrir ou focar a página, usa resposta privada sem cache HTTP e restringe a procura por e-mail ao cadastro legado ainda por vincular, com correspondência exata.

## Próximo ensaio e condições de publicação

A conta oferecida pela ligação Stripe só estava em `livemode=true`. A execução não enviou tráfego à API Stripe e não usou dados reais. Para validar o fornecedor, disponibilize ao ambiente isolado uma chave `sk_test_` e um segredo de webhook de teste por um canal de segredos. Repita no checkout hospedado os dois pagamentos com cartão de teste e o reembolso de eBook, receba os eventos de teste no endpoint local e compare os estados com os da tabela acima.

Antes de publicar, reveja os alertas de dependências já registados, valide as quatro edições comprimidas e resolva as duas edições cujo índice não coincide com o conteúdo armazenado. O merge e o deploy dependem de autorização explícita. [Validação anterior e inventário editorial](ldr-store-servicos-validacao-20261117.md)
