# FEIRA 360 — pedidos gerais e divulgação

A homepage liga diretamente ao pedido geral, à LDR Academy e ao cadastro de parceiros. O formulário geral exige sessão com e-mail confirmado, consentimento, categoria, descrição e prazo. O orçamento em euros é opcional. A Minha Área acompanha os pedidos gerais e os orçamentos individuais.

O Master seleciona um parceiro aprovado e encaminha a descrição, o prazo e o orçamento. A referência de divulgação é um indicador comercial e não altera o encaminhamento. O parceiro vê apenas pedidos gerais encaminhados a si e indicadores agregados dos pedidos e das contratações atribuídos ao seu link.

Para criar uma proposta, o Master prepara o contacto a partir do pedido, abre o editor empresarial existente, cria e aprova uma proposta em EUR e volta à Feira para a vincular. O cliente pode consultar a proposta e seguir o checkout existente. O pedido pode ser cancelado diretamente pela Minha Área até à preparação da proposta. A partir daí, o cancelamento usa o atendimento, evitando cancelar um pedido enquanto uma proposta pode estar a ser paga.

O pedido conserva a taxa em pontos-base da data de envio. O pagamento confirmado do pedido existente gera uma linha de comissão por pedido e por ordem. O registo é histórico. Em caso de reembolso, consultar o estado do pagamento antes de qualquer conciliação ou repasse. Esta entrega não liquida comissões.

## Publicação

1. Aprovar o PR e verificar a compatibilidade da migração em Supabase isolado com Auth e Data API. Verificar o índice parcial de propostas nos dados do ambiente de destino antes da migração.
2. Aplicar a migração `20261119160000_feira360_journeys.sql` antes de publicar o frontend.
3. Publicar o frontend e confirmar os três caminhos da homepage, uma sessão Google de teste e o percurso com métodos Stripe de teste num ambiente isolado.
4. Confirmar catálogo, formulários e status no domínio oficial após autorização de publicação. O checkout continua dependente dos controles e configuração do fluxo empresarial existente.

## Reversão

Reverter o frontend primeiro. A migração é aditiva. Para desativar a funcionalidade preservando histórico, revogar execução de `public.feira360_journeys(text,jsonb)` de `authenticated`. Enquanto houver propostas vinculadas em andamento, manter o gatilho de pagamento para preservar a contabilização. Se for necessário desativá-lo, desativar apenas o gatilho `feira360_capture_paid_brief` e reconciliar os pedidos pagos durante a suspensão antes de o reativar. Preservar tabelas, índice de unicidade e dados do fluxo de propostas.
