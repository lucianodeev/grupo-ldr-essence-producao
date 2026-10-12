# Validação estrutural das oito frentes autorais — 2026-10-13

## Método

Os oito arquivos `*.initial.ts` foram lidos diretamente da branch `feat/academy-120-formations-20261012` via conector GitHub. As expressões de validação equivalentes às do teste editorial foram executadas em JavaScript sobre o conteúdo recuperado, verificando: `publicationReady: false`, `proposedHours` de 60/120/240, unicidade de `slug` e de `id`, dois registos por campo pedagógico (`title`, `objective`, `scenario`, `content`, `practice`, `assessment`, `references`) e ausência de IDs adicionais não reconhecidos.

## Resultado observado

- Arquivos analisados: **8**
- Slugs distintos: **8**
- IDs de aulas distintos: **16**
- Erros nas verificações: **0**
- Estado de publicação dos oito rascunhos: **false**

## Limites

Esta verificação foi executada sobre conteúdo obtido diretamente do GitHub, **não** pelo runner `node --test` do repositório nem pelo GitHub Actions. Não houve execução dos scripts PostgreSQL. As verificações estruturais não garantem adequação didática, precisão integral das referências, completude dos módulos, duração de 60/120 horas ou integração com o catálogo.

**Decisão:** manter os cursos fora do catálogo público; continuar desenvolvimento e testes antes de qualquer publicação.
