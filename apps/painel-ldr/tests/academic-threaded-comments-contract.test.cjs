// Zero-write threaded-comment contract tests. These validate shape/guard expectations only; PostgreSQL FK/RLS remains pending.
const { test } = require('node:test');
const assert = require('node:assert/strict');

function threadFixture(comments) {
  const byParent = new Map();
  for (const comment of comments) {
    const key = comment.parent_comment_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(comment);
  }
  return byParent;
}

function validateReply({ postId, parentCommentId, userAuthorized }, parents) {
  if (!userAuthorized) return 'unauthorized';
  const parent = parents.find(item => item.id === parentCommentId);
  if (!parent) return 'invalid-parent';
  if (parent.status !== 'active') return 'invalid-parent';
  if (parent.post_id !== postId) return 'invalid-parent';
  return 'ok';
}

test('thread fixture groups two replies under A and keeps D as a separate root', () => {
  const a = { id: 'A', post_id: 'post-1', parent_comment_id: null, body: 'Comentário A' };
  const b = { id: 'B', post_id: 'post-1', parent_comment_id: 'A', body: 'Resposta B' };
  const c = { id: 'C', post_id: 'post-1', parent_comment_id: 'A', body: 'Resposta C' };
  const d = { id: 'D', post_id: 'post-1', parent_comment_id: null, body: 'Comentário D' };
  const tree = threadFixture([a, b, c, d]);
  assert.deepEqual(tree.get(null), [a, d]);
  assert.deepEqual(tree.get('A'), [b, c]);
});

test('reply contract accepts only an active parent from the same post', () => {
  const parents = [
    { id: 'A', post_id: 'post-1', status: 'active' },
    { id: 'inactive', post_id: 'post-1', status: 'deleted' },
    { id: 'other-post', post_id: 'post-2', status: 'active' },
  ];
  assert.equal(validateReply({ postId: 'post-1', parentCommentId: 'A', userAuthorized: true }, parents), 'ok');
  assert.equal(validateReply({ postId: 'post-1', parentCommentId: 'missing', userAuthorized: true }, parents), 'invalid-parent');
  assert.equal(validateReply({ postId: 'post-1', parentCommentId: 'inactive', userAuthorized: true }, parents), 'invalid-parent');
  assert.equal(validateReply({ postId: 'post-1', parentCommentId: 'other-post', userAuthorized: true }, parents), 'invalid-parent');
  assert.equal(validateReply({ postId: 'post-1', parentCommentId: 'A', userAuthorized: false }, parents), 'unauthorized');
});

test('null or missing parent_comment_id represents a root comment and preserves legacy comments', () => {
  const legacy = { id: 'legacy', post_id: 'post-1', body: 'Comentário antigo' };
  const explicitRoot = { id: 'root', post_id: 'post-1', parent_comment_id: null, body: 'Raiz' };
  const tree = threadFixture([legacy, explicitRoot]);
  assert.deepEqual(tree.get(null), [legacy, explicitRoot]);
});

test('soft-deleting a parent does not imply cascading deletion of its reply fixtures', () => {
  const parent = { id: 'A', post_id: 'post-1', parent_comment_id: null, status: 'deleted' };
  const reply = { id: 'B', post_id: 'post-1', parent_comment_id: 'A', status: 'active' };
  const tree = threadFixture([parent, reply]);
  assert.deepEqual(tree.get('A'), [reply]);
  assert.equal(reply.status, 'active');
});

test('mock explicitly does not claim PostgreSQL FK or RLS validation', () => {
  const status = 'VALIDADO EM MOCK — BANCO REAL PENDENTE';
  assert.match(status, /BANCO REAL PENDENTE/);
});
