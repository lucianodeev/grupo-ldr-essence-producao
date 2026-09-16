from pathlib import Path
p=Path('tools/apply_academic_free_access_20260917.py')
s=p.read_text()
needle="s=s.replace('await requirePremium(userId); ','')"
replacement="s=s.replace('await requirePremium(userId); ','')\ns=s.replace('await requirePremium(userId);','')"
if needle not in s:
    raise SystemExit('free-access runner anchor missing')
s=s.replace(needle,replacement)
write_anchor="server.write_text(s)"
type_patch="s=s.replace('const {data:target}=await db.from(\"academic_profiles\").select(\"user_id\").eq(\"id\",targetProfileId).maybeSingle();', 'const {data:target}:{data:any}=await db.from(\"academic_profiles\").select(\"user_id\").eq(\"id\",targetProfileId).maybeSingle();')\nserver.write_text(s)"
if write_anchor not in s:
    raise SystemExit('server write anchor missing')
s=s.replace(write_anchor,type_patch,1)
p.write_text(s)
print('Free-access runner normalized and build typing patch applied.')
