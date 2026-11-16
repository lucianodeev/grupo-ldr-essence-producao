# Atendimento ao Cliente — liberação da edição de leitura

Em 16/11/2026, o responsável pelo projeto aprovou o caminho de uma edição de leitura sem promessa de 120 horas nem certificado e determinou a conclusão/publicação. Esta decisão atualiza o escopo anterior. Não transforma estimativas em horas medidas e não equivale a parecer jurídico, aprovação pedagógica externa ou certificação de acessibilidade.

## Modalidade aprovada

- Seis unidades com exercícios e respostas, revisão documental interna assistida por IA e aceite editorial do responsável.
- Leitura estimada de 40–50 minutos: cálculo ilustrativo, arredondado, das 9.704 palavras das fontes a 200–250 palavras/minuto. Inclui a leitura dos enunciados, não a execução dos exercícios. Não foi medido com uma turma.
- Atividades no ritmo do aluno. Duração total não fixada, `validatedHours=null`, `certificate=false`, sem emissão de certificados.
- Revisão de proveniência limitada aos seis textos originais produzidos para este projeto; não foram identificados imagens, materiais externos licenciados ou citações externas que exijam autorização adicional. Não se declara uma busca exaustiva de plágio nem um parecer jurídico.
- Leitura crítica de competências, casos, gabaritos e rubricas registada na revisão documental. Não é validação externa de resultados de aprendizagem.
- Checks internos de navegação, teclado, tabela e layout em mobile/desktop; não são declaração de conformidade WCAG integral.

## Publicação e preservação

As fontes editoriais e o exportador original permanecem draft como arquivo histórico. A edição de leitura tem cópia própria server-only: remove apenas notas internas de estado/revisões e atualiza as frases editoriais de pré-publicação para limites de aplicação operacional. Conteúdo didático, casos, exercícios, respostas e rubricas permanecem. Cada unidade conserva `sourceSha256` e um hash específico da edição publicada.

Os textos são entregues por server function autenticada, com a mesma decisão de acesso do curso existente e `Cache-Control: private, no-store`. Um slug inválido ou acesso recusado não devolve texto. Não se introduz acesso gratuito, novo plano ou nova cobrança. Os corpos não entram nos assets JavaScript públicos.

O catálogo conserva slug/productKey e os quinze módulos históricos para preservar índices e progresso; os pontos atuais de apresentação mostram a estimativa da edição de leitura e a ausência de certificado. O currículo histórico fica recolhido, acessível para consulta. A leitura das seis unidades não cria conclusões nem regrava progresso antigo. Os outros cursos e candidatas não são ativados.

## Verificação e release

Testes específicos verificam a modalidade sem horas, hashes/proveniência, recusas de acesso, entrega autorizada e separação entre servidor e cliente. O CI deve comprovar o build, isolamento dos assets e navegação da edição aprovada antes do merge. A autorização de publicação está registada; usar o serviço Render existente em My Workspace, sem criação de serviço, mudança de plano, pagamentos ou migrações de dados.
