# Biblioteca LDR — resultados reais da implementação

Data: 15/11/2026. Branch: `audit/biblioteca-redesign-20261115`. PR #302. Base retomada: `2163e7bf6dd450121a65a464efed5a61d66d3397`.

## Entrega e limites

Esta é uma entrega parcial verificável, não a conclusão de toda a biblioteca. Nenhuma formação foi aprovada como integralmente concluída ou apta a sustentar a carga horária anunciada. Não houve merge, deploy, cobrança, alteração de assinatura, migração SQL ou escrita de conteúdos/progresso em produção. As consultas ao projeto `sfrcsrzuoqdscflfuwik` foram SELECT de inventário e políticas, sem ler identidades de alunos.

## Conteúdo original desenvolvido

- **Orientação do Trabalho Científico:** 12 módulos específicos: objeto, pergunta, objetivos, hipóteses, método, pesquisa bibliográfica, leitura crítica, estrutura, citações, referências, ética e projeto final. Cada módulo contém objetivos observáveis, explicação desenvolvida, caso explicitamente fictício, tarefa e autoavaliação comentada. Estimativa editorial de estudo com atividades: 915 minutos (15h15). A carga histórica de 120h não está validada e não foi convertida em certificação.
- **Inglês Básico A1:** cinco módulos com apresentações, verbo be, presente simples, situações de viagem e comunicação profissional; diálogos e exemplos originais, exercícios e respostas comentadas. Estimativa de estudo: 405 minutos (6h45). Não valida as 30h anunciadas nem domínio global de A1; áudio, escuta, pronúncia e interação ainda precisam de desenvolvimento e avaliação.
- **Espanhol, Português para Falantes de Outras Línguas, Neerlandês e Alemão:** mais 20 módulos próprios, com cinco sequências diferenciadas por idioma quando se conta o Inglês. O curso de português oferece explicações de apoio em inglês. Nenhuma sequência certifica pronúncia, escuta, interação oral ou A1 global.
- **Modelos de Documentos Psicanalíticos:** dez módulos próprios, com modelos didáticos efetivos, casos fictícios e exercícios de revisão. Distinguem ficha administrativa, narrativa, enquadramento, agenda, acompanhamento, consentimentos, comunicação, supervisão e estudo de caso. Não são contratos, diagnósticos ou documentos profissionais validados para uso real.
- **Total desta branch: 47 módulos originais em sete sequências**, de 59 módulos no catálogo gratuito Academy. O curso Freud (12 módulos) permanece sem novos textos nesta edição; exige consulta e revisão histórica/conceptual específica. Não foi preenchido por um resumo genérico para aumentar a contagem.
- Referências efetivamente consultadas: páginas de orientação da EQUATOR/PRISMA, ICMJE, UNESCO, Conselho da Europa, British Council, Camões, Taalunie/ANS, Taaladvies/Vlaanderen, EDPB e índice gramatical DW; o índice Cervantes e o seu inventário foram consultados por resultados de pesquisa, com manutenção na página detalhada. O alcance de cada consulta é explícito. O código identifica a página, data de consulta e alcance. Não se declara ter lido todas as obras citadas nessas páginas. Não há resultados científicos ou qualificações inventadas.
- O curso Freud mantém os títulos e registos anteriores, mas deixa de apresentar os três parágrafos repetidos como aulas. Mostra desenvolvimento pendente e não permite novas conclusões de módulos sem conteúdo. Todos os gratuitos deixam de usar o preenchimento genérico.
- Os roteiros de assinatura, a leitura repetida de RH e as aulas geradas pelo modelo profissional ficam identificados como programas em revisão. Novas conclusões pela interface ficam suspensas nesses roteiros; o conteúdo-fonte anterior continua no histórico Git, e compras, matrículas, conclusões e certificados anteriores não foram apagados ou reescritos.

## Auditoria individual

A matriz Markdown e o JSON cobrem **40 programas publicados**, **8 cursos gratuitos Academy**, **50 cursos de assinatura** e **23 versões linguísticas de 17 obras digitais**. Os conjuntos sobrepõem-se em algumas ofertas; não devem ser somados como número de produtos comerciais independentes.

- Supabase: três módulos na tabela principal e zero materiais em `training_materials`. Todas as 40 ofertas foram cruzadas com fontes curriculares locais. Um programa com zero módulos SQL não foi classificado automaticamente como vazio.
- Cursos profissionais: a função atualmente usada é `professional-formations-lessons.ts`, que constrói texto por substituição de título, foco e projeto. A quantidade de aulas geradas não comprova desenvolvimento pedagógico.
- Os 19 produtos digitais do relato anterior não se confirmaram em `digital_product_content`: foram encontradas 17 chaves, sem presumir ou criar duas obras adicionais.
- A estrutura dos 23 registos digitais foi descomprimida e validada. Todos possuem `kind` e estrutura compatível: não se confirmou a suspeita inicial de ausência desse identificador. A normalização adicional é defensiva, não uma alegação de que todos os leitores estavam vazios.
- Há obras de 20 capítulos com cerca de 583–747 palavras no total e dois eBooks de seis páginas com 325 e 416 palavras. A estrutura existente não demonstra a profundidade editorial solicitada.
- Triagem de repetição em eBooks: zero grupos de parágrafos exatamente iguais após normalização; 11.710 pares de trechos semelhantes pelo critério documentado. Os pares concentram-se em duas obras, incluindo versões linguísticas da autobiografia. São sinais para revisão humana, não 11.710 erros independentes comprovados. A matriz preserva contagens agrupadas e amostras de localização, sem divulgar os textos pagos.
- A revisão intelectual, bibliográfica e de direitos de cada uma das 17 obras **não foi concluída**. Nenhum texto original foi substituído por uma reescrita automática, nem foram inventados episódios autobiográficos.

## Implementação técnica e redesign

- Painel principal em azul-marinho, branco e dourado, com continuar a aprender, cursos, formações, eBooks, catálogo, gratuitos, progresso/certificados e ligação LDR ONE.
- Pesquisa que ignora acentos, filtro por formato, estados vazios e erro de carregamento. Os quatro idiomas têm textos de interface; os textos-base novos estão em português e o curso de português para estrangeiros inclui apoio em inglês, com exemplos na respetiva língua-alvo. Traduções pedagógicas completas não foram produzidas.
- Acesso disponível, gratuito, oferta e acesso por confirmar têm rótulos distintos. Uma oferta sem decisão autoritativa não é apresentada como compra do aluno. Os serviços anteriores continuam numa área secundária recolhida.
- “Continuar” usa apenas destinos mapeados; não inventa ligação circular para conteúdo desconhecido.
- Página gratuita: navegar deixa de concluir automaticamente; registar estudo requer aula disponível e revisão da atividade. Erros de gravação são visíveis. O valor lido do servidor funciona como piso para evitar baixar o progresso ao usar um lote revisto. Isto não substitui uma futura operação atómica no servidor para concorrência entre dispositivos.
- Leitor: compras pagas e aliases antigos são preservados; o acesso LDR ONE é verificado com a mesma função usada na biblioteca para os produtos já incluídos. Os dois eBooks especiais não foram acrescentados silenciosamente ao catálogo de assinatura.
- Conteúdo comprimido e formatos históricos são normalizados sem regravar obras. Estruturas vazias falham de forma controlada. Quebras de linha literais são corrigidas na representação, mantendo o registo armazenado intacto.
- Abrir o leitor deixa de gravar progresso automaticamente. A posição passa a ser guardada por ação explícita, respeitando o piso consultado. O índice muda corretamente ao trocar de idioma ou produto. Leitura e autoavaliação não são apresentadas como certificado.

## Validação

| Verificação | Resultado |
| --- | --- |
| TypeScript (`npm --prefix apps/painel-ldr run typecheck`) | Passou, sem erros |
| Build da aplicação (`npm --prefix apps/painel-ldr run build`) | Passou; não publicou |
| Testes específicos desta entrega (`node --test apps/painel-ldr/tests/library-*.test.cjs`) | 19/19 passaram |
| Suíte unitária existente (`npm --prefix apps/painel-ldr test`) | 59/59 passaram |
| Suíte de regressão (`npm --prefix apps/painel-ldr run test:regressions`) | 190/191 passaram; uma falha pré-existente |
| Repetição da falha no ficheiro original de HEAD | Mesma falha reproduzida antes das alterações |
| RLS em oito tabelas sensíveis | Ativada nas oito; snapshot de 11 políticas em seis tabelas; nenhuma política alterada |
| Estrutura das obras descomprimidas | 23/23 versões normalizadas sem erro estrutural |
| Renderização do painel | Verificada em PT/EN/FR/ES com dados sintéticos |
| Navegação/filtros e permissões | Testes de funções puras, renderização HTML e backend simulado; sem compras reais |
| Inspeção visual, overflow móvel e fluxo autenticado | **Pendente**: o Chromium local falhou por restrição de sockets; o navegador partilhado não alcançou a porta da prévia |

A regressão pré-existente é `LDR ONE handles invoice.paid as a confirmed renewal without changing other products`, em `ldr-one-business-min-seats.test.cjs`. É uma asserção textual sobre `api/stripe/webhook.ts`; o ficheiro não foi alterado nesta entrega. A repetição com o ficheiro de HEAD também falhou. Isto não comprova por si só falha operacional de renovações; requer investigação específica. Não foi marcado como teste aprovado.

O build emite avisos existentes de descontinuação de `inputValidator`. Não foi feita uma migração ampla desse mecanismo durante o trabalho editorial.

## Pendências ordenadas

1. Revisão pedagógica humana dos 47 módulos novos, teste com alunos e dimensionamento real de carga; completar materiais e capacidades linguísticas ausentes.
2. Desenvolver os 12 módulos do curso Freud e aprofundar as sete sequências já redigidas, depois a formação RH, os 50 roteiros de assinatura e cada formação profissional com conteúdos próprios. Preservar identificadores ao substituir cada lote.
3. Revisar as 17 obras por capítulo, priorizando as de desenvolvimento muito curto e as com sinais de repetição. Criar versões editoriais separadas, sem alterar direitos dos compradores ou inventar factos sobre o autor.
4. Testar navegação real, leitores e formulários numa prévia acessível ao navegador, com perfis sintéticos de comprador, assinante ativo/inativo e aluno sem compra. Fazer auditoria de acessibilidade interativa e visual em dispositivos móveis.
5. Verificar anexos externos, requisitos e emissão de certificados, sessão entre dispositivos e concorrência de gravação de progresso. A presença de RLS e os mocks não substituem testes de isolamento com sessões reais num ambiente de testes.
6. Investigar separadamente a asserção pré-existente de `invoice.paid`.
7. Só preparar a promoção a produção depois de resolver as validações e receber autorização explícita. Esta entrega não pede nem executa publicação.

## Reprodução da matriz

`node tools/audit-library-content.cjs <export-digital-content.json> <export-programas.json> docs/audit-20261115`

O primeiro ficheiro deve conter `product_key,locale,title,version,active,content`; o segundo, `slug,title,status,db_modules,db_materials`, obtidos por consultas SELECT. Os exports completos dos textos pagos são entradas locais de análise e **não** devem ser versionados num repositório público. A ferramenta gera apenas metadados, contagens e localizações de semelhança.
