# Google Calendar OAuth direto — preparação segura (PR #273)

## Estado
O cliente servidor em `apps/painel-ldr/src/lib/google-calendar.server.ts` utiliza a Google Calendar API diretamente, com refresh token OAuth 2.0. O workflow `Calendar OAuth direct validation` validou os testes simulados. **Isto não autoriza eventos reais nem libera produção.**

## Configuração na Google Cloud (conta autorizada)
1. Escolher/criar projeto Google Cloud de testes, ativar **Google Calendar API** e configurar o ecrã de consentimento OAuth. Se a aplicação estiver em modo Testing, incluir a conta de testes entre os utilizadores de teste; verificar as limitações de expiração de refresh tokens em modo Testing.
2. Criar credenciais OAuth 2.0 adequadas ao fluxo de autorização utilizado. Pedir apenas o âmbito necessário para editar eventos e consultar disponibilidade (`https://www.googleapis.com/auth/calendar.events` e, quando necessário, `https://www.googleapis.com/auth/calendar.freebusy`). Confirmar os âmbitos efetivos antes de consentir.
3. Obter o refresh token mediante autorização explícita do proprietário da conta Google, com acesso offline, utilizando redirecionamento HTTPS autorizado. Nunca guardar códigos, access tokens, refresh tokens ou client secrets em Git, issues, logs ou chat.
4. Criar um calendário **separado para testes**, dar acesso de edição à identidade Google autorizada e verificar se a conta pode gerar links Google Meet.

## Variáveis exclusivamente no cofre do ambiente de testes
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (ID do calendário de testes, obrigatório)

Não configurar variáveis com prefixo `VITE_`. Não substituir as variáveis de produção enquanto o PR não estiver validado. O serviço Render atual segue `main` e tem auto-deploy; **não fazer merge nem alterar a branch do serviço**.

## Teste real autorizado (apenas dados sintéticos)
1. Confirmar `AGENDA_INTEGRATION_ENABLED=false` até completar a validação.
2. Consultar freeBusy de uma janela futura no calendário de testes.
3. Criar evento privado com convidado de testes autorizado e Google Meet; verificar ID, horário, link e um único evento.
4. Repetir a criação com o mesmo ID (sem duplicação); reagendar e verificar o mesmo ID; cancelar duas vezes.
5. Simular revogação/permissão negada, verificar falha segura, restaurar autorização e repetir. Testar conflito de horários.
6. Remover eventos sintéticos residuais e guardar apenas resultados redigidos sem segredos.

## Critérios de aprovação
- Workflow OAuth simulado verde no PR #273;
- Credenciais autorizadas e configuradas num ambiente isolado;
- Testes reais acima concluídos com sucesso;
- Backup/restauração integral e drift de schema verificados antes de qualquer migração em produção;
- Aprovação específica antes de merge, deploy ou ativação da flag.
