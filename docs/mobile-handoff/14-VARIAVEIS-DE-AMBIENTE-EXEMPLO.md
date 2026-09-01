# Variáveis de ambiente — exemplo seguro

Este arquivo documenta nomes esperados. Não colocar valores reais neste documento.

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_WEB_APP_URL=
EXPO_PUBLIC_WHATSAPP_NUMBER=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Somente backend/servidor

As seguintes variáveis nunca devem ser incluídas no app mobile nem em repositório público:

```env
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_SECRET=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

Fornecer segredos ao programador somente quando necessário e por canal seguro/gestor de secrets. Em produção, manter segredos no ambiente do backend/Vercel/Supabase, não no bundle mobile.
