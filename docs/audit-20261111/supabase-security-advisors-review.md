# Auditoria Supabase — avisos de segurança (somente leitura)

Data: 2026-11-11. Projeto: `sfrcsrzuoqdscflfuwik`.
Fonte: Supabase security advisors. Nenhuma alteração aplicada.

## WARN: funções SECURITY DEFINER expostas
- `public.submit_ecosystem_contact(...)`: executável por `anon` e `authenticated`. Pode ser intencional para formulário público; revisar validação de entrada, rate limiting, permissões e dependências antes de revogar. https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- `public.is_superadmin(_user_id uuid)`: executável por `authenticated`. Verificar se permite consultar privilégios de terceiros e se o acesso é realmente necessário. https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## INFO: RLS sem políticas
- `public.academic_job_feed_links`
- `public.ldr_one_seat_assignments`
- `public.ldr_pass_subscriptions`
RLS sem políticas normalmente bloqueia acesso de papéis não privilegiados; não abrir políticas amplas sem validar fluxo de negócio. https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## WARN: autenticação
- Proteção contra palavras-passe comprometidas desativada. Avaliar ativação na configuração Auth. https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Relação com a agenda
- Estes avisos são preexistentes e não comprovam falha nas quatro novas RPCs da agenda.
- Antes de publicar: confirmar permissões do backend, RLS nas novas tabelas, workflow de testes negativos e backup/restauração.
- **Não executar correções de permissões em produção sem análise de impacto e aprovação específica.**
