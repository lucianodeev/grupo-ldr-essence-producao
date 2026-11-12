# Central Empresas LDR — Plano de implementação isolada

Estado: preparação técnica. Branch: `feat/central-empresas-ldr`.
Produção: não alterar `main`, DNS, Render, pagamentos ou dados reais.

## Objetivo
Criar uma entrada comercial B2B integrada ao painel existente, reutilizando RH & Estratégia, LDR ONE, Academy e as rotas empresariais atuais.

## Rotas propostas (não implementadas)
- `/empresas`: página institucional e propostas de valor.
- `/empresas/servicos`: serviços de RH e consultoria.
- `/empresas/talent`: apresentação do recrutamento, sem alegar funcionalidade ainda não validada.
- `/empresas/ldr-one`: benefícios e disponibilidade real do LDR ONE Business.
- `/empresas/formacao`: catálogo de formação corporativa.
- `/empresas/proposta`: pedido de proposta, inicialmente sem guardar dados pessoais em sistema não validado.

## Preservar
- `/ldr-rh-estrategia`, `/empresa/login`, `/ecossistema` e rotas da Academy.
- Direitos de acesso existentes, compras independentes e conteúdo gratuito.
- Chaves, webhooks, tabelas e políticas de segurança atuais.
- Serviço Render Free; não criar serviços adicionais.

## Componentes observados
- `apps/painel-ldr/src/routes/ldr-rh-estrategia.tsx`: apresentação institucional, idiomas e links.
- `apps/painel-ldr/src/lib/ldr-one-capabilities.ts`: capacidades definidas, não prova de implementação funcional.
- `docs/ldr-pass/LDR_ONE_SANDBOX_COMPATIBILITY_20260927.md`: contratação ONE ainda sujeita a gates.
- `docs/academy-b2b-final-readiness-audit.md`: MVP institucional com migração e testes pendentes.

## Gates antes de implementação/publicação
1. Inspecionar layout, roteador e dependências; identificar rotas conflitantes.
2. Confirmar disponibilidade real de formulários, autenticação e armazenamento.
3. Implementar apenas páginas comerciais e navegação na branch isolada.
4. Executar build, testes de rotas e verificação mobile/acessibilidade.
5. Para dados reais, validar isolamento multiempresa, RLS, retenção e RGPD.
6. Abrir PR para revisão. Não fazer merge sem aprovação explícita.

## Critérios de aceite
- Links existentes funcionam sem regressões.
- Conteúdo não promete funcionalidades ainda indisponíveis.
- Nenhum checkout novo, migração, segredo ou cobrança.
- Nenhum deploy de produção automático disparado.
