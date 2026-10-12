# Critérios editoriais — expansão LDR Academy

Os 120 cursos novos são formações livres profissionais, adicionais aos cursos existentes. Não são graduações nem concedem habilitação para profissões regulamentadas.

## Padrão existente
- Catálogo: `apps/painel-ldr/src/lib/academy-professional-formations.catalog.ts`.
- Área do aluno: `apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.formacao-profissional.$slug.tsx`.
- Matrícula e acesso: `apps/painel-ldr/src/lib/professional-formations.server.ts`.
- Aulas atuais: `apps/painel-ldr/src/lib/professional-formations-lessons.ts`.

## Requisitos de aceitação
1. Evitar duplicações de slug, título, tema e conteúdo, incluindo registros persistidos.
2. Cada aula deve apresentar objetivo mensurável, explicação técnica específica, estudo de caso próprio, atividade verificável, critérios de avaliação e referências reais.
3. Não reutilizar as estruturas genéricas de texto do gerador atual como se fossem conteúdo concluído.
4. Justificar as 600 horas por atividades, leituras, exercícios, avaliações e projetos efetivamente disponibilizados.
5. Garantir imagens licenciadas, áudio pertinente, acessibilidade e tradução revisada nos idiomas disponíveis.
6. Preservar assinaturas LDR ONE e a gratuidade dos cursos existentes.
7. Não apresentar formação livre como diploma superior ou autorização para atos profissionais regulamentados.
8. Testar build, rotas, biblioteca, direitos de acesso, progresso, projeto final e emissão de certificado antes da publicação.
9. Usar apenas GitHub e Render, sem alterar o serviço em produção até a aprovação dos testes.

## Estado
Diretrizes registradas; cinco propostas de currículo no primeiro lote; zero novos cursos completos ou publicados.