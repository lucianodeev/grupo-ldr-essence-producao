# Arquitetura recomendada

## Web atual

O núcleo operacional está em `apps/painel-ldr`, aplicação full-stack TanStack Start. O site `apps/luciano-empreendedor` funciona como camada pública/marketing e direciona fluxos de compra e biblioteca para o painel.

## Mobile

Arquitetura recomendada:

1. App React Native + Expo.
2. Supabase Auth para sessão do usuário.
3. Chamadas autenticadas a endpoints/API do backend LDR.
4. Stripe Checkout/PaymentSheet/Customer Portal conforme fluxo aprovado, sem armazenar cartão no app.
5. Push notifications com Expo Notifications, FCM e APNs.
6. Deep links/universal links para retorno de pagamento, redefinição de senha e navegação.

## Regra central

O app não deve acessar tabelas sensíveis usando Service Role. Operações privilegiadas continuam server-side. RLS deve permanecer ativa no Supabase.

## Camadas sugeridas

- `mobile/app`: navegação/telas.
- `mobile/src/api`: cliente HTTP para backend.
- `mobile/src/auth`: sessão Supabase.
- `mobile/src/features`: cliente, empresa, funcionário e profissional.
- `mobile/src/i18n`: PT/EN/FR/ES.
- `mobile/src/design-system`: tokens e componentes.
- `mobile/src/notifications`: push/deep links.

## Admin

Não portar o Painel Master integralmente para a primeira versão mobile. Manter administração crítica na web e levar ao app apenas funções administrativas realmente justificadas após revisão de segurança.
