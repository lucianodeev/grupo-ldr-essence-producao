// Real PostgreSQL concurrency test, disposable CI database only. Not a production migration.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const env = process.env;
if (env.LDR_LIBRARY_ISOLATED_DB !== '1' || !['127.0.0.1','localhost'].includes(env.PGHOST) || env.PGPORT !== '5432' || env.PGDATABASE !== 'ldr_library_ci' || env.PGUSER !== 'ldr_library_test') {
  throw new Error('Refusing database tests outside the explicit disposable localhost library fixture');
}
// Do not allow libpq service/host-address defaults to redirect this localhost-only fixture.
const isolatedEnv={...env,PGHOST:'127.0.0.1',PGPORT:'5432',PGDATABASE:'ldr_library_ci',PGUSER:'ldr_library_test'};
for(const key of ['PGHOSTADDR','PGSERVICE','PGSERVICEFILE','PGPASSFILE','PGOPTIONS'])delete isolatedEnv[key];
const customerA='10000000-0000-0000-0000-000000000001',customerB='10000000-0000-0000-0000-000000000002';
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
async function query(sql) {
  const result=await run('psql',['-X','-q','-A','-t','--host','127.0.0.1','--port','5432','--username','ldr_library_test','--dbname','ldr_library_ci','--set','ON_ERROR_STOP=1','--set','VERBOSITY=sqlstate','-c',sql],{env:isolatedEnv,timeout:20000});
  return result.stdout.trim();
}
// Same update/insert/23505 retry protocol as saveClientProgress. The app path is separately executed by the mock suite.
async function save(customer,product,pct,location) {
  const advance=()=>query(`UPDATE ldr_library_ci.progress SET progress_percent=${pct}, current_location=${quote(location)} WHERE customer_id=${quote(customer)} AND product_key=${quote(product)} AND progress_percent<=${pct} RETURNING id`);
  if(await advance())return;
  try { await query(`INSERT INTO ldr_library_ci.progress(customer_id,product_key,progress_percent,current_location) VALUES (${quote(customer)},${quote(product)},${pct},${quote(location)})`); }
  catch(error) { if(!/23505/.test(error.stderr||''))throw error; await advance(); }
}
async function row(customer,product) {
  const text=await query(`SELECT row_to_json(p) FROM ldr_library_ci.progress p WHERE customer_id=${quote(customer)} AND product_key=${quote(product)}`);
  return text?JSON.parse(text):null;
}
test('real PostgreSQL connections preserve monotonic progress through insert races and row locks',async t=>{
  const identity=JSON.parse(await query("SELECT json_build_object('database',current_database(),'user',current_user,'tables',(SELECT count(*) FROM information_schema.tables WHERE table_schema='ldr_library_ci'))"));
  assert.equal(identity.database,'ldr_library_ci');assert.equal(identity.user,'ldr_library_test');assert.equal(Number(identity.tables),0,'Fixture database must begin without library test tables');
  await query('CREATE SCHEMA ldr_library_ci; CREATE TABLE ldr_library_ci.progress (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,customer_id uuid NOT NULL,product_key text NOT NULL,progress_percent integer NOT NULL CHECK(progress_percent BETWEEN 0 AND 100),current_location text,UNIQUE(customer_id,product_key))');
  await t.test('opposite first-write orders both converge to the maximum',async()=>{
    for(const [index,values] of [[25,90],[90,25]].entries()){
      const product='first_'+index;
      await Promise.all(values.map(value=>save(customerA,product,value,'p'+value)));
      const saved=await row(customerA,product);assert.equal(saved.progress_percent,90);assert.equal(saved.current_location,'p90');
      assert.equal(await query(`SELECT count(*) FROM ldr_library_ci.progress WHERE product_key=${quote(product)}`),'1');
    }
  });
  await t.test('concurrent existing updates respect the database predicate after lock waits',async()=>{
    await save(customerA,'existing',10,'p10');
    await Promise.all([20,50,40,95,30,80].map(value=>save(customerA,'existing',value,'p'+value)));
    const saved=await row(customerA,'existing');assert.equal(saved.progress_percent,95);assert.equal(saved.current_location,'p95');
  });
  await t.test('a stale connection cannot replace a higher percentage or position',async()=>{
    await save(customerA,'stale',85,'chapter_9');
    await save(customerA,'stale',15,'chapter_2');
    const saved=await row(customerA,'stale');assert.equal(saved.progress_percent,85);assert.equal(saved.current_location,'chapter_9');
  });
  await t.test('customer and product predicates keep independent rows unchanged',async()=>{
    await save(customerB,'stale',30,'other_customer');
    await save(customerA,'other_product',40,'other_product');
    await save(customerA,'stale',90,'chapter_10');
    assert.equal((await row(customerB,'stale')).current_location,'other_customer');
    assert.equal((await row(customerA,'other_product')).progress_percent,40);
  });
});
