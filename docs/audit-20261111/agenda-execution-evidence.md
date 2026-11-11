# Execução técnica — 11/11/2026

Branch `feat/central-empresas-ldr`, PR #273. Produção não alterada.

## Execuções locais efetivas

| Verificação | Resultado | Evidência |
|---|---|---|
| Schema relevante real + migração definitiva no PostgreSQL 17.6 | Aprovado | [31 controlos](agenda-evidence/postgres-17.6.txt) |
| Concorrência das funções definitivas | Aprovado | 20 confirmações / 20 solicitações / 20 claims; uma operação vencedora por recurso |
| Permissões e RLS | Aprovado | Seis RPCs só para service_role; acesso público recusado; RLS com SELECT concedido no banco de teste não retorna créditos |
| Confirmação paga, idempotência, esgotamento, titular e catálogo | Aprovado | PostgreSQL real, dados sintéticos |
| Reagendamento, cancelamento, conclusão e mentoria gratuita | Aprovado | Reserva e espelho transacionais; vínculo explícito indevido rejeitado |
| Reversão pré-ativação e reaplicação | Aprovado | Recusa se houver dados; preserva pedidos na reversão vazia |
| Transporte Calendar e recuperação da saga | Aprovado com respostas simuladas | [17 testes executados](agenda-evidence/calendar-mocked.txt), incluindo falha depois da criação remota e recuperação sem duplicar |
| Typecheck | Aprovado | tsc --noEmit, sem erros |
| Unitários existentes | 59 aprovados | npm run test |
| Regressões existentes | 139 aprovadas | npm run test:regressions |
| Build Render local | Aprovado | npm run build:render; sem publicação |
| Smoke HTTP local | Aprovado | Cinco rotas empresariais, 16 assets, 30 destinos; sem credenciais e sem submissões reais |
| Bundle público | Aprovado | Sem nomes das variáveis de segredo Calendar/service_role nos JavaScripts públicos |

O smoke sem credenciais não comprova login de uma conta real nem operações do frontend contra o PostgREST. As regras de escrita foram exercitadas nas RPCs PostgreSQL e a autenticação/autorização das server functions foi inspecionada no código.

## GitHub Actions

As execuções anteriores foram consultadas com os logs completos de cada job:

- [Permissões anterior — sucesso](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43091517957), job 130769497140.
- [SQL completo anterior — sucesso](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43069583039), job 130693706971.
- [Concorrência anterior — sucesso](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43066748436), job 130683627874. Esse workflow usava funções simplificadas e foi corrigido para executar o SQL definitivo.

No commit `36645924446dbc2262d800909cf6d3b7e71c4fa4`, foram acionados pelo push:

- [Permissões](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43095187997).
- [SQL completo](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43095188278).
- [Concorrência](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43095188418).

A API retornou `queued`, sem jobs, em consultas sucessivas. Não existem logs novos para inspecionar nesse estado e essas execuções NÃO estão aprovadas. Os links do commit final e seu estado devem ser conferidos na conversa da PR. Os scripts executados localmente são os mesmos usados pelos workflows.

## Correções realizadas

- Confirmação manual podia inserir status confirmado sem passar pela validação financeira: criação agora fica pendente e confirma por RPC; trigger também protege escritas diretas.
- Reagendamento podia liberar saldo usado: reserva explícita permanece até cancelamento; conclusão mantém o consumo.
- Confirmação de mentoria não tinha caminho completo de validação e vinculação no formulário: vínculo explícito, titular e pagamento conferidos em transação; submissão usa backend autorizado.
- A interface lia diretamente tabelas com acesso público revogado: listagem e histórico agora usam funções de servidor autorizadas.
- RPCs de solicitação/reagendamento faltavam no pacote de migração: implementadas e exercitadas com concorrência.
- Tipos da base observada ocultavam as colunas da migração: acrescentada a forma prevista para sessões sem afirmar que já existe na produção.
- freeBusy podia interpretar erro como calendário livre e ocultar outro evento na mesma janela do próprio: falha fechada e comparação por ID.
- POST perdido podia criar duplicação: ID determinístico; 409 recupera e atualiza o mesmo evento. Remoção manual avança geração persistida.
- Cancelamento sem ID salvo podia ignorar evento órfão: recupera pelo marcador privado. Troca para link manual cancela o evento anterior antes de liberar o link.
- Lease expirado, token incorreto e mudança de horário em voo não podem publicar sincronização como concluída. Todas as chamadas Calendar têm timeout e erros sem corpo remoto/credenciais.

## Limites externos

Google Calendar real: `403 notACalendarUser` na leitura de calendários. Não houve evento nem convite real. Credenciais do gateway estão ausentes neste ambiente. São necessários conta Calendar ativa/conexão autorizada, calendário de teste separado e convidado de teste; detalhes em [plano de publicação](agenda-final-release.md).

Backup integral/restauração: plano preparado, sem extração de dados de clientes. Ensaio com dump integral permanece dependente de acesso seguro e ambiente autorizado. Reversão da migração foi executada somente no PostgreSQL descartável.

## Verificação de produção

SELECT final em transação READ ONLY: PostgreSQL 17.6; appointments/appointment_events/appointment_calendar_sync ausentes; zero colunas novas de sessão; zero RPCs novas. Render permanece no deploy `dep-dbq51bajnfac739rbl2g`, commit `da91c4fc8dd80a5c660bedd9d747caadaccdcf8b`. Nenhum merge, deploy, DDL/DML de produção, serviço pago ou alteração de DNS foi executado.
