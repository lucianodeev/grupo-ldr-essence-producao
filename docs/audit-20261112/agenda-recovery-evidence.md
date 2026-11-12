# Agenda LDR — evidências de recuperação e bloqueio
Atualização: 12/11/2026. Horas dos logs abaixo em UTC; Bruxelas = UTC+1.

## Resultado atual
**Trabalho não concluído. Produção permanece bloqueada.**
Projeto Supabase: `sfrcsrzuoqdscflfuwik`.
A última execução real restaurou o banco a partir do pacote decifrado. O inventário confirmou igualdade de todas as tabelas e sequências capturadas, mas encontrou duas diferenças de catálogo: uma constraint e uma política. Não há backup integral aprovado nem artefato de backup retido dessa execução.
A consulta posterior confirmou que `public.appointments` continua ausente: a migração da agenda não foi aplicada em produção.

## Evidência verificável
| Etapa | Resultado | Evidência |
|---|---|---|
| Proteções de acesso e custo | Verificação automática aprovada; ambiente protegido e execução manual em main; orçamento adicional permanece zero | [Execução real 28](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43301049525) |
| Testes de segurança e recuperação sintética | 23 testes de segurança e restauração sintética com dados pg_net, sequência, constraint e política passaram | [Execução 27](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43300698154) |
| Esquema real em ambiente isolado | Aprovado | Log 20:34:17 UTC, execução 28 |
| Exportação do banco e papéis sem senhas | Aprovada | Log 20:36:21 UTC, execução 28 |
| Cifra/decifra do pacote | Hashes dos arquivos coincidiram | Log 20:37:03 UTC, execução 28 |
| Restauração real | Completada em contentor sem rede nem portas publicadas | Log 20:37:06 UTC, execução 28 |
| Comparação final | Tabelas e sequências coincidiram; catálogo divergiu em uma constraint e uma política | Log 20:37:08 UTC, execução 28 |
| Retenção do backup | Não ocorreu; upload foi corretamente ignorado após a falha; API de artefatos retornou lista vazia | Execução 28 |
| Migração de produção | Não aplicada | Consulta Supabase posterior: `agenda_migration_absent=true` |
| Render | Os commits das ferramentas foram ignorados por `[skip render]`; não foi solicitada ativação da agenda | Evento `commit_ignored` para commit `40081229f9927bd68431c2cd1b64ce517b9ac1bd` em 20:42:41 UTC |
| Próximo diagnóstico | Preparação e verificação do ambiente passaram; etapa real aguarda revisão e não começou | [Execução 30](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43303103987) |

### Trecho saneado da última execução real
```text
2026-11-12T20:34:17Z PASS isolated schema restore preflight; full recovery still required
2026-11-12T20:34:17Z PASS read-only snapshot opened
2026-11-12T20:36:21Z PASS database and password-free roles exported
2026-11-12T20:37:03Z PASS encrypted payload decrypted with matching hashes
2026-11-12T20:37:06Z PASS restore completed in a network-isolated container
2026-11-12T20:37:08Z DIAGNOSTIC inventory_diff: catalog only; constraint missing 1/added 1; policy missing 1/added 1
2026-11-12T20:37:08Z BLOCKED restored_data_schema_rls_acl_or_sequence_mismatch
```

## Correções efetivamente integradas
- [PR 283](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/283): verificação prévia do esquema e categorias de erro sem dados privados.
- [PR 284](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/284): bibliotecas das extensões e agendamentos desativados no contentor isolado.
- [PR 285](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/285): inventário em lotes e diagnóstico público limitado a contagens.
- [PR 286](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/286): cópia CSV complementar das duas tabelas pg_net, recuperação de sequências e regras a partir do manifesto decifrado, normalização da ordem do conjunto de papéis das políticas e uma consulta por lote.
- [PR 287](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/287): diagnóstico exclusivamente cifrado das diferenças de catálogo. Teste de cifra/decifra e rejeição de adulteração passou juntamente com a preparação completa.

O pg_net tinha 100 respostas em `net._http_response` e nenhuma tabela de configuração de extensão para incluir esses dados no pg_dump normal. A cópia complementar resolveu a divergência dos dados. O estado das sequências também passou a coincidir. A comparação de constraints e políticas continua obrigatória: nenhuma diferença foi ignorada para declarar sucesso.

## Verificações de segurança e limites
- Nenhum valor de senha, chave de API ou token foi incluído neste relatório, nos PRs ou nos logs públicos.
- Todas as leituras remotas do processo de backup usam modo somente leitura e TLS verify-full com a CA oficial fixada.
- Nenhuma linha da origem foi apagada ou alterada pelas ferramentas de recuperação.
- Não foram contratados planos, branches pagos, projetos pagos ou adicionais IPv4.
- RLS das tabelas `session_credits`, `ldr_calendar_oauth_nonces` e `ldr_calendar_oauth_secrets` foi confirmado ativo; anon/authenticated não têm SELECT nessas tabelas.
- Há um token Calendar cifrado e zero registros em `vault.secrets`. Recuperar a linha cifrada não comprova que a chave externa da aplicação está recuperável.
- Foram inventariadas 22 Edge Functions. Uma função examinada depende de `RESEND_API_KEY`; o valor não foi consultado nem publicado.
- Os 35 testes Calendar/OAuth com transporte simulado passaram anteriormente nesta sessão. Não substituem testes reais de Google Calendar.
- Testes completos de pagamentos/créditos sobre o clone recuperado, restauração num serviço Storage isolado, configurações/segredos externos e operações reais Google Calendar ainda não foram concluídos.

## Bloqueio de infraestrutura
O ambiente de execução e o navegador de trabalho ficaram indisponíveis durante a retomada do diagnóstico. A ferramenta de execução confirmou: “No usable execution environment is available”. O GitHub continua acessível pelo conector; a revisão do ambiente protegido não está disponível por ele.
A execução 30 aguarda revisão; o job com credenciais ainda não começou. Antes de prosseguir, restabelecer o ambiente de trabalho e confirmar a disponibilidade da chave privada temporária do diagnóstico. Se ela não estiver disponível, gerar outro par e substituir a chave pública antes de executar o diagnóstico. Não aprovar uma execução cujo diagnóstico não possa ser lido.
A chave privada do diagnóstico nunca foi enviada ao GitHub. O conteúdo diagnóstico será publicado apenas cifrado, com retenção de um dia, e o bloqueio de produção continuará ativo em caso de diferença.

## Próximos critérios obrigatórios
1. Recuperar o ambiente e resolver as duas diferenças de catálogo sem enfraquecer a comparação.
2. Obter e preservar uma cópia cifrada cuja restauração e comparação integral passem.
3. Comprovar a recuperação dos demais componentes, configurações e chaves externas necessários.
4. Validar a migração e os testes funcionais completos no clone, incluindo RLS, permissões, pagamentos, créditos e concorrência.
5. Testar Google Calendar real no calendário de teste: criação, alteração, cancelamento e idempotência.
6. Só então considerar a migração em produção e a ativação no Render.

Referências oficiais:
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore
- https://www.postgresql.org/docs/17/app-pgdump.html
