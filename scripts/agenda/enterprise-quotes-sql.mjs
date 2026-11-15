// Disposable database only. Never accepts a remote database host.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {bootstrap} from './schema-bootstrap.mjs';
const require = createRequire(process.env.ENTERPRISE_SQL_PACKAGE || import.meta.url);
let db, query, close;
if (process.env.ENTERPRISE_SQL_DRIVER === 'pglite') {
  const {PGlite} = require('@electric-sql/pglite'); db = new PGlite();
  query = async (sql,args) => args ? db.query(sql,args) : (await db.exec(sql)).at(-1) ?? {rows:[]};
  close = () => db.close();
} else {
  if (!['127.0.0.1','localhost'].includes(process.env.PGHOST)) throw Error('Only isolated loopback PostgreSQL allowed');
  const {Client} = require('pg'); db = new Client(); await db.connect();
  query = (sql,args) => db.query(sql,args); close = () => db.end();
}
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let passes = 0; const pass = text => { passes++; console.log('PASS '+text); };
try {
  await query(bootstrap());
  await query(fs.readFileSync(new URL('../../apps/painel-ldr/supabase/migrations/20261111200311_agenda_calendar_credit_integration.sql',import.meta.url),'utf8'));
  await query(fs.readFileSync(new URL('../../apps/painel-ldr/supabase/migrations/20261115083845_enterprise_quote_financial_guard.sql',import.meta.url),'utf8'));
  pass('captured production schema + calendar migration + financial guard apply in isolated PostgreSQL');
  await query('SET ROLE service_role');
  assert.equal((await query('SELECT ldr_enterprise_quote_checkout_ready() AS ready')).rows[0].ready,true);
  await query('RESET ROLE');pass('readiness probe confirms active financial trigger');
  await query(`INSERT INTO customers(id,full_name) VALUES ('${id(2)}','Synthetic owner'),('${id(3)}','Synthetic other');
    INSERT INTO service_catalog(catalog_key,name,billing_model,package_sessions,amount_cents) VALUES ('quote-session','Synthetic session package','package_sessions',4,10000);`);
  const meta = {checkout_kind:'enterprise_quote',quote_state:'draft',contact_id:id(5),sessions:4,quote_valid_until:1900000000};
  await query("INSERT INTO orders(id,order_number,title,amount_cents,currency,catalog_key,metadata) VALUES ($1,'QUOTE-1','Synthetic quote',12345,'EUR','quote-session',$2)",[id(1),JSON.stringify(meta)]);
  assert.equal((await query('SELECT count(*)::int AS n FROM session_credits WHERE order_id=$1',[id(1)])).rows[0].n,0);
  await assert.rejects(()=>query("UPDATE orders SET payment_status='pago' WHERE id=$1",[id(1)]),/unaccepted quote cannot be paid/);
  pass('free draft has no credits and cannot be marked paid before acceptance');
  // Widen the fixture role deliberately: prove trigger enforcement independently of RLS.
  // This role change is confined to this disposable database.
  await query('ALTER ROLE authenticated BYPASSRLS; GRANT SELECT,UPDATE,INSERT,DELETE ON orders TO authenticated; SET ROLE authenticated');
  await assert.rejects(()=>query("UPDATE orders SET amount_cents=1 WHERE id=$1",[id(1)]),/server authorization/);
  await assert.rejects(()=>query("UPDATE orders SET metadata=jsonb_set(metadata,'{quote_state}','\"approved\"') WHERE id=$1",[id(1)]),/server authorization/);
  await assert.rejects(()=>query('DELETE FROM orders WHERE id=$1',[id(1)]),/history must be retained/);
  await assert.rejects(()=>query("INSERT INTO orders(order_number,title,metadata) VALUES ('FORGED','Forged',$1)",[JSON.stringify(meta)]),/server authorization/);
  await query('RESET ROLE; ALTER ROLE authenticated NOBYPASSRLS');
  pass('even an otherwise row-authorized browser role cannot forge price, approval, insertion or delete history');
  await query("UPDATE orders SET metadata=jsonb_set(metadata,'{quote_state}','\"approved\"') WHERE id=$1",[id(1)]);
  for (const change of ["amount_cents=1","currency='BRL'","description='changed'","metadata=jsonb_set(metadata,'{sessions}','99')"]) {
    await assert.rejects(()=>query(`UPDATE orders SET ${change} WHERE id=$1`,[id(1)]),/immutable/);
  }
  await assert.rejects(()=>query("UPDATE orders SET metadata=jsonb_set(metadata,'{quote_state}','\"draft\"') WHERE id=$1",[id(1)]),/invalid quote transition/);
  pass('approved amount, currency, scope, sessions and forward-only state are immutable even to privileged writers');
  const accepted = {...meta,quote_state:'accepted',user_id:id(7),customer_id:id(2),accepted_by:id(7),accepted_at:'2026-11-15',checkout_expires_at:1900000000};
  await query('UPDATE orders SET metadata=$1,customer_id=$2,stripe_checkout_session_id=\'cs_test_synthetic\' WHERE id=$3',[JSON.stringify(accepted),id(2),id(1)]);
  await assert.rejects(()=>query('UPDATE orders SET customer_id=$1 WHERE id=$2',[id(3),id(1)]),/identity is immutable/);
  await query('SET ROLE service_role');
  const before = (await query("SELECT client_request_appointment($1,$2,now()+interval '2 days',50,'synthetic',NULL,'Test') AS result",[id(2),id(1)])).rows[0].result;
  assert.equal(before.ok,false);await query('RESET ROLE');
  pass('accepted but unpaid proposal cannot request an appointment; accepted identity cannot be reassigned');
  await query("UPDATE orders SET payment_status='pago' WHERE id=$1",[id(1)]);
  await query("UPDATE orders SET payment_status='pago' WHERE id=$1",[id(1)]);
  const credits = (await query('SELECT granted FROM session_credits WHERE order_id=$1',[id(1)])).rows;
  assert.equal(credits.length,1);assert.equal(credits[0].granted,4);
  pass('confirmed synthetic payment issues exactly four credits once through the existing trigger');
  await query('SET ROLE service_role');
  const scheduled = (await query("SELECT client_request_appointment($1,$2,now()+interval '2 days',50,'synthetic',NULL,'Test') AS result",[id(2),id(1)])).rows[0].result;
  assert.equal(scheduled.ok,true);
  const wrong = (await query("SELECT client_reschedule_appointment($1,$2,now()+interval '3 days','',NULL,'Test') AS result",[id(3),scheduled.appointment_id])).rows[0].result;
  assert.equal(wrong.ok,false);
  const moved = (await query("SELECT client_reschedule_appointment($1,$2,now()+interval '3 days','',NULL,'Test') AS result",[id(2),scheduled.appointment_id])).rows[0].result;
  assert.equal(moved.ok,true);await query('RESET ROLE');
  pass('paid proposal can request and reschedule an owned appointment; another customer cannot');
  await query("UPDATE orders SET payment_status='reembolsado',status='cancelado' WHERE id=$1",[id(1)]);
  await query('SET ROLE service_role');
  const refunded = (await query("SELECT client_request_appointment($1,$2,now()+interval '4 days',50,'synthetic',NULL,'Test') AS result",[id(2),id(1)])).rows[0].result;
  assert.equal(refunded.ok,false);await query('RESET ROLE');
  pass('refunded proposal cannot make another booking');
  await query("INSERT INTO orders(id,order_number,title,customer_id,amount_cents,currency,metadata,stripe_checkout_session_id) VALUES ($1,'QUOTE-PROJECT','Synthetic delivery',$2,5000,'EUR',$3,'cs_test_project')",[id(8),id(2),JSON.stringify({...accepted,sessions:0})]);
  await query("UPDATE orders SET payment_status='pago' WHERE id=$1",[id(8)]);
  assert.equal((await query('SELECT count(*)::int AS n FROM session_credits WHERE order_id=$1',[id(8)])).rows[0].n,0);
  pass('paid project without sessions grants no calendar credits');
  await query('SET ROLE authenticated');
  await assert.rejects(()=>query('SELECT ldr_enterprise_quote_checkout_ready()'),/permission denied/);
  assert.equal((await query('SELECT * FROM orders')).rows.length,0);
  await query('RESET ROLE');pass('client Data API role cannot read private orders or call the internal readiness function');
  console.log(`PASS ${passes} isolated PostgreSQL financial/agenda checks; no production data or network`);
} finally { await close(); }
