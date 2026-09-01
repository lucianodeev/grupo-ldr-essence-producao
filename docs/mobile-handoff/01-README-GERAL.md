# Entrega Técnica — App LDR Android e iOS

Referência: branch `main` do repositório `lucianodeev/grupo-ldr-essence-producao`.

Objetivo: permitir que um programador desenvolva apps Android e iOS conectados ao ecossistema LDR existente, sem reconstruir regras de negócio já implementadas.

## Base atual

- Painel principal: `apps/painel-ldr`
- Site público: `apps/luciano-empreendedor`
- Painel: TanStack Start + React + TypeScript + Vite
- Backend/dados: Supabase
- Pagamentos: Stripe
- Hospedagem principal do painel: Vercel
- Site público legado/estático: Netlify

## Princípio de arquitetura

O app deve consumir o backend existente. Não duplicar regras críticas de assinatura, pagamento, autorização, agenda, catálogo, marketplace ou permissões dentro do app.

Fluxo recomendado:

`Android/iOS -> API/backend LDR -> Supabase/Stripe/serviços externos`

## Recomendação mobile

Preferência: React Native + Expo, por proximidade com React/TypeScript e maior possibilidade de compartilhar tipos, validações e conhecimento do código atual.

## Segurança

Nunca colocar no app ou neste pacote: Stripe Secret Key, Supabase Service Role, webhook secrets, tokens privados, credenciais Google ou senhas. Segredos devem ficar apenas no backend/ambiente seguro.
