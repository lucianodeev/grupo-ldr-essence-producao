# LDR Academy — evidência de teste local do laboratório SQL

**Data:** 2026-10-13  
**Escopo:** verificação dos três testes aritméticos de fixture em Node.js 22.16.0, com reprodução local do conteúdo de `apps/painel-ldr/tests/academy-sql-60h-fixture.test.mjs`.

## Resultado

- Contagem de 24 pedidos, 21 concluídos e um concluído sem itens: **aprovado**.
- Divergências financeiras nos pedidos 1002 (10) e 1003 (30): **aprovado**.
- Pedidos com dois itens: 1005, 1010, 1015, 1020: **aprovado**.
- Sumário TAP: **3 aprovados, 0 falhas**.

## Limites desta evidência

A execução ocorreu numa cópia local equivalente do teste, e não diretamente num checkout do repositório. Isso verifica a aritmética e os resultados esperados, mas não comprova que o runner de CI ou o ambiente do projeto executou o arquivo versionado.

O ambiente de verificação não tinha o cliente `psql`; portanto, os scripts SQL ainda **não foram executados em PostgreSQL**. Também não foram verificados build, integração, rotas, carga horária, traduções ou direitos de acesso.

**Status de publicação:** bloqueado até as verificações completas. Nenhuma alteração no catálogo público ou em produção foi realizada por este teste.
