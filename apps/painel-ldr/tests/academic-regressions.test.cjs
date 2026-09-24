// Behavioral regression tests with isolated database/storage doubles. No production data is changed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ROOT = path.resolve(__dirname, '../src');

function load(name, mocks = {}, globals = {}) {
  const filename = path.resolve(ROOT, name);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const resolve = id => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === '@tanstack/react-start') return { useServerFn: fn => fn };
    if (id.endsWith('.css')) return {};
    if (id.startsWith('@/')) return load(id.slice(2) + (fs.existsSync(path.resolve(ROOT,id.slice(2)+'.ts'))?'.ts':'.tsx'), mocks, globals);
    return require(id);
  };
  vm.runInNewContext(output, { module, exports: module.exports, require: resolve, console, Blob, File, Uint8Array, URL, setTimeout, clearTimeout, ...globals }, { filename });
  return module.exports;
}

function database(seed = {}, options = {}) {
  const rows = structuredClone(seed), events = [];
  let sequence = 0;
  const db = {
    rows, events,
    from(table) {
      const filters = []; let operation = 'select', values, count = false, one = false, start = 0, end = Infinity;
      const orders = [];
      const q = {
        select(_, opts) { count = opts?.count === 'exact'; return q; },
        eq(key, value) { filters.push(row => row[key] === value); return q; },
        neq(key, value) { filters.push(row => row[key] !== value); return q; },
        in(key, values) { filters.push(row => values.includes(row[key])); return q; },
        is(key, value) { filters.push(row => (row[key] ?? null) === value); return q; },
        gte(key, value) { filters.push(row => row[key] >= value); return q; },
        ilike(key, value) { filters.push(row => String(row[key] || '').toLowerCase().includes(value.replaceAll('%', '').toLowerCase())); return q; },
        or() { return q; },
        like() { return q; },
        order(key, opts) { orders.push([key, opts?.ascending !== false]); return q; },
        limit(size) { end = size - 1; return q; },
        range(from, to) { start = from; end = to; return q; },
        insert(input) { operation = 'insert'; values = input; return q; },
        upsert(input) { operation = 'upsert'; values = input; return q; },
        update(input) { operation = 'update'; values = input; return q; },
        delete() { operation = 'delete'; return q; },
        single() { one = true; return q; },
        maybeSingle() { one = true; return q; },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            rows[table] ||= [];
            events.push({ table, operation, values: structuredClone(values) });
            if (options.fail?.(table, operation)) return { data: null, error: { code: 'TEST_FAILURE' } };
            let result = rows[table].filter(row => filters.every(filter => filter(row)));
            if (operation === 'insert' || operation === 'upsert') {
              result = [].concat(values).map(row => {
                if (operation === 'upsert' && table === 'academic_profiles') {
                  const existing = rows[table].find(p => p.user_id === row.user_id);
                  if (existing) return existing;
                }
                const inserted = { id: `test-${++sequence}`, created_at: new Date().toISOString(), status: 'active', ...row };
                rows[table].push(inserted); return inserted;
              });
            } else if (operation === 'update') result.forEach(row => Object.assign(row, values));
            else if (operation === 'delete') rows[table] = rows[table].filter(row => !result.includes(row));
            for (const [key, asc] of [...orders].reverse()) result.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (asc ? 1 : -1));
            const total = result.length;
            result = result.slice(start, end + 1);
            return { data: one ? result[0] ?? null : result, count: count ? total : null, error: null };
          }).then(resolve, reject);
        },
      };
      return q;
    },
    storage: { from: () => ({
      download: async file => options.files?.[file] ? { data: options.files[file], error: null } : { data: null, error: { message: 'missing' } },
      createSignedUrl: async file => ({ data: { signedUrl: `https://storage.invalid/${file}` } }),
      createSignedUrls: async files => ({ data: files.map(file => ({ signedUrl: `https://storage.invalid/${file}` })) }),
    }) },
  };
  return db;
}

function backend(db) {
  return load('lib/academic-network.server.ts', {
    '@/integrations/supabase/client.server': { supabaseAdmin: db },
    '@/lib/access.server': { resolveAccess: async () => ({ authorized: false }) },
  });
}
const seed = () => ({
  academic_access_trials: [{ user_id: 'test-user', status: 'active', expires_at: new Date(Date.now() + 86400000).toISOString() }],
  academic_profiles: [{ id: 'profile-1', user_id: 'test-user', bio: 'existing' }],
});
const png = () => new Blob([Uint8Array.from([137,80,78,71,13,10,26,10,0,0])], { type: 'image/png' });

test('missing uploaded file creates no post', async () => {
  const db = database(seed());
  await assert.rejects(backend(db).createAcademicPost('test-user', { body: '', postType: 'photo', anonymous: false, hasAttachment: true, attachment: { path: 'test-user/posts/missing.png' } }), /Arquivo não encontrado/);
  assert.equal((db.rows.academic_posts || []).length, 0);
});

test('photo-only publication is hidden until its verified media is linked', async () => {
  const file = 'test-user/posts/photo.png', db = database(seed(), { files: { [file]: png() } });
  await backend(db).createAcademicPost('test-user', { body: '', postType: 'photo', anonymous: false, hasAttachment: true, attachment: { path: file } });
  assert.equal(db.rows.academic_posts.length, 1);
  assert.equal(db.rows.academic_posts[0].body, '');
  assert.equal(db.rows.academic_posts[0].status, 'active');
  assert.equal(db.rows.academic_post_media[0].post_id, db.rows.academic_posts[0].id);
  const operations = db.events.filter(e => ['academic_posts', 'academic_post_media'].includes(e.table) && ['insert', 'update'].includes(e.operation));
  assert.equal(operations[0].values.status, 'hidden');
  assert.equal(operations[1].table, 'academic_post_media');
  assert.equal(operations[2].values.status, 'active');
});

test('failed media finalization removes only the pending post', async () => {
  const file = 'test-user/posts/photo.png', data = seed();
  data.academic_posts = [{ id: 'keep', user_id: 'another-user', body: 'existing', status: 'active', created_at: '2020-01-01' }];
  const db = database(data, { files: { [file]: png() }, fail: (table, op) => table === 'academic_post_media' && op === 'insert' });
  await assert.rejects(backend(db).createAcademicPost('test-user', { body: 'caption', postType: 'photo', anonymous: false, hasAttachment: true, attachment: { path: file } }), /vincular/);
  assert.deepEqual(db.rows.academic_posts.map(p => p.id), ['keep']);
});

test('saved feed includes older saved posts before applying pagination', async () => {
  const data = seed();
  data.academic_posts = Array.from({ length: 65 }, (_, i) => ({ id: `p-${i}`, user_id: 'test-user', body: `Post ${i}`, status: 'active', is_pinned: false, created_at: new Date(2020, 0, 65 - i).toISOString() }));
  data.academic_saved_posts = [{ user_id: 'test-user', post_id: 'p-60' }];
  const result = await backend(database(data)).getAcademicNetwork('test-user', null, { savedOnly: true });
  assert.deepEqual(Array.from(result.posts, p => p.id), ['p-60']);
  assert.equal(result.hasMore, false);
});

test('membership toggles persist and write failures are reported', async () => {
  const db = database(seed()), api = backend(db);
  assert.equal((await api.toggleAcademicMembership('test-user', 'community-1')).joined, true);
  assert.equal(db.rows.academic_community_members.length, 1);
  assert.equal((await api.toggleAcademicMembership('test-user', 'community-1')).joined, false);
  assert.equal(db.rows.academic_community_members.length, 0);
  const failed = database(seed(), { fail: (table, op) => table === 'academic_community_members' && op === 'upsert' });
  await assert.rejects(backend(failed).toggleAcademicMembership('test-user', 'community-1'), /participação/);
});

test('profile updates retain the existing row and avatar finalization persists its path', async () => {
  const file = 'test-user/avatars/photo.png', db = database(seed(), { files: { [file]: png() } });
  const mocks = { '@/integrations/supabase/client.server': { supabaseAdmin: db } };
  const updated = await load('lib/academic-social-v2.server.ts', mocks).updateSocialProfile('test-user', { username: 'test.member', bio: 'updated', showName: true });
  assert.equal(updated.id, 'profile-1');
  await load('lib/academic-media-v2.server.ts', mocks).finalizeAcademicAvatar('test-user', file);
  assert.equal(db.rows.academic_profiles.length, 1);
  assert.equal(db.rows.academic_profiles[0].avatar_path, file);
  assert.equal(db.rows.academic_profiles[0].bio, 'updated');
});

test('canvas PNG fallback keeps the actual MIME and extension', async () => {
  const revoked = [];
  const api = load('lib/academic-image-client.ts', {}, {
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: url => revoked.push(url) },
    Image: class { naturalWidth = 4000; naturalHeight = 3000; set src(_) { this.onload(); } },
    document: { createElement: () => ({ getContext: () => ({ drawImage() {} }), toBlob: callback => callback(png()) }) },
  });
  const result = await api.optimizeAcademicImage(new File([png()], 'iphone.jpeg', { type: '' }), 1024);
  assert.equal(result.type, 'image/png');
  assert.equal(result.name, 'iphone.png');
  assert.deepEqual(revoked, ['blob:test']);
});

function toggler(field, mutateServer) {
  let snapshot = { posts: [{ id: 'p1', saved: false, supported: false, supportCount: 5 }] };
  const invalidations = [], tasks = [], errors = [];
  const qc = {
    setQueriesData: (_, update) => { snapshot = update(snapshot); },
    getQueriesData: () => [[['academic-network'], snapshot]],
    cancelQueries: async () => {}, isMutating: () => 1,
    invalidateQueries: async filter => invalidations.push(filter.queryKey[0]),
  };
  const hook = load('components/use-academic-post-toggle.ts', {
    react: { useRef: value => ({ current: value }) },
    sonner: { toast: { error: message => errors.push(message) } },
    '@tanstack/react-query': { useQueryClient: () => qc, useMutation: options => ({ mutate(id) {
      tasks.push(options.mutationFn(id).catch(error => options.onError?.(error)).finally(() => options.onSettled?.()));
    } }) },
  }).useAcademicPostToggle(field, 'academic-network', mutateServer);
  return { hook, tasks, invalidations, errors, post: () => snapshot.posts[0] };
}

test('rapid support clicks serialize requests and settle on the last desired state', async () => {
  let resolveFirst, active = 0, maxActive = 0, count = 0, canonical = false;
  const first = new Promise(resolve => { resolveFirst = resolve; });
  const h = toggler('supported', async () => {
    active++; maxActive = Math.max(maxActive, active); count++;
    if (count === 1) await first;
    canonical = !canonical; active--; return { supported: canonical };
  });
  h.hook.mutate('p1'); assert.equal(h.post().supportCount, 6);
  h.hook.mutate('p1'); assert.equal(h.post().supportCount, 5);
  h.hook.mutate('p1'); h.hook.mutate('p1');
  resolveFirst(); await Promise.all(h.tasks);
  assert.equal(maxActive, 1); assert.equal(count, 2);
  assert.equal(canonical, false); assert.equal(h.post().supported, false);
  assert.equal(h.post().supportCount, 5);
});

test('save updates immediately, invalidates Saved and rolls back a failed write', async () => {
  const h = toggler('saved', async () => ({ saved: true }));
  h.hook.mutate('p1'); assert.equal(h.post().saved, true);
  await Promise.all(h.tasks);
  assert.ok(h.invalidations.includes('academic-saved-content'));
  const failed = toggler('saved', async () => { throw new Error('Write rejected'); });
  failed.hook.mutate('p1'); await Promise.all(failed.tasks);
  assert.equal(failed.post().saved, false);
  assert.deepEqual(failed.errors, ['Write rejected']);
});

test('all academic child routes render their own Outlet rather than the profile/feed', () => {
  for (const child of ['desafios', 'chat', 'buscar', 'salvos', 'notificacoes', 'editar-perfil', 'criar']) {
    const route = load('routes/_clientarea.cliente.rede-academica.tsx', {
      '@tanstack/react-router': {
        createFileRoute: id => options => ({ id, options }),
        useRouterState: ({ select }) => select({ matches: [{ routeId: '/_clientarea/cliente/rede-academica' }, { routeId: `/_clientarea/cliente/rede-academica/${child}` }] }),
        Outlet: () => React.createElement('main', null, child),
      },
      '@/lib/i18n': {}, '@/components/academic-social-v3-feed': {}, '@/components/academic-onboarding-v3': {}, '@/lib/academic-network.functions': {},
    }).Route;
    assert.equal(renderToStaticMarkup(React.createElement(route.options.component)), `<main>${child}</main>`);
  }
});

test('chat retains an explicitly selected conversation', () => {
  const route = load('routes/_clientarea.cliente.rede-academica.chat.tsx', {
    '@tanstack/react-router': { createFileRoute: () => options => ({ options }) },
    '@/lib/academic-dm.functions': {},
  }).Route;
  assert.equal(route.options.validateSearch({ conversation: 'exact-conversation' }).conversation, 'exact-conversation');
});

test('profile Message forwards the returned conversation ID to Chat', async () => {
  const callbacks = [], destinations = [];
  const route = load('routes/_clientarea.cliente.rede-academica.perfil.$username.tsx', {
    '@tanstack/react-router': { createFileRoute: () => options => ({ options, useParams: () => ({ username: 'target-member' }) }), useNavigate: () => destination => destinations.push(destination) },
    '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: () => ({ isLoading: true }), useMutation: options => { callbacks.push(options); return {}; } },
    '@/lib/i18n': { useI18n: () => ({ locale: 'pt' }) },
    '@/lib/academic-social-v2.functions': {}, '@/lib/academic-dm.functions': {},
  }).Route;
  renderToStaticMarkup(React.createElement(route.options.component));
  await callbacks[1].onSuccess({ id: 'conversation-for-target-member' });
  assert.equal(destinations[0].to, '/cliente/rede-academica/chat');
  assert.equal(destinations[0].search.conversation, 'conversation-for-target-member');
});

test('sending a DM requires an accepted connection even for an existing conversation', async () => {
  const db = database({ academic_conversations: [{ id: 'thread', user_one_id: 'test-user', user_two_id: 'other-user' }] });
  const api = load('lib/academic-dm.server.ts', { '@/integrations/supabase/client.server': { supabaseAdmin: db } });
  await assert.rejects(api.sendAcademicMessage('test-user', { conversationId: 'thread', body: 'Test' }), /conexões aceitas/);
  assert.equal((db.rows.academic_messages || []).length, 0);
});

test('Saved paginates past the first fifty entries', async () => {
  const data = seed();
  data.academic_saved_posts = Array.from({ length: 61 }, (_, i) => ({ user_id: 'test-user', post_id: `p-${i}`, created_at: String(i).padStart(3, '0') }));
  data.academic_posts = data.academic_saved_posts.map(x => ({ id: x.post_id, status: 'active', body: x.post_id }));
  const api = load('lib/academic-saved-v2.server.ts', { '@/integrations/supabase/client.server': { supabaseAdmin: database(data) } });
  const first = await api.savedAcademicContent('test-user');
  const second = await api.savedAcademicContent('test-user', first.nextOffset);
  assert.equal(first.posts.length, 50); assert.equal(first.hasMore, true);
  assert.equal(second.posts.length, 11); assert.equal(second.hasMore, false);
  assert.equal(new Set([...first.posts, ...second.posts].map(p => p.id)).size, 61);
});

test('PDF-only and captioned attachments retain their actual media type', async () => {
  for (const body of ['', 'Document caption']) {
    const file = 'test-user/posts/document.pdf', db = database(seed(), { files: { [file]: new Blob(['%PDF-1.4\n'], { type: 'application/pdf' }) } });
    await backend(db).createAcademicPost('test-user', { body, postType: 'photo', anonymous: false, hasAttachment: true, attachment: { path: file, fileName: 'document.pdf' } });
    assert.equal(db.rows.academic_posts[0].status, 'active');
    assert.equal(db.rows.academic_posts[0].body, body);
    assert.equal(db.rows.academic_post_media[0].mime_type, 'application/pdf');
  }
});

test('legacy academic domain redirects do not affect other applications', () => {
  const config = JSON.parse(fs.readFileSync(path.resolve(ROOT, '../vercel.json')));
  const libraryRewrite=config.rewrites.find(rule=>rule.source==='/biblioteca');
  assert.ok(libraryRewrite);
  assert.equal(libraryRewrite.destination, '/cliente/biblioteca');
  const humanRoomRewrite=config.rewrites.find(rule=>rule.source==='/human-room');
  assert.ok(humanRoomRewrite);
  assert.equal(humanRoomRewrite.destination, 'https://human-room.vercel.app/human-room');
  const academicRedirects=config.redirects.filter(rule=>rule.source.includes('rede-academica'));
  assert.equal(academicRedirects.length,2);
  for (const rule of academicRedirects) {
    assert.equal(rule.has[0].value, 'painel.ldrrhestrategia.com');
    assert.ok(rule.destination.startsWith('https://ldracademy.online/'));
  }
});

test('Saved includes editorial posts and paginates their existing saves', async () => {
  const data = seed();
  data.academic_saved_editorial_posts = Array.from({ length: 61 }, (_, i) => ({ user_id: 'test-user', post_id: `e-${i}`, created_at: String(i).padStart(3, '0') }));
  data.academic_editorial_posts = data.academic_saved_editorial_posts.map(x => ({ id: x.post_id, profile_id: 'editor', body: x.post_id, status: 'active' }));
  data.academic_editorial_profiles = [{ id: 'editor', username: 'academic-editor', display_name: 'Editor', active: true }];
  const api = load('lib/academic-saved-v2.server.ts', { '@/integrations/supabase/client.server': { supabaseAdmin: database(data) } });
  const first = await api.savedAcademicContent('test-user'), second = await api.savedAcademicContent('test-user', first.nextOffset);
  assert.equal(first.posts.length, 50); assert.equal(first.hasMore, true);
  assert.equal(second.posts.length, 11); assert.equal(second.hasMore, false);
  assert.equal(first.posts[0].editorial, true);
  assert.equal(first.posts[0].profile.username, 'academic-editor');
});

test('editorial saved feed ignores discovery distribution and following filters', async () => {
  const data = seed();
  data.academic_saved_editorial_posts = [{ user_id: 'test-user', post_id: 'older', created_at: '2026-01-01' }, { user_id: 'test-user', post_id: 'oldest', created_at: '2026-01-02' }];
  data.academic_editorial_profiles = [{ id: 'editor', active: true, display_name: 'Editor', country: 'Brazil' }];
  data.academic_editorial_posts = [{ id: 'new', profile_id: 'editor', status: 'active', published_at: '2026-02-01' }, { id: 'older', profile_id: 'editor', status: 'active', published_at: '2026-01-02' }, { id: 'oldest', profile_id: 'editor', status: 'active', published_at: '2026-01-01' }];
  const api = load('lib/academic-editorial-v3.server.ts', { '@/integrations/supabase/client.server': { supabaseAdmin: database(data) }, '@/lib/access.server': {} });
  const result = await api.editorialSnapshot('test-user', { savedOnly: true, followingOnly: true, country: 'France' });
  assert.deepEqual(Array.from(result.posts, p => p.id), ['older', 'oldest']);
  assert.ok(result.posts.every(p => p.saved));
});

test('editorial toggle reports failed deletion instead of pretending it succeeded', async () => {
  const db = database({ academic_saved_editorial_posts: [{ user_id: 'test-user', post_id: 'e1' }] }, { fail: (_, operation) => operation === 'delete' });
  const api = load('lib/academic-editorial-v3.server.ts', { '@/integrations/supabase/client.server': { supabaseAdmin: db }, '@/lib/access.server': {} });
  await assert.rejects(api.toggleEditorialSave('test-user', 'e1'), /atualizar os salvos/);
  assert.equal(db.rows.academic_saved_editorial_posts.length, 1);
});


test('free authenticated feed keeps full pagination without trial or subscription writes', async () => {
  const data=seed();data.academic_access_trials=[];
  data.academic_posts=Array.from({length:25},(_,i)=>({id:`free-${i}`,user_id:'test-user',body:'Post',status:'active',created_at:'2020-01-01',is_pinned:false}));
  const db=database(data),result=await backend(db).getAcademicNetwork('test-user',null);
  assert.equal(result.posts.length,20);assert.equal(result.hasMore,true);
  assert.equal(result.access.premium,true);assert.equal(result.access.subscriptionActive,false);
  assert.equal(db.events.some(e=>e.table==='academic_access_trials'),false);
  assert.equal(db.events.some(e=>e.table==='library_subscriptions'&&e.operation!=='select'),false);
});

test('real and editorial comment mutations reject nonowners, inactive and missing rows',async()=>{
  for(const editorial of [false,true]){
    const table=editorial?'academic_editorial_user_comments':'academic_comments';
    const db=database({[table]:[{id:'own',user_id:'me',status:'active',body:'before'},{id:'other',user_id:'other',status:'active',body:'keep'},{id:'inactive',user_id:'me',status:'hidden',body:'keep'}]});
    const mocks={'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/access.server':{resolveAccess:async()=>({authorized:false})}};
    const service=editorial?load('lib/academic-editorial-v3.server.ts',mocks):backend(db);
    const remove=editorial?id=>service.deleteEditorialUserComment('me',id):id=>load('lib/academic-comment-delete.server.ts',mocks).deleteOwnedAcademicComment('me',id);
    const update=editorial?id=>service.updateEditorialUserComment('me',id,'after'):id=>service.updateAcademicComment('me',{id,body:'after'});
    for(const id of ['other','missing','inactive']){await assert.rejects(update(id));await assert.rejects(remove(id));}
    await update('own');assert.equal(db.rows[table][0].body,'after');
    await remove('own');assert.notEqual(db.rows[table][0].status,'active');
    await assert.rejects(remove('own'));assert.equal(db.rows[table][1].body,'keep');
  }
});

test('comment actions render only for strict own true; replies remain blocked',()=>{
  const {AcademicThreadedComments}=load('components/academic-threaded-comments.tsx');
  for(const own of [true,false,undefined,'true']){
    const html=renderToStaticMarkup(React.createElement(AcademicThreadedComments,{postId:'post',comments:[{id:'c',body:'hello',own,author:{name:'Member'}}],premium:true,comment:{},updateComment:{},delComment:{},t:{edit:'EDIT',remove:'DELETE'},locale:'en'}));
    assert.equal(html.includes('EDIT'),own===true);assert.equal(html.includes('DELETE'),own===true);assert.equal(html.includes('>Reply<'),false);
  }
});

test('threaded backend validates parent and keeps replies on soft delete in isolated mock',async()=>{
  const db=database({academic_posts:[{id:'post',status:'active'}],academic_comments:[{id:'parent',post_id:'post',user_id:'me',status:'active',created_at:'2020-01-01'},{id:'inactive',post_id:'post',status:'deleted',created_at:'2020-01-01'},{id:'foreign',post_id:'another',status:'active',created_at:'2020-01-01'}]});
  const mocks={'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/academic-network.server':{createAcademicComment:async(_user,input)=>({id:'root',...input})}};
  const service=load('lib/academic-discussion-replies.server.ts',mocks);
  for(const parentCommentId of ['missing','inactive','foreign'])await assert.rejects(service.createAcademicThreadedComment('me',{postId:'post',body:'reply',anonymous:false,parentCommentId}));
  await assert.rejects(service.createAcademicThreadedComment('',{postId:'post',body:'reply',anonymous:false,parentCommentId:'parent'}));
  const root=await service.createAcademicThreadedComment('me',{postId:'post',body:'root',anonymous:false});assert.equal(root.id,'root');
  const reply=await service.createAcademicThreadedComment('me',{postId:'post',body:'reply',anonymous:false,parentCommentId:'parent'});assert.equal(reply.parent_comment_id,'parent');assert.notEqual(reply.id,'parent');
  await load('lib/academic-comment-delete.server.ts',mocks).deleteOwnedAcademicComment('me','parent');assert.equal(db.rows.academic_comments.find(x=>x.id===reply.id).status,'active');
});


test('career intelligence guards source failures before atomic recommendation refresh',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/const failed=\[goalsResult,proofsResult,jobsResult,projectsResult,feedbackResult\]/);assert.ok(source.indexOf('const failed=')<source.indexOf('ldr_refresh_career_intelligence_atomic'));});

test('career intelligence marks its generated recommendations for atomic ownership',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/generator:"career_intelligence"/);assert.match(source,/ldr_refresh_career_intelligence_atomic/);});

test('academic opportunities route filters suggested and expired recommendations',()=>{const source=fs.readFileSync(path.resolve(ROOT,'routes/_clientarea.cliente.rede-academica.oportunidades.tsx'),'utf8');assert.match(source,/\.eq\("status","suggested"\)/);assert.match(source,/expires_at\.is\.null,expires_at\.gt/);});

test('LDR NEXT and Copilot filter inactive and expired suggestions',()=>{for(const file of ['routes/carreira.next.tsx','routes/carreira.copilot.tsx']){const source=fs.readFileSync(path.resolve(ROOT,file),'utf8');assert.match(source,/\.eq\("status","suggested"\)/);assert.match(source,/expires_at\.is\.null,expires_at\.gt/);}});

test('academic quick access exposes opportunities without changing fixed mobile nav',()=>{const source=fs.readFileSync(path.resolve(ROOT,'routes/_clientarea.cliente.rede-academica.tsx'),'utf8');assert.match(source,/\/cliente\/rede-academica\/oportunidades/);});


test('career intelligence selects the most recently updated active goal deterministically',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/\.eq\("status","active"\)\.order\("updated_at",\{ascending:false\}\)\.order\("created_at",\{ascending:false\}\)/);});
test('career intelligence counts only verified proof competencies',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/verification_status/);assert.match(source,/===\"verified\"/);assert.match(source,/competências verificadas/);});
test('career intelligence marks its generated copilot actions for atomic ownership',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/rationale:\{generator:"career_intelligence",summary:/);assert.match(source,/p_actions:rpcActions/);});


test('career intelligence refreshes recommendations and copilot actions through one atomic RPC', () => {
  const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');
  assert.match(source,/\.rpc\("ldr_refresh_career_intelligence_atomic"/);
  assert.doesNotMatch(source,/from\("ldr_opportunity_recommendations"\)\.delete\(\)/);
  assert.doesNotMatch(source,/from\("ldr_copilot_actions"\)\.delete\(\)/);
});


test('academic opportunities exposes explicit feedback without automatic action',()=>{const source=fs.readFileSync(path.resolve(ROOT,'routes/_clientarea.cliente.rede-academica.oportunidades.tsx'),'utf8');assert.match(source,/Tenho interesse/);assert.match(source,/Quero mais como esta/);assert.match(source,/Não tenho interesse/);assert.match(source,/ldr_opportunity_feedback_events/);assert.match(source,/status:"dismissed"/);});


test('career intelligence ranking is deterministic and explainable',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/targetCountry/);assert.match(source,/targetWorkMode/);assert.match(source,/targetCompetencies/);assert.match(source,/ranking_score:score/);assert.match(source,/ranking_factors:reasons/);assert.match(source,/localeCompare/);assert.match(source,/competências verificadas relacionadas ao objetivo/);});


test('career intelligence keeps open-job discovery when no active goal exists',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/if\(!goal\)\{score=1;reasons\.push\("vaga aberta disponível no ecossistema"\);\}/);assert.match(source,/\.filter\(\(x:any\)=>!goal\|\|x\.score>0\)/);});


test('opportunity feedback snapshots durable context',()=>{const source=fs.readFileSync(path.resolve(ROOT,'routes/_clientarea.cliente.rede-academica.oportunidades.tsx'),'utf8');assert.match(source,/opportunity_title:row\.title\?\?null/);assert.match(source,/rationale_snapshot:row\.rationale\?\?null/);});


test('career ranking uses only bounded explicit opportunity feedback',()=>{const source=fs.readFileSync(path.resolve(ROOT,'lib/career-intelligence.functions.ts'),'utf8');assert.match(source,/\["more_like_this","not_interested"\]/);assert.match(source,/Math\.min\(10,adjustment\+5\)/);assert.match(source,/Math\.max\(-10,adjustment-5\)/);assert.match(source,/feedbackAdjustment\(j\.id\)/);});
