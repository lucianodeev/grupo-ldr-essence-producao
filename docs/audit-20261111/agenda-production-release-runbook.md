# Agenda LDR — plano de publicação controlada (NÃO EXECUTAR)

Estado: preparação técnica na branch `feat/central-empresas-ldr`. PR #273 em draft.
Nenhuma operação deste documento autoriza alterações à produção.

## Pré-condições obrigatórias
1. Confirmar no GitHub Actions sucesso de `agenda-postgres-full-sql.yml` e `agenda-sql-permissions.yml` no commit mais recente. Consultar os logs de cada etapa; a presença de um check verde não substitui testes de negócio.
2. Revisar os cinco drafts SQL e o hardening, converter os arquivos de ROLLBACK em uma migração transacional única, versionada e revisada. Não remover ROLLBACK nos arquivos de design originais.
3. Validar schema real de orders, session_credits e mentorship_sessions; verificar defaults, constraints, enums, dependências, grants e RLS. A simulação do workflow usa tabelas simplificadas.
4. Executar cenários negativos em PostgreSQL isolado: pagamento pendente/reembolsado; titular e catálogo divergentes; créditos esgotados; idempotência; cancelamento e remarcação; corrida de confirmação; lease expirado/token inválido; falha da API Google; falha após criação do evento.
5. Confirmar que o backend usa service_role apenas no servidor, sem expor chave ao cliente; validar autenticação e autorização de operador antes das RPCs.
6. Confirmar comportamento real do Google Calendar em ambiente de teste, com credenciais e calendário de teste, sem compromissos de clientes.
7. Preparar backup verificável e testar restauração em ambiente separado. Documentar duração, responsáveis e janela de manutenção.
8. Obter aprovação explícita do proprietário antes de qualquer migração no Supabase principal, merge ou deploy Render.

## Estratégia de implantação
- Fase A: aplicar migração revisada primeiro num projeto Supabase de teste (ou PostgreSQL equivalente com roles/RLS compatíveis), executar smoke tests e comparar schema.
- Fase B: só com autorização, criar backup, registrar revisão Git e aplicar migração aditiva à produção. Verificar novas tabelas, políticas, RPCs, grants, integridade e métricas.
- Fase C: ativar backend atrás de feature flag; testar criação, confirmação, créditos e sincronização com dados controlados. Monitorar falhas e duplicações antes de liberar usuários.

## Reversão
- **Antes da ativação**: desabilitar a feature flag e restaurar a versão anterior do backend. Não executar DROP TABLE automático: tabelas novas podem conter dados após uso.
- **Depois da ativação**: parar novas confirmações/sincronizações, guardar logs e eventos Google; identificar registros criados e operações em voo; avaliar migração compensatória revisada ou restauração do backup em janela aprovada.
- Restauração completa pode eliminar alterações de outros módulos entre backup e incidente: requer avaliação de impacto e aprovação específica.
- Não apagar eventos Google automaticamente sem verificar IDs e propriedade dos eventos.

## Critério de conclusão
- Testes de integração reais e negativos aprovados; privilégios e RLS confirmados; teste Google Calendar concluído; backup/restauração verificados; autorização de produção registrada; monitoramento pós-publicação sem erros críticos.

**Pendente**: executar e inspecionar workflow de permissões; testes negativos; compatibilidade com schema real; plano de backup/restauração; aprovação explícita.
