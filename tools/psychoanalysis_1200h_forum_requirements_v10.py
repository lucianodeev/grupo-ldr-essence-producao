from pathlib import Path

v9=Path('tools/psychoanalysis_1200h_forum_requirements_v9.py').read_text(encoding='utf-8')
start=v9.index('# Fix psychoanalysis card label so it remains on one line on mobile.')
end=v9.index('write(p,s)', start)+len('write(p,s)')
replacement='''# Fix psychoanalysis card label so it remains on one line on mobile.\nidx=s.find('activeLibraryCategory==="psychoanalysis"')\nif idx<0: idx=s.find('activeLibraryCategory=="psychoanalysis"')\nif idx<0: raise SystemExit('psychoanalysis category anchor not found')\nlabel_pos=s.find('>Psicanálise<',idx)\nif label_pos<0 or label_pos-idx>1400: raise SystemExit('psychoanalysis label text not found')\nclass_pos=s.rfind('className="',idx,label_pos)\nif class_pos<0: raise SystemExit('psychoanalysis label class not found')\nclass_start=class_pos+len('className="')\nclass_end=s.find('"',class_start)\nif class_end<0: raise SystemExit('psychoanalysis label class end not found')\ns=s[:class_start]+'mt-2 w-full whitespace-nowrap text-center text-[8px] font-black leading-none tracking-tight sm:text-[10px]'+s[class_end:]\nwrite(p,s)'''
v10=v9[:start]+replacement+v9[end:]
exec(compile(v10,'psychoanalysis_1200h_forum_requirements_v10.generated.py','exec'))
