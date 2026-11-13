# Agenda e disponibilidade — atualização de interface em 13/11/2026

PR integrado: https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/296

Head validado: 279c719ad8c0cfa127a763ee7dd7c02a263f4bd6. Merge preservando histórico: f58c6ece876baca8f7b13f6ebf1742e06bc30f7e.

## Problema e resultado
Uma leitura falhada podia ser apresentada como agenda vazia ou ausência de disponibilidade. As agendas profissional/cliente e a disponibilidade agora distinguem consulta pendente, erro e sucesso vazio. O erro mostra mensagem genérica e botão de nova tentativa, em português, inglês, francês e espanhol. O botão fica desativado durante nova consulta. As telas não liberam formulários baseados em dependências que ainda não carregaram ou falharam. Nenhum detalhe interno de exceção é mostrado.

Mudança limitada a quatro arquivos TSX: componente compartilhado agenda-query-feedback e três páginas. Sem migração, operações de banco, alteração de horários, pagamento, créditos, credenciais ou contratação.

## Validação
- npm ci pelo lockfile; npm --prefix apps/painel-ldr run build:render aprovado.
- npm --prefix apps/painel-ldr run typecheck aprovado: zero diagnósticos no projeto.
- npm --prefix apps/painel-ldr run test: 59/59 aprovados.
- npm --prefix apps/painel-ldr run test:regressions: 149/149 aprovados. Não somar novamente os cenários de disponibilidade incluídos nessa suíte.
- git diff --check aprovado.
- GitHub PR build Node 22: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43480032375 — sucesso, incluindo 13 testes de propriedade/comportamento de disponibilidade e build.
- Vercel Agent Review: aprovado, zero sugestões. As publicações alternativas Vercel retornaram bloqueio de conta; não são o serviço Render usado e não houve tentativa de contratar plano ou contornar o bloqueio.
- Build de main: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43480380832 — sucesso.
- Validação da rede profissional em main: execução 43480380789 — sucesso.

## Publicação e conferência
Render srv-daqq2gfavr4c7394hb1g, workspace tea-daqpr6nf3r2c73bnaijg, plano free preservado. Deploy automático dep-dbrl65gjo6nc73en2oug no merge f58c6ece876baca8f7b13f6ebf1742e06bc30f7e, iniciado 18:12:38 UTC e live 18:14:44 UTC (19:14:44 de Bruxelas).

Conferência com a sessão existente do proprietário, sem criar agendamentos ou alterar disponibilidade:
- /painel-profissional/agenda: observado o novo estado Loading schedule… durante consulta, seguido do cabeçalho Agenda, botão Novo agendamento e estado vazio verdadeiro.
- /painel-profissional/disponibilidade: carregou serviços e horários existentes, com Europe/Brussels nos registros publicados; nenhuma edição submetida.
- /cliente/agenda: exibiu a agenda e a ausência real de pedido pago elegível nesta conta; nenhum link de reunião indevido.

Não foi forçada falha da produção para testar a tela de erro. A condição de erro/retry foi revisada no código; o caminho de carregamento e as leituras bem-sucedidas foram observados no serviço publicado. As suítes existentes e o build não são apresentados como prova de uma indisponibilidade induzida em produção.

## Pendência separada
A rotação das seis credenciais anteriormente expostas não foi executada. O login Stripe avançou até verificação adicional por e-mail, sem recebimento confirmado; o proprietário pediu seguir as atualizações de produto. Nenhuma troca foi declarada concluída e nenhuma chave foi revogada. Esta atualização de interface não resolve essa pendência.
