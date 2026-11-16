# Revisão clínica e narrativa — limites e correções preparadas

Registo: 16/11/2026. Fontes de conteúdo: export autorizado de 23 versões linguísticas e ficheiros do repositório. Esta etapa não aprova uma obra clínica nem verifica a verdade de acontecimentos autobiográficos.

## Evidências editoriais individualizadas

| Obra / edição portuguesa | Observação comprovada | Ação executada | Pendente |
| --- | --- | --- | --- |
| Estudos de Caso, v3 | 149 grupos de frases com nove ou mais palavras repetidas em pelo menos duas unidades; 41 enquadramentos gerais repetidos em 24 unidades cada | Prévia conservadora remove 943 cópias posteriores desses 41 grupos, mantendo a primeira ocorrência e as 196 unidades | Continuidade, outras repetições, validade de afirmações clínicas, correspondência com fontes primárias e teste do leitor |
| O Menino que Vendia Mamão, v2 | 16 grupos de frases gerais recorrentes em dez ou mais unidades, incluindo comentários genéricos sobre empreendedorismo e referências repetidas a páginas | Prévia conservadora remove 512 cópias; as 40 unidades permanecem e nenhum acontecimento novo é inserido | Leitura do autor, continuidade literária, verdade dos factos narrados e revisão das outras versões linguísticas |
| Psicanálise e Autismo | Os trechos inspecionados distinguem condição neurodesenvolvimental e construção teórica; afastam causalidade parental e não apresentam o vocabulário teórico como diagnóstico médico. Os três grupos exatos encontrados pela triagem de frases incluem referências bibliográficas recorrentes | Preservação dos trechos; referências repetidas não foram classificadas automaticamente como preenchimento a remover | Revisão integral das alegações e das indicações, ligação entre cada afirmação e a fonte correspondente, avaliação por especialista e inclusão de perspetivas de pessoas autistas |
| Psicanálise vs. Psiquiatria | Trechos inspecionados distinguem papéis, recusam alteração de medicamentos pelo leitor e separam interpretação de avaliação médica | Nenhuma correção clínica presumida apenas por palavras-chave | Verificação integral de âmbito profissional, evidência por indicação e legislação aplicável |
| Psicologia, Psicanálise e Terapias Integrativas | Trechos inspecionados reconhecem heterogeneidade de evidência e recusam promessas universais de cura | Limites identificados e preservados | Revisão específica de cada prática e indicação; não tomar um aviso geral como validação de todas as afirmações |

A triagem conta grupos de frases, não erros clínicos. Repetição de uma referência ou de um aviso necessário pode ser legítima. Ausência de uma palavra de alerta não comprova segurança. Não foi atribuída a qualquer modalidade uma eficácia que esta auditoria não demonstrou.

## Fontes oficiais consultadas para delimitar a revisão

- [OMS — Autism](https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders): ficha consultada sobre heterogeneidade, desenvolvimento e apoios. Não foi usada como validação de uma abordagem psicanalítica específica ou de atividades LDR.
- [OMS — CDDR ICD-11](https://www.who.int/publications/i/item/9789240077263/): registo oficial confirma título e publicação em 8 de março de 2024. Confirmar a existência da referência não equivale a conferir todas as afirmações que a citam.
- [NICE CG170 — recomendações](https://www.nice.org.uk/guidance/cg170/chapter/recommendations): secções consultadas sobre apoios e organização de cuidados para menores de 19 anos. O âmbito etário e institucional não foi universalizado. Uma técnica não mencionada não foi declarada proibida apenas pela ausência nessa página.

Estas fontes foram consultadas em 15/11/2026. Não se afirma leitura integral de todas as revisões científicas subjacentes. O relatório é uma auditoria editorial, não um protocolo de diagnóstico ou tratamento.

## Integridade e reprodução

Os manifests em `editorial/revisions/` contêm hashes e posições, não a prosa integral protegida. A prévia verifica a identidade da obra, idioma, versão e checksum antes de remover qualquer trecho selecionado. Recusa uma primeira ocorrência, edição diferente, alteração do trecho ou escrita dentro do repositório.

Exemplo de reprodução, com export e destino locais autorizados:

```sh
node tools/preview-book-revision.cjs /caminho/export-decodificado.json editorial/revisions/livro_menino_mamao.pt.plan.json /caminho/fora-do-repositorio/previa-nova.json
```

O destino tem de ser um ficheiro novo. O comando não envia dados, não acede ao Supabase e não ativa uma edição. Uma prévia mais curta não é automaticamente uma obra concluída; a revisão de continuidade e conteúdo permanece necessária.
