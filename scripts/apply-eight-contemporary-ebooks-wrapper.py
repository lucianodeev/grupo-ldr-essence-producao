from pathlib import Path
import runpy

ROOT=Path(__file__).resolve().parents[1]
reader=ROOT/'apps/painel-ldr/src/components/digital-reader-v2.tsx'
s=reader.read_text()
compact='"ebook_coragem_comecar"|"livro_menino_mamao"|"ebook_pratica_clinica_psicanalise"|"ebook_psicanalise_no_mundo"|"ebook_estudos_caso_psicanalise"|"ebook_psicanalise_autismo"'
spaced='"ebook_coragem_comecar" | "livro_menino_mamao" | "ebook_pratica_clinica_psicanalise" | "ebook_psicanalise_no_mundo" | "ebook_estudos_caso_psicanalise" | "ebook_psicanalise_autismo"'
if compact in s:
    reader.write_text(s.replace(compact,spaced,1))
runpy.run_path(str(ROOT/'scripts/apply-eight-contemporary-ebooks.py'),run_name='__main__')
