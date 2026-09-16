from pathlib import Path
p=Path('tools/apply_academic_free_access_20260917.py')
s=p.read_text()
needle="s=s.replace('await requirePremium(userId); ','')"
replacement="s=s.replace('await requirePremium(userId); ','')\ns=s.replace('await requirePremium(userId);','')"
if needle not in s:
    raise SystemExit('free-access runner anchor missing')
p.write_text(s.replace(needle,replacement))
print('Free-access runner normalized for inline and multiline premium gates.')
