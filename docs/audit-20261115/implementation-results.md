# Biblioteca LDR — implementação e pendências reais

Atualização: 15/11/2026. Branch: `audit/biblioteca-redesign-20261115`. PR #302. Esta continuação partiu de `1a5813ce79d40afb570b9938f17642c5f3f1516e` e conserva os commits anteriores.

## Resultado disponível na branch

O catálogo gratuito Academy tem agora **59 módulos com textos próprios em oito sequências**. Isto conclui a substituição dos três parágrafos genéricos nessa fonte, mas não equivale à aprovação pedagógica integral, validação de carga horária ou habilitação profissional.

| Sequência | Módulos escritos | Estado real |
| --- | --- | --- |
| Orientação do Trabalho Científico | 12 | Texto, casos fictícios, exercícios e respostas comentadas; revisão e carga histórica de 120h por validar |
| Inglês introdutório | 5 | Sequência escrita; escuta, pronúncia, interação e A1 global não certificados |
| Espanhol introdutório | 5 | Conteúdo específico e exercícios próprios; capacidades orais e carga por validar |
| Português para Falantes de Outras Línguas | 5 | Apoio em inglês; exemplos e tarefas em português; capacidades orais e carga por validar |
| Neerlandês introdutório | 5 | Conteúdo específico e exercícios próprios; capacidades orais e carga por validar |
| Alemão introdutório | 5 | Conteúdo específico e exercícios próprios; capacidades orais e carga por validar |
| Modelos de Documentos Psicanalíticos | 10 | Oficinas e modelos didáticos; não são contratos, diagnósticos ou documentos profissionais validados |
| Freud — fundamentos históricos e conceptuais | 12 | Fontes primárias, distinções teóricas, análise crítica e projeto escrito; não é habilitação clínica nem comprovação atual de eficácia |

Cada módulo contém objetivos, desenvolvimento próprio, caso explicitamente fictício, atividade e autoavaliação comentada. O teste de extensão é apenas uma triagem estrutural, não um selo de qualidade intelectual. As cargas históricas continuam identificadas como por validar. Nenhum certificado novo é emitido por estas sequências em revisão.

No curso Freud, os textos distinguem história da disciplina, inconsciente/recalque, resistência, transferência, associação livre, interpretação, primeira e segunda tópicas, terminologia sobre desenvolvimento, sintomas, sonhos e enquadramento. Explicações da teoria histórica, exemplos inventados e avaliação crítica ficam identificados. Foram consultadas passagens de fontes primárias em arquivos como York University, UCSB, Gutenberg e Lutecium; a bibliografia indica edição, tradução e alcance de consulta. Não se declara leitura integral de todas as obras nem se copiam as traduções para a plataforma.

## Revisão editorial dos eBooks

A matriz conserva a auditoria das **17 obras, em 23 versões linguísticas**. Os 19 produtos anteriormente relatados não foram confirmados na tabela: não foram inventadas duas obras para completar a contagem.

Foi iniciada uma **versão candidata 2 de “Como Mudar o Comportamento Humano”**, separada do original:

- Três capítulos desenvolvidos de 20 previstos, com explicação, casos, atividades e critérios: comportamento observável; condições e aprendizagem; formação de hábitos.
- Referências verificáveis de Michie e colegas, Lally e colegas e Harkin e colegas, com alcance de consulta explícito. Não se convertem médias de estudos em garantias individuais ou prazos universais.
- A versão 1 continua ativa no Supabase. A verificação SELECT desta continuação confirmou `version=1`, `active=true` e atualização em 14/09/2026. Nenhum conteúdo foi regravado.
- A candidata contém identificação do produto, versão base e checksum canónico do conteúdo analisado. Não contém cópia integral da obra antiga.
- `published=false`, `status=draft`, três de 20 capítulos; o validador offline indica `activationEligible=false`. Alterar apenas o estado e os campos de revisão não torna uma edição parcial elegível.
- O rascunho não é importado pelo leitor, não cria um produto e não muda acesso, compra, preço ou progresso.

A revisão intelectual completa das 17 obras permanece pendente. A auditoria encontrou obras de 20 capítulos com cerca de 583–747 palavras no total e dois eBooks de seis páginas com 325 e 416 palavras. Também encontrou sinais de semelhança concentrados em duas obras: 11.710 pares pelo critério de triagem, não 11.710 erros editoriais independentes comprovados. Os textos originais, incluindo a autobiografia, não foram substituídos ou completados com acontecimentos inventados.

## Correções técnicas

- Painel em azul-marinho, branco e dourado, com continuar, cursos, formações, eBooks, catálogo, gratuitos, progresso/certificados e LDR ONE.
- Pesquisa sem acentos, filtro por formato, estados vazios e erro. Interface em quatro idiomas; textos pedagógicos novos em português, com apoios e exemplos linguísticos identificados.
- Acesso confirmado, gratuito, oferta e acesso por verificar têm rótulos distintos. O estado editorial não é confundido com o direito adquirido. Serviços anteriores continuam numa área secundária recolhida.
- Navegar deixa de concluir automaticamente. Nas sequências gratuitas, registar estudo exige texto disponível e revisão da atividade; uma autoavaliação não equivale a certificação.
- Roteiros profissionais, de assinatura e RH sem desenvolvimento próprio continuam em revisão, sem novas conclusões pela interface; identificadores, compras e conclusões anteriores não são apagados.
- O leitor verifica LDR ONE com a função existente da biblioteca para os produtos já incluídos, preservando compras pagas e aliases. Os dois eBooks especiais não foram acrescentados silenciosamente à assinatura.
- Formatos comprimidos e históricos são validados; estruturas vazias falham de forma controlada. As 23 versões analisadas possuem estrutura reconhecível. Corrigir quebras de linha na apresentação não regrava o conteúdo armazenado.
- A posição no leitor é guardada por ação explícita. O índice é reiniciado ao mudar idioma ou produto.
- **Progresso no servidor:** o `upsert` que podia reduzir um percentual foi substituído por `UPDATE` condicionado a `progress_percent <= valor recebido`. Na primeira gravação, o índice único cliente/produto resolve concorrência de inserção, com nova atualização condicionada após conflito `23505`. Valores não finitos são rejeitados e falhas de escrita são devolvidas ao cliente. Não se introduziu migração, função privilegiada ou alteração de RLS. A semântica foi testada com dados sintéticos; falta um teste com duas sessões reais num ambiente isolado.

## Falha de regressão resolvida

A falha anterior de `invoice.paid` vinha de uma expectativa textual que exigia um formato específico da condição e proibia suporte já existente no ramo empresarial. O webhook não foi alterado nesta continuação. A verificação foi substituída por testes que extraem e executam os próprios ramos de encaminhamento do ficheiro, com handlers simulados:

- LDR ONE recebe apenas o seu handler;
- metadados ausentes são resolvidos antes de encaminhar;
- o suporte empresarial existente permanece isolado;
- outros produtos mantêm os seus contratos atuais de eventos.

A versão atual do teste estrutural da `main` foi preservada. Os três novos testes de execução ficam separados em `library-stripe-routing.test.cjs`, evitando sobrepor as correções concorrentes do mesmo ficheiro. Não houve integração da `main` ou merge do PR.

Isto valida o encaminhamento sintético, não uma cobrança ou renovação financeira real. Nenhuma chave Stripe ou pagamento real foi usado nos testes.

## Validação

| Verificação | Resultado |
| --- | --- |
| TypeScript | Passou, sem erros |
| Build | Passou, sem deploy |
| Suíte de regressão | 207/207 passaram |
| Suíte unitária existente | 59/59 passaram |
| Testes específicos `library-*.test.cjs` | 31/31 passaram |
| Validação da edição candidata | Quatro testes passaram; candidata parcial continua inelegível |
| Encaminhamento Stripe | Sete testes de encaminhamento e contrato passaram; handlers e dados simulados |
| Progresso monotónico | Oito cenários sintéticos passaram, incluindo atualizações e primeiras gravações concorrentes, isolamento de cliente e falhas |
| Estrutura de eBooks | 23/23 versões normalizadas sem erro estrutural; não é aprovação editorial |
| Renderização do painel | Verificada em PT/EN/FR/ES com dados sintéticos |
| Supabase nesta continuação | Apenas SELECT: metadados da obra, não nulidade e índice único de `library_progress` |
| RLS | Snapshot anterior: ativa nas oito tabelas inspecionadas; nenhuma política foi alterada |
| Inspeção visual e fluxo autenticado | Pendente: o Chromium local estava bloqueado por restrição de sockets e o navegador partilhado não alcançou a prévia local; não foi contornado esse limite |

A suíte de regressão inclui vários dos testes específicos; estas quantidades não devem ser somadas como testes independentes. Os avisos existentes de descontinuação de `inputValidator` continuam no build.

## Pendências que continuam abertas

1. Revisão pedagógica especializada dos 59 módulos, testes com alunos, materiais complementares e dimensionamento de carga real; completar áudio e avaliação oral nos idiomas.
2. Desenvolver as aulas próprias dos 50 roteiros de assinatura, de RH e de cada formação profissional. A contagem de títulos ou texto gerado não comprova 600/1200 horas.
3. Concluir os 17 capítulos restantes da candidata editorial iniciada e revisar as outras 16 obras, com verificação intelectual, bibliográfica e de direitos, sem substituir versões antigas automaticamente.
4. Testar a prévia com sessões sintéticas reais: comprador, assinante ativo/inativo e aluno sem compra. Verificar acessibilidade interativa, visual e overflow em dispositivos móveis.
5. Validar anexos externos, emissão e consulta de certificados e concorrência entre dispositivos num ambiente de testes. Os mocks e a presença de RLS não substituem essa etapa.
6. Manter a promoção a produção bloqueada até as validações e a autorização explícita do utilizador. Esta entrega não fez merge, deploy, alteração de assinatura, criação de serviço pago ou escrita em produção.

## Reprodução

- `node tools/audit-library-content.cjs <export-digital-content.json> <export-programas.json> docs/audit-20261115`
- `node tools/validate-editorial-drafts.cjs`
- `node --test apps/painel-ldr/tests/library-*.test.cjs apps/painel-ldr/tests/editorial-drafts.test.cjs`
- `npm --prefix apps/painel-ldr run test:regressions`
- `npm --prefix apps/painel-ldr test`
- `npm --prefix apps/painel-ldr run typecheck`
- `npm --prefix apps/painel-ldr run build`

Os exports completos dos textos pagos são entradas locais de análise e não devem ser versionados num repositório público. A matriz emite metadados, contagens e localizações de semelhança. A edição candidata contém redação original nova e está separada das obras protegidas em produção.
