const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('real database suite refuses hosted databases before starting any SQL client',()=>{
 const result=spawnSync(process.execPath,[path.join(__dirname,'library-progress.pgtest.cjs')],{encoding:'utf8',env:{...process.env,LDR_LIBRARY_ISOLATED_DB:'1',PGHOST:'sfrcsrzuoqdscflfuwik.supabase.co',PGDATABASE:'ldr_library_ci',PGUSER:'ldr_library_test',PATH:''}});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/Refusing database tests outside/);
 assert.doesNotMatch(result.stderr,/ENOENT/);
});
