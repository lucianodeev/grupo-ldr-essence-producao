# LDR Academy — Verificação estrutural de 64 aulas (13/10/2026)

**Escopo:** branch `feat/academy-120-formations-20261012`; oito cursos em elaboração, quatro módulos por curso, dois rascunhos de aula por módulo. Esta verificação não autoriza publicação.

## Método e resultado

Foram consultados diretamente por `fetch_file` no GitHub os 32 arquivos TypeScript de conteúdo autoral (`.initial.ts`, `.module-02.ts`, `.module-03.ts` e `.module-04.ts`) dos oito cursos. A inspeção de texto identificou, em cada arquivo:

- dois campos `id` de aulas, totalizando **64 aulas**;
- dois campos de cada tipo: `title`, `objective`, `scenario`, `content`, `practice`, `assessment` e `references`;
- `publicationReady: false`;
- `slug` consistente ao longo dos quatro módulos de cada curso;
- identificadores sequenciais de módulo e aula, sem colisões entre os oito prefixos de curso.

| Curso (prefixo de arquivo) | Módulos | Aulas | Slug |
|---|---:|---:|---|
| recepcao-hoteleira | 4 | 8 | atendimento-operacoes-recepcao-hoteleira |
| quantitativos-basicos | 4 | 8 | leitura-projetos-quantitativos-basicos |
| cozinha-custos | 4 | 8 | boas-praticas-controle-custos-cozinhas |
| apis-rest-testes | 4 | 8 | desenvolvimento-apis-rest-com-testes |
| educacao-avaliacao | 4 | 8 | avaliacao-formativa-planeamento-educacional |
| beleza-consulta | 4 | 8 | consulta-segura-servicos-beleza |
| saude-seguranca-paciente | 4 | 8 | seguranca-paciente-comunicacao-equipes |
| psicanalise-escuta | 4 | 8 | escuta-etica-entrevista-psicanalitica |
| **Total** | **32** | **64** | **8** |

## Limites e gates pendentes

Esta é uma **inspeção estrutural remota de conteúdo**, não execução do compilador TypeScript, build, testes automatizados ou revisão pedagógica de profundidade. Os campos foram contados por padrões de texto; é necessário testar os módulos no ambiente de desenvolvimento antes de afirmar validade sintática e funcional.

**Ainda pendente:** verificar cálculos e fontes, revisão editorial de repetições semânticas, carga horária real, exercícios avaliados, acessibilidade, integração segura na biblioteca e testes de regressão. Nenhuma alteração em catálogo público, base de dados, pagamentos ou produção foi autorizada ou realizada nesta execução.

**Gate:** manter os oito cursos como rascunho, sem marcar 60/120 horas como entregues e sem publicação.
