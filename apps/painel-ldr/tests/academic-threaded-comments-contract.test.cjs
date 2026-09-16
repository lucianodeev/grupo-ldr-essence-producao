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

test('reply fixture remains associated with the correct root comment', () => {
  const root = { id: 'comment-1', post_id: 'post-1', parent_comment_id: null, body: 'Comentário raiz' };
  const reply = { id: 'reply-1', post_id: 'post-1', parent_comment_id: 'comment-1', body: 'Resposta de teste' };
  const tree = threadFixture([root, reply]);
  assert.deepEqual(tree.get(null), [root]);
  assert.deepEqual(tree.get('comment-1'), [reply]);
});

test('reply contract requires parent to belong to the same post', () => {
  const parent = { id: 'comment-1', post_id: 'post-1', status: 'active' };
  const valid = input => Boolean(parent && parent.status === 'active' && parent.post_id === input.postId);
  assert.equal(valid({ postId: 'post-1', parentCommentId: 'comment-1' }), true);
  assert.equal(valid({ postId: 'post-2', parentCommentId: 'comment-1' }), false);
});

test('missing parent_comment_id represents a root comment, not a reply', () => {
  const input = { postId: 'post-1', body: 'Raiz', anonymous: false, parentCommentId: null };
  assert.equal(Boolean(input.parentCommentId), false);
});

test('mock explicitly does not claim PostgreSQL FK or RLS validation', () => {
  const status = 'VALIDADO EM MOCK — BANCO REAL PENDENTE';
  assert.match(status, /BANCO REAL PENDENTE/);
});
