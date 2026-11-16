# Biblioteca LDR — implementação e pendências reais

Atualização: 16/11/2026. Branch: `audit/biblioteca-redesign-20261115`. PR #302. Esta continuação partiu de `1a5813ce79d40afb570b9938f17642c5f3f1516e` e conserva os commits anteriores.

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

## Curso de assinatura: preparação para entrevistas

Os **quinze módulos previstos têm agora desenvolvimento próprio** em `editorial/courses/interview-preparation.pt.json`. Foram acrescentados os onze módulos pendentes. O conjunto contém **8.376 palavras de desenvolvimento**, além de objetivos, quinze casos sintéticos, quinze atividades distintas, perguntas e respostas comentadas, rubricas e bibliografia. Não é aprovação pedagógica ou comprovação das 80 horas históricas.

Os novos módulos tratam pesquisa da organização; apresentação da trajetória; erros e conflitos; intervalos e transições; amostras de trabalho; modalidades remotas; participação e privacidade; perguntas ao empregador; condições de proposta; simulação integrada; e balanço transferível. Cada um exige uma entrega específica. A amostra de trabalho tem quatro registos e solução verificável. O módulo 14 inclui anúncio, dois perfis fictícios, cinco enunciados, alteração de cenário, papéis, tempos, ficha de observação e debrief; não obriga a gravação ou exposição de dados pessoais.

As fontes primárias consultadas incluem OPM, National Careers Service, EURES e GOV.UK, com alcance e contexto identificados. A página Civil Service que devolveu 403 não foi incluída como fonte consultada. Não se atribui eficácia científica às rubricas pedagógicas nem se universalizam regras jurídicas britânicas. Os exemplos e dados são inventados e assinalados como tal.

A triagem de repetição comparou **105 parágrafos em 5.460 pares**: nenhum parágrafo idêntico e nenhum par próximo pelo limiar Jaccard de seis palavras ≥0,40. Exercícios, casos, perguntas e respostas também são distintos. Isto deteta cópia textual e edições superficiais; não substitui a revisão conceptual humana. Os conceitos que reaparecem passam de delimitação do relato para aplicação a dados, condições, decisões e avaliação integrada.

A edição permanece `draft`, `published=false`, `validatedHours=null`, sem importação pelo leitor. As estimativas de prática somam **1.485 minutos (24h45)**, ainda sem pilotagem e sem contabilização validada de leitura e trabalho. Não se converte essa estimativa nas 80 horas anunciadas. O validador conserva bloqueio de elegibilidade até revisão científica/contextual, editorial, direitos, leitor e carga. Nove testes verificam conteúdo, repetição por edição ligeira, limites da revisão e pacote integrado.

## Dois cursos adicionais de assinatura

Foram redigidas duas sequências próprias, sem substituir o catálogo ativo nem o roteiro histórico:

| Curso | Oficinas desenvolvidas | Desenvolvimento | Prática estimada, sem pilotagem |
| --- | --- | --- | --- |
| Redação Profissional e Escrita para Processos Seletivos | 8 | 4.372 palavras, além de casos e avaliações | 945 minutos; não comprova 100 horas |
| Como Selecionar a Vaga Certa para o Seu Perfil | 6 | 2.854 palavras, além de casos e avaliações | 705 minutos; não comprova 80 horas |

Redação trabalha briefing, parágrafos, mensagens operacionais, carta específica, revisão de sentido e língua, síntese, prova escrita e portefólio com teste de leitura. Inclui enunciados e dados para realizar as atividades, com respostas comentadas. Fontes: Comissão Europeia, Europass, National Archives e Serviço das Publicações da UE, com âmbito de consulta identificado.

Seleção de vagas trabalha tarefas e requisitos, evidências e aprendizagem, condições de viabilidade, origem de oportunidades, matriz de decisão e lista curta. Inclui cálculos sintéticos de deslocação e de pesos, com soluções, sem apresentar matrizes como testes psicométricos. Fontes: National Careers Service e EURES. Não foram contactados recrutadores, enviadas candidaturas ou efetuados pagamentos.

Os oito e seis módulos substituem editorialmente o molde conceptual anterior, mas **não há migração ativa** dos quinze títulos históricos. A correspondência de módulos e a preservação de posições precisam de ser decididas antes de integrar uma nova sequência. Ambas as candidatas estão `draft`, `published=false`, `validatedHours=null`; revisão externa, leitor e carga continuam pendentes.

## Curso de Auxiliar de Escritório e leitura editorial

Foi acrescentada uma candidata com **seis oficinas de Auxiliar de Escritório**, 2.812 palavras de desenvolvimento e 720 minutos de prática estimada sem pilotagem. Trabalha receção e triagem, agenda e recursos, arquivo e versões, conferência de registos, preparação de reposição e passagem de trabalho. Os exercícios têm identificadores, intervalos, valores e respostas definidos. O pacote integrado distingue quatro estados de trabalho e inclui perguntas de recuperação.

As fontes consultadas são o perfil ocupacional National Careers Service e orientações de NARA e The National Archives, com âmbito identificado. Nenhum fornecedor foi contactado, reserva efetuada, documento eliminado ou pagamento iniciado. Os seis módulos são uma proposta editorial distinta dos quinze títulos históricos, sem migração ativa; a carga anunciada de 160 horas continua sem validação.

`docs/editorial-review.html` permite leitura autónoma dos **dez cursos candidatos e do eBook**, com 91 unidades, pesquisa sem acentos, índice, atividades, respostas comentadas, bibliografia e limites. É gerado exclusivamente a partir das candidatas originais; não contém as prévias integrais das obras protegidas, não consulta a base de dados e não grava progresso. O HTML foi analisado por parser, os identificadores são únicos e a sintaxe e normalização da pesquisa foram verificadas. A revisão visual interativa ainda precisa de navegador; a presença de CSS responsivo não é apresentada como teste visual. O CI verifica que o ficheiro corresponde às fontes.

## Seis cursos adicionais: carreira, administração, comunicação e lógica

Foram escritos **36 módulos novos**, em seis candidatas, com **17.886 palavras de desenvolvimento**. Cada módulo inclui objetivos próprios, caso, exercício, resposta comentada e rubrica. As contagens são descritivas, não uma aprovação pedagógica.

| Curso | Módulos | Palavras no desenvolvimento | Prática estimada, sem pilotagem | Carga histórica, não validada |
| --- | --- | --- | --- | --- |
| Currículo Estratégico | 6 | 2.871 | 720min | 80h |
| Orientação de Carreira | 6 | 2.821 | 750min | 120h |
| Assistente Administrativo na Prática | 6 | 2.999 | 780min | 180h |
| Comunicação Profissional para o Mercado de Trabalho | 6 | 3.038 | 735min | 100h |
| Rotinas de Escritório e Organização Administrativa | 6 | 3.048 | 705min | 160h |
| Raciocínio Lógico para Estudos, Concursos e Seleções | 6 | 3.109 | 780min | 120h |

Currículo trata inventário factual, contribuição sem inflação de métricas, cronologia, competências, versões destinadas e conferência final. Orientação investiga direção e aprendizagem: pergunta, experiência, ocupações, exploração limitada, condições e mapa revisável. Não repete técnicas de candidatura nem apresenta instrumentos como testes vocacionais.

Assistente trabalha estados do processo, conciliação de quatro documentos, exceções, filas, indicadores e melhoria. Rotinas trabalha consolidação de canais, cadência, listas de verificação, recorrência, continuidade e simplificação. O Auxiliar já escrito concentra procedimentos de execução; os três percursos têm objetos e exercícios distintos. Incluem divergências numéricas, estados condicionados e limites de autoridade, sem simular autorizações ou alterar permissões.

Comunicação trabalha interação entre colegas: finalidade, escuta, retorno, desacordo, passagem de informação e reparação. Há alternativas acessíveis às encenações, sem exigir exposição de conflitos pessoais ou interpretar linguagem corporal como diagnóstico. A confirmação de entendimento da AHRQ é identificada como analogia proveniente da saúde, sem importar protocolo clínico ou afirmar eficácia universal.

Lógica desenvolve proposições e quantificadores, conectores, condicionais, validade, conjuntos e problema integrado. Os exercícios distinguem contraexemplo, conclusão necessária e informação insuficiente. Os cálculos dos dois conjuntos e as quatro formas de inferência foram revistos no próprio enunciado; a revisão matemática independente continua necessária. O percurso não afirma cobrir todos os editais nem garantir aprovação em seleção.

Fontes oficiais consultadas: Europass, Conselho da UE, OCDE, National Careers Service, GAO, The National Archives, Acas, AHRQ e OpenStax. Cada candidata declara o alcance real de consulta. Normas estrangeiras não se apresentam como regras locais. Exemplos, personagens e dados LDR são fictícios e originais.

O catálogo original de 50 cursos não foi alterado. **Dez têm agora uma sequência textual candidata, com 71 módulos; faltam desenvolver 40.** Desses dez, quatro já existiam no início deste lote e seis foram acrescentados. Todos permanecem `draft`, `published=false`, `validatedHours=null`, com revisões obrigatórias por realizar. Não se converteram minutos estimados em cargas anunciadas nem se integrou a mudança de sequência no progresso dos alunos.

## Revisão editorial dos eBooks

A matriz conserva a auditoria das **17 obras, em 23 versões linguísticas**. Os 19 produtos anteriormente relatados não foram confirmados na tabela.

A **candidata v2 de “Como Mudar o Comportamento Humano” tem agora vinte capítulos desenvolvidos**, com 9.539 palavras de explicação, além de objetivos, casos sintéticos, atividades distintas e avaliações comentadas. Foram acrescentados os dezassete capítulos pendentes. A sequência aprofunda metas, planeamento situacional, ambiente, registos, consequências, motivação, autoeficácia, experiência emocional, coordenação, prioridades, meios digitais, interrupções, ética, processos, aprendizagem, caso integrado e leitura crítica da evidência.

As referências incluem os artigos de Michie, Lally, Harkin, Gollwitzer, Ryan/Deci, Bandura e Roediger/Karpicke, além de definições do manual OpenStax. O alcance de consulta está declarado: não se afirma leitura integral quando apenas resumo ou passagens foram consultados. O DOI de Gollwitzer bloqueou a abertura direta; o resumo indexado foi consultado. O PDF universitário de Roediger devolveu timeout; foi consultado o resumo da editora. O capítulo metodológico inicial identifica explicitamente a análise original, em vez de acrescentar uma referência decorativa.

A versão 1 original permanece preservada. A consulta de metadados de 16/11/2026 confirmou as versões portuguesas ativas 1, 3 e 2 das três obras em revisão, com os mesmos timestamps do material analisado. Esta etapa não escreveu no Supabase, não substituiu a obra, não alterou compras ou progresso e não importa a candidata pelo leitor. `status=draft`, `published=false`, todas as revisões exigidas continuam falsas. O conteúdo textual está completo para revisão; isso não é aprovação científica, terapêutica, editorial ou de direitos. Sete testes verificam estrutura, versões, casos, referências e limites de elegibilidade.

A revisão das **outras dezasseis obras** continua pendente, incluindo validação específica de alegações em temas clínicos e preservação dos factos das obras autobiográficas. As obras originais não foram completadas com acontecimentos inventados.

## Repetição entre produtos

A triagem conjunta das onze candidatas (dez cursos e um eBook) examinou **91 unidades, 569 parágrafos e 161.596 pares**: zero cópias exatas e zero pares próximos pelo limiar Jaccard de seis palavras ≥0,40. Os testes incluem uma cópia introduzida entre produtos para confirmar a deteção. Não se lê nem reemite a obra protegida original neste verificador; apenas as novas candidatas são comparadas. Isto não substitui revisão semântica ou pedagógica externa.

## Revisão conservadora de duas obras existentes

Foram preparados manifests de revisão e prévias locais apenas para as edições portuguesas, sem reescrever os textos ativos:

| Obra | Base / proposta | Grupos selecionados | Cópias removidas na prévia | Palavras antes / depois | Unidades preservadas |
| --- | --- | --- | --- | --- | --- |
| Estudos de Caso | 3 / 4 | 41 | 943 | 42.592 / 26.883 | 196 / 196 |
| O Menino que Vendia Mamão | 2 / 3 | 16 | 512 | 18.749 / 10.439 | 40 / 40 |

As seleções incidem em enquadramentos metodológicos e frases editoriais gerais recorrentes. A primeira ocorrência é conservada. O procedimento remove trechos selecionados e não insere novos acontecimentos, falas, datas, interpretações clínicas ou factos biográficos. Isto preserva os factos narrados; não é uma verificação independente da sua verdade. Não surgiram unidades vazias.

Cada manifest exige produto, idioma, versão e checksum do original, além de hashes e posições de cada remoção. Uma divergência aborta a aplicação. O utilitário recusa remover a primeira ocorrência. Os manifests versionados não contêm o texto original; a prévia completa fica fora do repositório e não é importada pelo leitor. A continuidade literária, a validade clínica do que permanece e o mapeamento de posições ainda requerem revisão. Zero grupos repetidos no limiar selecionado de dez unidades não comprova ausência de paráfrases, outras repetições ou problemas editoriais.

Cinco testes sintéticos verificam preservação, primeira ocorrência, fidelidade de trechos e recusa de edição diferente. A reprodução da prévia autobiográfica foi executada com sucesso, sem alterar o export de entrada. `tools/preview-book-revision.cjs` exige um ficheiro novo fora do repositório, com permissões locais restritas; não possui cliente de base de dados ou ação de ativação.

## Progresso concorrente numa base real descartável

Foi acrescentado um job PostgreSQL 16 isolado ao workflow Academy. Exercita o protocolo `UPDATE` condicionado, `INSERT` e nova tentativa após `23505` em ligações reais distintas: primeiras gravações concorrentes em ordens opostas, esperas por bloqueio de linha, pedido antigo e separação de cliente/produto. A suíte existente continua a executar a própria função da aplicação com dependências simuladas.

O novo teste recusa executar antes de abrir qualquer cliente SQL, exceto com opt-in explícito, host localhost, utilizador de teste e base `ldr_library_ci`. Esse bloqueio passou num teste com hostname hospedado. Não usa credenciais Supabase/Stripe, não consulta produção e não faz `DROP`, `DELETE` ou `TRUNCATE`. O PostgreSQL é um serviço efémero do runner existente; não foi criado serviço pago.

O job `progress-postgres` do head `3a7041c` passou no GitHub na execução Academy `43779777352`, assim como o job de conteúdo, TypeScript e build. Os quatro workflows desse head terminaram com sucesso. A execução do novo lote terá resultado próprio no PR. Não é teste ponta a ponta de cookies, PostgREST ou RLS da produção. As permissões e políticas existentes não foram alteradas.

## Correções técnicas

- Painel em azul-marinho, branco e dourado, com continuar, cursos, formações, eBooks, catálogo, gratuitos, progresso/certificados e LDR ONE.
- Pesquisa sem acentos, filtro por formato, estados vazios e erro. Interface em quatro idiomas; textos pedagógicos novos em português, com apoios e exemplos linguísticos identificados.
- Acesso confirmado, gratuito, oferta e acesso por verificar têm rótulos distintos. O estado editorial não é confundido com o direito adquirido. Serviços anteriores continuam numa área secundária recolhida.
- Navegar deixa de concluir automaticamente. Nas sequências gratuitas, registar estudo exige texto disponível e revisão da atividade; uma autoavaliação não equivale a certificação.
- Roteiros profissionais, de assinatura e RH sem desenvolvimento próprio continuam em revisão, sem novas conclusões pela interface; identificadores, compras e conclusões anteriores não são apagados.
- O leitor verifica LDR ONE com a função existente da biblioteca para os produtos já incluídos, preservando compras pagas e aliases. Os dois eBooks especiais não foram acrescentados silenciosamente à assinatura.
- Formatos comprimidos e históricos são validados; estruturas vazias falham de forma controlada. As 23 versões analisadas possuem estrutura reconhecível. Corrigir quebras de linha na apresentação não regrava o conteúdo armazenado.
- A posição no leitor é guardada por ação explícita. O índice é reiniciado ao mudar idioma ou produto.
- **Progresso no servidor:** o `upsert` que podia reduzir um percentual foi substituído por `UPDATE` condicionado a `progress_percent <= valor recebido`. Na primeira gravação, o índice único cliente/produto resolve concorrência de inserção, com nova atualização condicionada após conflito `23505`. Valores não finitos são rejeitados e falhas de escrita são devolvidas ao cliente. Não se introduziu migração, função privilegiada ou alteração de RLS. A semântica foi testada com dados sintéticos; foi preparada uma suíte complementar com ligações PostgreSQL reais num ambiente descartável; o resultado remoto está identificado no PR, sem equivalência a uma sessão de aluno real.

## Falha de regressão resolvida

A falha anterior de `invoice.paid` vinha de uma expectativa textual que exigia um formato específico da condição e proibia suporte já existente no ramo empresarial. O webhook não foi alterado nesta continuação. A verificação foi substituída por testes que extraem e executam os próprios ramos de encaminhamento do ficheiro, com handlers simulados:

- LDR ONE recebe apenas o seu handler;
- metadados ausentes são resolvidos antes de encaminhar;
- o suporte empresarial existente permanece isolado;
- outros produtos mantêm os seus contratos atuais de eventos.

A versão atual do teste estrutural da `main` foi preservada. Os três novos testes de execução ficam separados em `library-stripe-routing.test.cjs`, evitando sobrepor as correções concorrentes do mesmo ficheiro. Não houve integração da `main` ou merge do PR.

Isto valida o encaminhamento sintético, não uma cobrança ou renovação financeira real. Nenhuma chave Stripe ou pagamento real foi usado nos testes.

## Workflow automático corrigido

A execução GitHub Actions `43730866960` falhou antes da instalação, com `Library hero start not found`: o patch posicional de setembro procurava a estrutura antiga da biblioteca. O workflow preserva o nome e o identificador do job para continuidade dos checks, mas agora apenas instala o lockfile da raiz, executa contratos sintéticos da biblioteca, verifica candidatas editoriais, TypeScript e build. Foram retirados os geradores legados e o commit/push automático à `main`; a permissão passou a `contents: read`, sem credenciais persistidas no checkout. Os scripts históricos continuam disponíveis para consulta manual.

Dois testes verificam que esta automação permanece sem escrita de branches ou acesso a secrets e que mantém os comandos de validação. Os outros três workflows do head anterior passaram. Os quatro workflows do commit `2cf028f` passaram no GitHub: Academy (`43731339671`), Enterprise (`43731339634`), LDR ONE (`43731339552`) e AI READY (`43731339544`). O lote de quatro módulos também passou nos quatro workflows do head `d778d42` (Academy `43732157636`, Enterprise `43732157647`, LDR ONE `43732157660`, AI READY `43732157648`). Os quinze módulos e a triagem passaram nos quatro workflows do head `63dbfb5` (Academy `43733554684`, Enterprise `43733554687`, LDR ONE `43733554682`, AI READY `43733554752`). O lote com novas candidatas terá validação remota própria, registada no PR.

## Validação

| Verificação | Resultado |
| --- | --- |
| TypeScript | Passou, sem erros |
| Build | Passou, sem deploy |
| Suíte de regressão | 231/231 passaram |
| Suíte unitária existente | 59/59 passaram |
| Testes específicos `library-*.test.cjs` | 52/52 passaram |
| Validação da edição candidata | Sete testes passaram; candidata com vinte capítulos continua inelegível sem as revisões |
| Encaminhamento Stripe | Sete testes de encaminhamento e contrato passaram; handlers e dados simulados |
| Progresso monotónico | Oito cenários da função com dependências simuladas e suíte PostgreSQL isolada passaram; ligações concorrentes, índice único, bloqueio de linha e separação cliente/produto |
| Estrutura de eBooks | 23/23 versões normalizadas sem erro estrutural; não é aprovação editorial |
| Renderização do painel | Verificada em PT/EN/FR/ES com dados sintéticos |
| Supabase nesta continuação | Apenas SELECT: metadados da obra, não nulidade e índice único de `library_progress` |
| RLS | Snapshot anterior: ativa nas oito tabelas inspecionadas; nenhuma política foi alterada |
| Inspeção visual e fluxo autenticado | Pendente: o Chromium local estava bloqueado por restrição de sockets e o navegador partilhado não alcançou a prévia local; não foi contornado esse limite |

A suíte de regressão inclui vários dos testes específicos; estas quantidades não devem ser somadas como testes independentes. Os avisos existentes de descontinuação de `inputValidator` continuam no build.

## Pendências que continuam abertas

1. Revisão pedagógica especializada dos 59 módulos, testes com alunos, materiais complementares e dimensionamento de carga real; completar áudio e avaliação oral nos idiomas.
2. Realizar revisão externa e pilotagem dos quinze módulos da candidata de entrevistas, incluindo dimensionamento da carga. Desenvolver as aulas próprias dos restantes 40 roteiros de assinatura, de RH e de cada formação profissional. A contagem de títulos ou texto gerado não comprova 600/1200 horas.
3. Rever externamente os vinte capítulos da candidata desenvolvida e revisar as outras 16 obras, com verificação intelectual, bibliográfica e de direitos, sem substituir versões antigas automaticamente.
4. Testar a prévia com sessões sintéticas reais: comprador, assinante ativo/inativo e aluno sem compra. Verificar acessibilidade interativa, visual e overflow em dispositivos móveis.
5. Validar anexos externos, emissão e consulta de certificados e concorrência entre dispositivos num ambiente de testes. O teste PostgreSQL separado não substitui cookies, PostgREST ou uma política de produção com sessões reais de aluno.
6. Manter a promoção a produção bloqueada até as validações e a autorização explícita do utilizador. Esta entrega não fez merge, deploy, alteração de assinatura, criação de serviço pago ou escrita em produção.

## Reprodução

- `node tools/audit-library-content.cjs <export-digital-content.json> <export-programas.json> docs/audit-20261115`
- `node tools/validate-editorial-drafts.cjs`
- `node tools/validate-course-drafts.cjs`
- `node tools/review-editorial-corpus.cjs`
- `node tools/render-editorial-review.cjs`
- `node --test apps/painel-ldr/tests/library-*.test.cjs apps/painel-ldr/tests/editorial-drafts.test.cjs`
- `npm --prefix apps/painel-ldr run test:regressions`
- `npm --prefix apps/painel-ldr test`
- `npm --prefix apps/painel-ldr run typecheck`
- `npm --prefix apps/painel-ldr run build`

Os exports completos dos textos pagos são entradas locais de análise e não devem ser versionados num repositório público. A matriz emite metadados, contagens e localizações de semelhança. A edição candidata contém redação original nova e está separada das obras protegidas em produção.
