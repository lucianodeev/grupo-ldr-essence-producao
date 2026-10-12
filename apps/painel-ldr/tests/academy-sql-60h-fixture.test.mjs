// Executar com: node --test apps/painel-ldr/tests/academy-sql-60h-fixture.test.mjs
// Verifica aritmeticamente o gabarito sintético do laboratório de 24 pedidos.
// NÃO substitui a execução dos arquivos .sql em PostgreSQL.
import test from "node:test";
import assert from "node:assert/strict";

const pedidos = Array.from({ length: 24 }, (_, i) => {
  const id = 1001 + i;
  return {
    id,
    status: [1004, 1012, 1020].includes(id) ? "cancelado" : "concluido",
    itens: id === 1024 ? [] : [10 * (1 + (i % 5)), ...(id % 5 === 0 ? [5] : [])],
    pagamentos: [1004, 1012, 1020, 1024].includes(id)
      ? []
      : [{ valor: id === 1002 ? 10 : 10 * (1 + (i % 5)) + (id % 5 === 0 ? 5 : 0),
          status: id === 1003 ? "pendente" : "confirmado" }]
  };
});

test("24 pedidos, 21 concluídos e 1 concluído sem itens", () => {
  assert.equal(pedidos.length, 24);
  assert.equal(pedidos.filter(p => p.status === "concluido").length, 21);
  assert.deepEqual(pedidos.filter(p => p.status === "concluido" && !p.itens.length).map(p => p.id), [1024]);
});

test("divergências apenas nos pedidos 1002 e 1003", () => {
  const divergentes = pedidos.filter(p => p.status === "concluido").map(p => ({
    id: p.id,
    diferenca: p.itens.reduce((a, b) => a + b, 0)
      - p.pagamentos.filter(x => x.status === "confirmado").reduce((a, b) => a + b.valor, 0)
  })).filter(p => p.diferenca !== 0);
  assert.deepEqual(divergentes, [{ id: 1002, diferenca: 10 }, { id: 1003, diferenca: 30 }]);
});

test("quatro pedidos possuem dois itens, incluindo um cancelado", () => {
  assert.deepEqual(pedidos.filter(p => p.itens.length === 2).map(p => p.id),
    [1005, 1010, 1015, 1020]);
});
