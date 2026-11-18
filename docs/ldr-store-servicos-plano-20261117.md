# LDR Store + Serviços — plano de implementação isolada (17/11/2026)

## Objetivo
Criar duas vitrines comerciais no domínio existente, preservando todas as rotas e fluxos em produção. Esta etapa é somente preparação, sem deploy.

## Evidências reutilizadas
- `docs/academy-unified-catalog-20261117.md`: catálogo Academy de 91 entradas pagas únicas, acesso e assinatura unificados; **não** comprova revisão pedagógica integral nem validação de cargas horárias.
- `docs/audit-20261115/biblioteca-inventario-inicial.md`: auditoria estática, riscos de conteúdos Supabase e links; não comprova disponibilidade de todos os capítulos.
- `docs/central-empresas-preservacao-e-expansao.md`: expansão aditiva, rotas empresariais existentes, preservação de DNS e produção.
- `docs/academy-b2b-final-readiness-audit.md`: MVP institucional demonstrável, ainda com verificações de dados/segurança pendentes.

## Vitrines propostas
1. `/loja`: categorias, pesquisa, cartões com descrição/preço/idioma/entrega, página de detalhe e acesso pós-compra à Biblioteca.
2. `/servicos-profissionais`: serviços com escopo, entregáveis, prazo e preço ou orçamento, formulário de briefing e acompanhamento na Área Master.

## Política de catálogo
- Fonte única para IDs, títulos, preços e direitos de acesso; não duplicar registros da Academy.
- Não anunciar como vendável nenhum conteúdo sem arquivo/capítulos completos, direito de acesso verificado e checkout testado.
- Não inventar certificação, carga horária, promessa de resultado ou conteúdo.
- Kits novos (currículo, RH, gestão) ficam como **propostas** até terem ficheiros originais, revisão e validação.

## Fluxos comerciais
Produto digital: vitrine → detalhe → checkout Stripe existente validado em sandbox → webhook idempotente → compra registrada → acesso ao conteúdo → comprovativo e suporte.
Serviço: vitrine → escopo/briefing → preço fixo ou orçamento → pagamento conforme contrato → pedido na Área Master → execução/entrega. Não exigir pagamento antecipado de orçamento ainda não aprovado.

## Gates antes de qualquer deploy
1. Confirmar conflitos de rota e mapa de componentes.
2. Inventariar produtos reais no Supabase em modo leitura; checar duplicados e integridade.
3. Conferir Stripe: price IDs, webhooks, idempotência, reembolsos e direitos de acesso em sandbox, sem cobrança real.
4. Conferir autenticação, autorização, RLS e separação entre clientes/empresas.
5. Validar testes unitários, regressão, build e navegação móvel.
6. Revisão de privacidade, termos comerciais, impostos e faturação aplicáveis.
7. Obter autorização explícita para merge e deploy.

## Sequência de implementação
A. Reutilizar componentes da vitrine Academy e da Central Empresas; definir contratos de dados e navegação.
B. Implementar páginas aditivas na branch isolada, sem alterar preços nem catálogos de produção.
C. Integrar com serviços existentes somente após validação de contratos.
D. Testar preview com dados sintéticos e preparar rollback.
E. Solicitar aprovação para publicação.

## Restrições
Sem merge na main, sem Render deploy, sem alterações em Supabase produção, sem cobranças, sem novos serviços pagos e sem envio de e-mails.
