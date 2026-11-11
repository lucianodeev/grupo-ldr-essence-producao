# Central Empresas LDR — preservação e expansão segura

## Regras obrigatórias

- Expansão **aditiva**: não remover, renomear ou substituir rotas, páginas, serviços ou funcionalidades já validados.
- Preservar o domínio principal `ldrecossistema.online`, os registos DNS/MX, dados, autenticação, integrações e configurações existentes.
- Não efetuar merge na `main`, deploy de produção, migrações de dados ou compras sem autorização explícita.
- Criar páginas filhas na mesma aplicação e verificar conflitos com rotas existentes antes de adicionar novas.
- Alterações pequenas, reversíveis e testadas. Se uma correção afetar módulos existentes, suspender e pedir revisão.
- Não mascarar erros TypeScript nem desativar verificações obrigatórias para forçar CI verde.

## Estado técnico conhecido (11-11-2026)

- Branch: `feat/central-empresas-ldr`; PR #273 (draft).
- Rotas implementadas: `/empresas`, `/empresas/servicos`, `/empresas/proposta`, `/empresas/ldr-one`, `/empresas/academy`.
- Build Render e testes unitários passaram na execução 43016167597.
- Typecheck global continua reprovado: 2.093 mensagens de erro TypeScript no log dessa execução, sem erros nas cinco rotas novas.
- A validação `Validate AI READY MVP branch` passou nessa execução.
- Último commit da auditoria de rotas: `5061d6861f1bacab09d2ac49f4ff6cd086f8f9ca`.
- Produção não foi alterada por este trabalho.

## Próximas etapas seguras

1. Comparar branch e `main` e inventariar rotas, componentes e serviços existentes.
2. Validar automaticamente a presença das cinco páginas e os links internos.
3. Separar erros TypeScript preexistentes de regressões da branch, sem alterar módulos não relacionados.
4. Testar a navegação em pré-produção com evidência real; não assumir que links de preview estão acessíveis.
5. Corrigir apenas problemas identificados, com commits pequenos e testes direcionados.
6. Preparar plano de rollback e pedir aprovação explícita antes de publicar.

## Continuidade

Quando a execução for interrompida, atualizar este ficheiro com o commit atual, o estado dos testes, os bloqueios e o próximo passo verificável. Não declarar concluída uma validação ainda pendente.
