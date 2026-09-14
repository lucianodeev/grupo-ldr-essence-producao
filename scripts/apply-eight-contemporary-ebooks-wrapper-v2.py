from pathlib import Path
import runpy

ROOT=Path(__file__).resolve().parents[1]
reader=ROOT/'apps/painel-ldr/src/components/digital-reader-v2.tsx'
s=reader.read_text()
compact='"ebook_coragem_comecar"|"livro_menino_mamao"|"ebook_pratica_clinica_psicanalise"|"ebook_psicanalise_no_mundo"|"ebook_estudos_caso_psicanalise"|"ebook_psicanalise_autismo"'
spaced='"ebook_coragem_comecar" | "livro_menino_mamao" | "ebook_pratica_clinica_psicanalise" | "ebook_psicanalise_no_mundo" | "ebook_estudos_caso_psicanalise" | "ebook_psicanalise_autismo"'
if compact in s:
    s=s.replace(compact,spaced,1)
line=' ebook_psicanalise_autismo:{light:"bg-[#fafaf3] text-[#303114]",dark:"bg-[#20210d] text-[#fafae9]",cardLight:"border-[#d6d7b8] bg-white",cardDark:"border-[#66682c] bg-[#2e3013]",accent:"#6B6F2A",soft:"#ececcf"}'
if '\n'+line in s:
    s=s.replace('\n'+line,'\n '+line,1)
reader.write_text(s)
runpy.run_path(str(ROOT/'scripts/apply-eight-contemporary-ebooks.py'),run_name='__main__')
