# Supabase

O sistema usa Supabase para autenticação e dados.

## Mobile

Usar `@supabase/supabase-js` com URL pública e chave anon/public adequada ao app. Nunca embutir `service_role`.

## Sessão

Fluxo recomendado:
1. Login no app.
2. Supabase devolve sessão/access token.
3. App mantém sessão em armazenamento seguro.
4. Chamadas ao backend enviam `Authorization: Bearer <access_token>`.
5. Backend valida usuário e autorização antes de acessar dados.

## RLS

Manter Row Level Security habilitada. O app não deve depender apenas de filtros no frontend.

## Áreas de dados relevantes

O projeto possui estruturas relacionadas a organizações, membros, compras, benefícios, profissionais, assinaturas, marketplace, pagamentos, notificações, biblioteca e agenda.

## Recomendação

Antes da publicação mobile, executar auditoria das policies RLS específicas para cada tabela usada diretamente pelo app. Preferir operações críticas via backend quando envolver dinheiro, papéis administrativos, documentos, comissões ou dados sensíveis.
