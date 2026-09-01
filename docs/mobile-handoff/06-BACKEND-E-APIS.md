# Backend e APIs para o app

O painel usa `createServerFn` do TanStack Start com autenticação Supabase. Para mobile, o ideal é expor uma camada HTTP estável reutilizando as mesmas regras server-side, em vez de o app tentar reproduzir RPCs internos da web.

## Módulos já existentes que devem ser reaproveitados

- `access.functions.ts`: contexto/permissões.
- `catalog.functions.ts`: catálogo.
- `client-portal.functions.ts`: área do cliente.
- `organization-portal.functions.ts`: área da empresa.
- `company-subscription.functions.ts`: assinatura empresarial.
- `notification-center.functions.ts`: notificações.
- `professional-network.functions.ts`: rede profissional/marketplace.
- `professional-services.functions.ts`: serviços profissionais.
- `professional-social.functions.ts`: mensagens/perfil social.
- `learning.functions.ts`: conteúdos/aprendizado.
- `clinical.functions.ts`: funções clínicas protegidas.

## Endpoints já existentes

- `/api/stripe/webhook`: processamento Stripe.
- `/api/integrations/site-orders`: integração de pedidos externos/site.

## Endpoints mobile recomendados

Criar, reaproveitando serviços internos:
- `GET /api/mobile/me`
- `GET /api/mobile/catalog`
- `GET /api/mobile/client/dashboard`
- `GET /api/mobile/company/dashboard`
- `GET /api/mobile/company/subscription`
- `POST /api/mobile/company/subscription/checkout`
- `POST /api/mobile/company/subscription/cancel`
- `POST /api/mobile/company/subscription/resume`
- `GET /api/mobile/employee/dashboard`
- `GET /api/mobile/professional/dashboard`
- `GET /api/mobile/notifications`
- `POST /api/mobile/push-token`

Todos devem validar Bearer token Supabase no servidor e aplicar a mesma autorização da web.
