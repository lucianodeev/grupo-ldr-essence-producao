# Backup cifrado e ensaio de recuperação — preparação para iPhone

Projeto exclusivo: `sfrcsrzuoqdscflfuwik`.

## Estado e limites

Este processo prepara e verifica a recuperação da base de dados PostgreSQL e dos bytes do Storage. **Não é ainda uma cópia integral validada de todos os serviços do projeto.** Configuração externa, chaves de criptografia (incluindo a chave que protege os tokens Calendar), segredos de aplicações, Edge Functions e restauração num serviço Storage isolado precisam de evidência separada. O resultado conserva `production_gate=false` e `project_backup_complete=false`, mesmo se o ensaio da base passar. Não ativa agenda, não escreve em produção, não aplica migrações remotas, não faz deploy Render e não autoriza mudanças no projeto principal.

## O que fica preparado

- Execução `preparation` sem credenciais: testes de segurança e dump/cifra/decifra/restauração com dados sintéticos.
- Execução `backup_restore` estritamente manual, pelo dono do repositório, a partir de `main`, com confirmação do identificador do projeto e aprovação de ambiente.
- `pg_dump` custom completo da base (sem filtros de tabelas), `pg_dumpall --roles-only --no-role-passwords`, transação exportada e consultas em modo somente leitura. Um erro ou uma tabela inacessível bloqueia o processo; nunca é ignorado para declarar sucesso.
- As tabelas temporárias da extensão `pg_net` não entram na exportação normal da extensão. Uma cópia CSV complementar, feita na mesma transação exportada, conserva as filas e respostas no pacote cifrado. No clone, o worker `pg_net` fica apontado para uma base inexistente, além do bloqueio de rede; os jobs cron continuam desativados.
- A recuperação usa o manifesto **decifrado** para repor sequências, constraints e políticas que a instalação das extensões recria com valores por omissão. Só executa essa reconstrução no contentor descartável `ldr-recovery-…`, na base `ldr_restore`. Nenhuma linha da origem é alterada ou apagada. O conjunto de papéis de uma política é ordenado para comparação; o conteúdo e os privilégios continuam comparados integralmente.
- O inventário agrupa 25 tabelas por consulta SQL, mantendo os mesmos bytes canónicos, contagens e SHA256. Marcadores incompletos, dados inesperados ou diferenças finais continuam a bloquear a execução.
- Cópia dos objetos `storage.objects` através da API oficial, com manifesto e SHA256. Os metadados são comparados novamente após os downloads; alterações durante a cópia bloqueiam. O Storage não oferece uma transação atômica partilhada com PostgreSQL; use uma janela sem alterações de ficheiros.
- GnuPG AES256: cifrar, decifrar a cópia cifrada e comparar cada ficheiro antes de restaurar.
- Restauração do arquivo **decifrado** num contentor descartável sem rede nem portas publicadas. Compara linhas, hashes, RLS, colunas, funções, gatilhos, enums, índices, políticas, proprietários, ACLs, privilégios por omissão e sequências. Apenas depois tenta a migração indicada nesse clone isolado e verifica permissões básicas.
- Só o `.gpg` e o resultado público saneado podem ser enviados como artefatos, e apenas após todos os passos terem sucesso. Nada de dumps SQL ou ficheiros em claro nos commits, logs, PRs ou artefatos.
- A imagem oficial Supabase PostgreSQL está fixada em `17.6.1.155`; as ações checkout e upload-artifact estão fixadas por SHA. A preparação confirma se a imagem consegue restaurar o exemplo; diferenças de extensões ou objetos geridos bloqueiam, sem enfraquecer a comparação.
- Os clientes PostgreSQL usam `verify-full` e o certificado público oficial Supabase Root 2021 CA, montado apenas para leitura. O SHA256 do ficheiro é fixado em `700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7`; alterações inesperadas bloqueiam antes da ligação. Fonte do certificado: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt . Referência oficial: https://supabase.com/docs/guides/platform/ssl-enforcement . Não altera a configuração SSL do projeto.

## Custo

O repositório foi verificado como público em 12/11/2026. O executor escolhido é o Linux padrão `ubuntu-24.04`, gratuito para repositórios públicos. Não usa executores grandes, projetos Supabase novos, branches pagos ou planos novos.

**A utilização/limite gratuito de armazenamento de artefatos da conta ainda precisa ser verificada.** O processo real bloqueia enquanto a variável de repositório `LDR_BACKUP_ZERO_COST_CONFIRMED` não for `true`. Só a definir após confirmar nos limites de faturação que esta execução/retensão de um dia não gera despesas; não aumentar qualquer orçamento. Há limite de 256 MiB para o dump e de 256 MiB para os objetos. O limite é uma proteção operacional, não prova da quota restante.

Fontes oficiais:
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://www.postgresql.org/docs/17/app-pgdump.html
- https://www.postgresql.org/docs/17/app-pg-dumpall.html

## Configuração pelo iPhone — só depois da revisão do PR

1. Não colocar a senha no chat nem em `Run workflow`.
2. Em Settings → Environments do repositório, criar/revisar o ambiente `ldr-backup`, exigir como revisor **apenas `lucianodeev`**, permitir autorrevisão e restringir os deployment branches para **apenas a branch `main`**. O workflow verifica essas regras pela API antes de solicitar o job com segredos. Não criar segredos em nível de repositório.
3. Adicionar como **Environment secrets**:

   | Nome | Valor que só o proprietário introduz na interface GitHub |
   |---|---|
   | `LDR_BACKUP_DB_PASSWORD` | Senha existente da base de dados PostgreSQL, sem a redefinir |
   | `LDR_BACKUP_STORAGE_KEY` | Chave Supabase de servidor compatível com Storage, preferencialmente uma credencial com âmbito de leitura de cópia; nunca a chave anon/publicável |
   | `LDR_BACKUP_PASSPHRASE` | Frase de cifragem nova, aleatória, com pelo menos 24 caracteres, guardada também no gestor de senhas do iPhone |

   Guardar segredos neste ambiente dá ao job aprovado acesso de leitura aos dados e, conforme a chave escolhida, capacidades adicionais que o script não usa. Fazer isso somente após revisão do código e das restrições do ambiente. A frase de cifragem não será recuperável a partir do artefato se for perdida.
4. Em **Environment variables**, `LDR_BACKUP_DB_HOST`: copiar o host mostrado em Supabase → Connect → Direct → **Session pooler**. Aceita apenas o pooler eu-north-1 na porta 5432, com o utilizador derivado `postgres.sfrcsrzuoqdscflfuwik`; ou o host direto `db.sfrcsrzuoqdscflfuwik.supabase.co` se o executor tiver IPv6. Não comprar o adicional IPv4. A senha nunca entra nesta variável.
5. Depois de verificar a quota de artefatos, definir a variável de repositório `LDR_BACKUP_ZERO_COST_CONFIRMED=true`.
6. O PR precisa estar revisto e integrado antes de aparecer `Run workflow` na aba Actions. **Este PR não se integra sozinho.** A branch `main` tem autoDeploy Render; avaliar esse efeito antes de integrar, mesmo sendo uma alteração apenas de scripts/workflow.
7. Actions → **LDR encrypted recovery preparation** → Run workflow → primeiro `preparation`. Depois, quando esse ensaio passar e o ambiente estiver protegido, selecionar `backup_restore` e introduzir apenas o identificador `sfrcsrzuoqdscflfuwik`. Aprovar o job do ambiente no iPhone.
8. Descarregar o `.gpg` para Ficheiros do iPhone antes de expirar (um dia) e preservar a frase de cifragem separadamente. Não partilhar o dump em claro. O sucesso no runner comprova a cópia que foi decifrada e restaurada lá; revalidar também os bytes descarregados antes de uma decisão de produção.

## O que ainda será obrigatório para liberar produção

- Cópia integral dos componentes e chaves externas, com recuperação comprovada, incluindo OAuth.
- Restauração num Storage isolado com objetos, metadados e políticas, não apenas recuperação dos bytes.
- Testes completos de pagamentos, créditos, concorrência e isolamento sobre o clone recuperado.
- Google Calendar real no calendário de teste, incluindo criação, alteração, cancelamento e idempotência.
- Revisão final das evidências. A migração principal e a feature flag nunca são alteradas por este workflow.

## Validação local

```sh
python3 -m unittest discover -s scripts/agenda/recovery -p 'test_*.py' -v
python3 scripts/agenda/recovery/prepare.py --self-test
```

O segundo comando requer Docker e GnuPG; não usa credenciais de produção. Erros detalhados de produção são retidos fora dos logs públicos; o processo imprime somente códigos constantes de bloqueio. Se uma restauração falhar, investigar em ambiente privado e manter o bloqueio, em vez de ignorar o erro.
