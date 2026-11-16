# Atendimento ao Cliente — integração para leitura

## Entrega técnica

As seis unidades continuam como fontes editoriais originais, sem reescrita ou publicação.
`node tools/prepare-customer-service-academy.cjs --stdout` produz uma candidata compatível com o novo leitor em memória/stdout: identificação determinística da edição, productKey existente e corpos Markdown com hashes SHA-256 sem perda. O comando não grava ficheiros nem importa a candidata na aplicação.

O leitor de assinatura consulta agora um registo de edições aprovadas. O registo está vazio: as fontes pendentes não entram nos bundles. Tanto o seletor como o componente recusam candidatas draft ou sem revisões, identificação de revisor, data e duração validada. A aprovação de testes é distinta da aprovação do conteúdo.

A leitura de uma edição aprovada aparece depois da autorização existente do curso. Suporta títulos, parágrafos, negrito e a tabela da rubrica; HTML é escapado e URLs permanecem texto. Não se afirma suporte a todo o Markdown.

## Progresso preservado

A edição de seis unidades é suplementar ao currículo histórico de quinze módulos. Não substitui módulos, não migra índices, não cria conclusões nem emite certificados. Não escreve localStorage ou progresso remoto. O productKey comercial, assinaturas, Stripe e namespace de progresso histórico ficam intactos. Não se presume equivalência pedagógica 15→6.

Esta escolha permite leitura sem alteração de progresso. Um percurso novo com conclusões próprias e sincronização entre dispositivos exigirá uma tarefa separada com revisão pedagógica e armazenamento por edição; não está implementado nesta entrega.

## Verificação local

- 7 testes novos: exportação integral/determinística, bloqueio de drafts, cada revisão obrigatória, renderização das seis unidades e tabela, escape de HTML/URLs, separação do histórico e registo vazio.
- 8 testes existentes de acesso do leitor: passaram, incluindo compras, aliases, LDR ONE, separação de clientes e conteúdos inválidos.
- TypeScript: passou.
- Build: passou, sem deploy. Avisos existentes de depreciação e tamanho de bundles não são falhas deste leitor.
- Não houve teste de navegação em browser nem aprovação de acessibilidade interativa; renderização HTML por React no servidor não substitui esses testes.

## Bloqueio real de publicação

Não existem neste dossiê evidências de revisão pedagógica/editorial concluída, liberação de direitos, acessibilidade interativa ou aferição de carga horária. Todos os campos da candidata permanecem pendentes. A autorização para executar/publicar não fornece essas evidências e não as transforma em concluídas.

Não adicionar candidatas ao registo, não ativar o curso, não fazer merge/publicar este PR como se as revisões estivessem concluídas. Após a revisão documentada, a edição exata deve ser conferida contra os hashes, testada no browser com utilizadores autorizados e não autorizados, registada e submetida aos checks de release. A aprovação deve identificar revisor, data, versão e duração aferida; nenhuma foi fabricada nesta entrega.
