# Homepage empresarial + Stripe + Área Master — implementação segura

Estado: preparação técnica; não publicar sem aprovação.

## Objetivo
Vitrine de consultoria empresarial na homepage com seis serviços: estratégia, RH, tecnologia e IA, formação, mentoria e bem-estar. Preservar todas as rotas e produtos existentes.

## Fluxos obrigatórios
- Preço fixo: pedido pendente -> Stripe Checkout -> webhook validado -> pagamento confirmado -> agendamento quando aplicável -> Área Master.
- Orçamento variável: pedido gratuito -> Área Master -> proposta com preço aprovado -> Stripe Checkout -> confirmação por webhook -> agenda quando aplicável.
- Não cobrar antes de haver preço informado e aceite. Não forçar agendamento para serviços sem sessão.
- Idempotência por evento Stripe e pedido; tratamento de falha, expiração e reembolso.
- Área Master: cliente, origem, serviço, proposta, valor, moeda, estado Stripe, agenda, responsável e auditoria; permissões e RLS.

## Preservação
Não alterar assinaturas LDR ONE, preços atuais, Supabase, OAuth Google Calendar, Clínica Social, Academy, SEO, domínio ou configurações Render. Não executar cobranças reais em testes.

## Verificações
Inventariar rotas e CTAs; mapear produtos Stripe e webhook existentes; validar build, TypeScript, testes, checkout em modo teste, autenticação, RLS, agenda e regressões. Criar PR draft; sem merge nem deploy automático.

## Observação de auditoria inicial
Repositório tem workspace apps/painel-ldr e script build:painel. Busca encontrou CTA 'Solicitar orçamento' em apps/painel-ldr/src/routes/_clientarea.cliente.contratar.tsx, e catálogo com orçamento personalizado em apps/painel-ldr/src/routes/profissional-servicos.tsx. É necessário mapear todos os fluxos antes de implementar.
