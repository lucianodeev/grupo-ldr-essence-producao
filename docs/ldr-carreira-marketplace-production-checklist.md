# LDR Carreira Marketplace — checklist de produção

Este pacote prepara as partes finais do marketplace de carreira sem publicar automaticamente em produção.

## Escopo entregue na branch

- Candidatura pelo perfil em `/carreira/vagas/$jobId/candidatura`.
- Listagem de vagas com filtros inclusivos.
- Página de detalhe da vaga com CTA de candidatura.
- Área da empresa em `/carreira/empresa`.
- Triagem de candidaturas reais em `/carreira/empresa/candidaturas`.
- Guia de triagem responsável em `/carreira/empresa/guia-triagem-responsavel`.
- Migration preparada para `career_applications`, ainda não aplicada no Supabase produção.

## Segurança antes de publicar

- Confirmar Vercel preview verde nos projetos vinculados.
- Testar login de empresa com usuário autorizado.
- Criar empresa e vaga em modo rascunho.
- Enviar candidatura de teste por uma vaga publicada.
- Confirmar que a empresa vê apenas candidaturas das próprias vagas.
- Confirmar que dados de acessibilidade aparecem somente quando o candidato autorizou compartilhamento.
- Testar alteração de status: recebida, em análise, entrevista, finalista, recusada, contratada e arquivada.
- Confirmar que recusa exige justificativa objetiva na interface.

## Supabase

Arquivo preparado:

`supabase/migrations/20260918005000_create_career_applications.sql`

Não aplicar diretamente em produção antes de revisar:

- tipo de `career_jobs.id`;
- relacionamento `career_jobs.company_id -> career_companies.id`;
- RLS com `career_companies.owner_user_id = auth.uid()`;
- grants para `anon` e `authenticated`;
- políticas de update para evitar edição indevida por empresa não proprietária.

## Publicação segura

1. Validar preview.
2. Revisar migration.
3. Aplicar migration no ambiente correto.
4. Testar fluxo completo.
5. Fazer merge da branch para `main` somente com autorização final.

## Rollback

- Reverter o merge da branch no GitHub se a publicação gerar regressão.
- Não aplicar migration em produção até os testes do preview estarem concluídos.
- Caso a migration seja aplicada e precise ser revertida, criar migration específica de rollback; não apagar tabela manualmente sem backup.
