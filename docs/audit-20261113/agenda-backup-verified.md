# Agenda LDR — recuperação real do banco comprovada
Data: 13/11/2026. Projeto: `sfrcsrzuoqdscflfuwik`.

## Resultado
A PR #289 foi integrada após autorização explícita do proprietário.
Commit integrado: `81cabe11773823e82da79a154a90d7ced831bf6e`.

**A recuperação real do banco passou. A agenda ainda não foi liberada em produção.**
A migração da agenda foi aplicada somente no clone descartável para a validação básica.
A consulta posterior ao Supabase confirmou `agenda_migration_absent=true` em produção.

## Evidências
- [PR #289 integrada](https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/289)
- [26 testes, cifragem do diagnóstico e restauração sintética aprovados](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43340426276)
- [Execução real #36 aprovada](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43341489522)
- Artefato GitHub: `ldr-encrypted-recovery-43341489522`, ID `13999053903`.
- Tamanho da cópia descarregada: 20.066.403 bytes.
- Conteúdo do ZIP: somente `recovery.tar.gpg` e `verification.json`.
- SHA256 do ZIP confirmado contra a API GitHub:
  `a394888d896febf8b9c02d8275bc7bf4dd50bdcc18122d6aac096b9f1baea1b8`
- SHA256 do arquivo cifrado confirmado contra o resultado do ensaio:
  `8e0d3de0813cd9c7508592fe30b60061327ba00ea0769a0dc9871afb870be66a`
- A mesma cópia cifrada foi preservada fora do artefato temporário do GitHub. A frase de cifragem permanece separada; nenhum valor de credencial foi publicado.

## Etapas reais aprovadas
| Etapa | Resultado |
|---|---|
| Esquema em ambiente isolado | Aprovado |
| Exportação consistente em modo somente leitura | Aprovada |
| Papéis sem senhas | Exportados e restaurados |
| Cifra/decifra do pacote | Arquivos recuperados com hashes iguais |
| Restauração do banco decifrado | Aprovada, sem rede nem portas publicadas |
| Tabelas | 251 comparadas |
| Sequências | 12 comparadas |
| RLS, ACLs, proprietários e regras SQL | Comparação aprovada |
| Bytes dos objetos Storage | Recuperados no pacote cifrado |
| Migração da agenda no clone | Aplicada e permissões básicas aprovadas |
| Migração da agenda em produção | Não aplicada |
| Ativação da agenda no Render | Não executada |

As duas diferenças anteriores eram agrupamentos associativos de AND nas definições de uma constraint e de uma política. A correção usa o parser PostgreSQL 17 para comparar toda a estrutura SQL, preservando operadores, literais, funções, casts, identificadores, ordem dos argumentos e limites OR/NOT. Os testes negativos rejeitam mudanças de condição, permissões, RLS e dados. O SQL original continua intacto dentro do pacote cifrado.

## Logs saneados — UTC
```text
01:03:04 PASS isolated schema restore preflight; full recovery still required
01:03:05 PASS read-only snapshot opened
01:05:08 PASS database and password-free roles exported
01:05:53 PASS encrypted payload decrypted with matching hashes
01:05:57 PASS restore completed in a network-isolated container
01:06:02 PASS exact data, sequence, RLS, ACL and parsed rule comparison
01:06:02 PASS agenda migration and basic permissions in isolated clone
01:06:02 PASS encrypted database recovery rehearsal; production gate remains CLOSED
```

## Limites que ainda impedem a liberação
O resultado mantém `production_gate=false` e `project_backup_complete=false`.
A recuperação do banco e dos bytes de Storage não equivale à recuperação de todos os serviços/configurações do projeto.

Ainda faltam:
1. Recuperação comprovada de configurações e chaves externas necessárias, incluindo a chave dos tokens Calendar.
2. Restauração em um serviço Storage isolado, com objetos, metadados e políticas.
3. Testes funcionais completos de pagamentos, créditos, concorrência e permissões sobre o banco recuperado.
4. Teste real da integração Google Calendar, incluindo criação, leitura, conflitos, duplicação, reagendamento, cancelamento e limpeza.

A agenda só pode ser ativada depois dessas etapas aprovadas.

## Proteções preservadas
- Sem alteração ou exclusão de dados da origem.
- Sem planos pagos ou recursos adicionais contratados.
- Render confirmou `commit_ignored` para o commit integrado; nenhuma publicação automática foi provocada por esta integração.
- A cifra, o ambiente protegido, a exigência de main e os controles de custo zero continuam ativos.
- Senhas, chaves de API e tokens não aparecem neste relatório nem nos logs públicos.
