# Cópia recuperável das configurações externas — revisão

Este procedimento ainda exige autorização específica antes de copiar credenciais do Render para um novo segredo GitHub. Nenhum valor foi copiado por esta alteração.

## Ação proposta

Copiar o conjunto de variáveis do serviço Render `srv-daqq2gfavr4c7394hb1g` para **um único Environment secret** chamado `LDR_BACKUP_APP_CONFIG_JSON` no ambiente GitHub já protegido `ldr-backup`, do repositório `lucianodeev/grupo-ldr-essence-producao`. Não usar segredo de repositório, commit, variável pública, log ou mensagem. O objeto JSON preserva os nomes/valores existentes; não redefine chaves.

Isso dá ao job aprovado pelo proprietário acesso às credenciais Google Calendar, Supabase e Stripe contidas nesse conjunto. O job limita-se a guardá-las no mesmo payload GnuPG do backup, conferir o roundtrip e testar localmente que a chave recuperada decifra o refresh token Calendar recuperado. Não chama o Stripe nem efetua cobranças. Não usa essas credenciais para modificar serviços.

## Controles implementados

- Entrada opcional ausente não pode declarar backup das configurações.
- Identificador Supabase e callback Google devem corresponder exatamente ao projeto autorizado.
- AGENDA_INTEGRATION_ENABLED e GOOGLE_CALENDAR_VALIDATION_ENABLED devem ser false.
- Valida estrutura, campos obrigatórios, tamanho e chave AES256 de 32 bytes.
- Arquivo temporário `render-environment.json` fica somente no diretório privado do payload, cifrado por `seal()` junto ao banco/objetos e removido ao fim do job. O hash é comparado depois de decifrar o arquivo.
- Verificação AES256-GCM usa somente o token cifrado do clone isolado e a chave do payload decifrado; não imprime token, chave, URI ou variáveis.
- O procedimento local de decifragem rejeita adulteração e não usa rede.
- A ausência dessa entrada mantém as flags de recuperação de configurações falsas. A liberação global permanece false em todos os casos.

## Limites

Esta cópia cobre o conjunto de variáveis do Render. Não prova sozinha recuperação das configurações geridas do Supabase, dos segredos de Edge Functions, de checkout/webhooks externos ou do serviço Storage. Essas evidências permanecem separadas e obrigatórias conforme o escopo final de liberação.

## Validação

Quatro testes automatizados usam somente credenciais sintéticas: ausência de entrada, projeto/flags/chave inválidos, preservação integral de valores extras e roundtrip AES-GCM com rejeição de adulteração sem revelar o token. Exigem sucesso antes da integração.
