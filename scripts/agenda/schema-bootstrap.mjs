// Metadata-only production snapshot. Never connects to production or copies rows.
import fs from 'node:fs';
export function bootstrap(){
 const s=JSON.parse(fs.readFileSync(new URL('../../docs/audit-20261111/agenda-schema-snapshot.json',import.meta.url)));
 const catalog=JSON.parse(fs.readFileSync(new URL('../../docs/audit-20261111/agenda-catalog-snapshot.json',import.meta.url)));
 s.tables.push(catalog);s.constraints.push(...catalog.constraints);
 const q=x=>'"'+x.replaceAll('"','""')+'"';
 const sql=[`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS; CREATE SCHEMA auth; CREATE SCHEMA private; CREATE SEQUENCE public.order_number_seq;`];
 for(const e of s.enums)sql.push(`CREATE TYPE ${q(e.schema)}.${q(e.name)} AS ENUM (${e.labels.map(x=>"'"+x.replaceAll("'","''")+"'").join(',')});`);
 for(const t of s.tables)sql.push(`CREATE TABLE ${q(t.schema)}.${q(t.name)} (${t.columns.map(c=>`${q(c.name)} ${c.type}${c.generated?' GENERATED ALWAYS AS ('+c.default+') STORED':c.default?' DEFAULT '+c.default:''}${c.notnull?' NOT NULL':''}`).join(',')});`);
 for(const c of s.constraints)sql.push(`ALTER TABLE ${c.table} ADD CONSTRAINT ${q(c.name)} ${c.def};`);
 for(const i of s.indexes)if(!s.constraints.some(c=>i.includes('INDEX '+c.name+' ')))sql.push(i+';');
 // Public helpers precede SQL wrappers in private. Exact captured definitions.
 for(const f of [...s.supportFunctions].sort((a,b)=>(a.schema==='private')-(b.schema==='private')))sql.push(f.def+';');
 for(const f of new Set(s.triggers.map(t=>t.function)))sql.push(f+';');
 for(const t of s.triggers)sql.push(t.def+';');
 for(const t of s.tables){
  if(t.rls)sql.push(`ALTER TABLE ${q(t.schema)}.${q(t.name)} ENABLE ROW LEVEL SECURITY;`);
  // Restore table ACLs for Supabase API roles. Ignore owner/admin-specific entries.
  for(const acl of (t.acl??'').slice(1,-1).split(',')){
   const [role,rest]=acl.split('='); if(!['anon','authenticated','service_role'].includes(role))continue;
   const bits=rest.split('/')[0]; const map={r:'SELECT',a:'INSERT',w:'UPDATE',d:'DELETE',D:'TRUNCATE',x:'REFERENCES',t:'TRIGGER',m:'MAINTAIN'};
   const grants=[...bits].filter(x=>map[x]).map(x=>map[x]);if(grants.length)sql.push(`GRANT ${grants.join(',')} ON ${q(t.schema)}.${q(t.name)} TO ${q(role)};`);
  }
 }
 for(const p of s.policies??[])sql.push(`CREATE POLICY ${q(p.policyname)} ON ${q(p.schemaname)}.${q(p.tablename)} AS ${p.permissive} FOR ${p.cmd} TO ${p.roles.map(q).join(',')}${p.qual?' USING ('+p.qual+')':''}${p.with_check?' WITH CHECK ('+p.with_check+')':''};`);
 sql.push('GRANT USAGE ON SCHEMA public,private,auth TO anon,authenticated,service_role; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;');
 return sql.join('\n');
}
