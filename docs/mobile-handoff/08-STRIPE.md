# Stripe

O ecossistema possui compras avulsas e assinaturas recorrentes.

## Compras avulsas
Usadas para serviços, produtos, pedidos e benefícios específicos. O backend cria/associa o pedido e o webhook confirma o resultado.

## Assinatura profissional
Gerenciada pelo backend e tabela/serviços de assinatura profissional.

## Assinatura empresarial
Gerenciada por `company-subscription.functions.ts` e `company-subscription.server.ts`, com plano, status, período atual, renovação e cancelamento ao fim do período.

## Webhook
A rota `/api/stripe/webhook` é a fonte de verdade para eventos Stripe. O app não deve marcar um pagamento como concluído apenas porque voltou do checkout.

## Mobile
- Nunca armazenar cartão.
- Nunca incluir Stripe Secret Key no app.
- Preferir Stripe PaymentSheet/Checkout/Customer Portal com sessão criada no backend.
- Após retorno, atualizar o estado consultando o backend.
- Suportar deep links para sucesso/cancelamento.

## Estados que o app deve tratar
- pending/incomplete
- active/paid
- past_due/unpaid
- canceled
- cancel_at_period_end

Renovação e cancelamento devem seguir as mesmas regras da web.
