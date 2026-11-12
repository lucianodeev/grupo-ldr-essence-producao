# Auditoria e evolução do Ecossistema LDR

Data: 11 de novembro de 2026. Branch exclusiva: `feat/central-empresas-ldr`.
PR: https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/273

**Estado: entrega parcial verificável, bloqueada para publicação.** Foram
corrigidos 2.041 erros de compilação entre a base auditada e a árvore validada
(redução de 99,03%). Permanecem 20 erros associados ao contrato de banco de dados.
Não houve merge, solicitação de deploy, alteração de DNS, compra de serviço,
cobrança real, envio comercial externo ou escrita de dados clínicos de teste.

## 1. Contagem real e evidências

A base foi o commit `2988c658bd428752644f7070e2f3d4c6d1434361`, já com os commits
posteriores mencionados no pedido. A contagem confirmada nos logs do workflow
Central Empresas foi **2.061**, não os 2.074 históricos. O diagnóstico local após
a instalação completa das dependências confirmou as reduções subsequentes.

| Código | Base auditada | Resultado final |
| --- | ---: | ---: |
| TS4111 | 1.339 | 0 |
| TS18048 | 265 | 0 |
| TS2322 | 102 | 6 |
| TS2345 | 86 | 4 |
| TS2339 | 81 | 7 |
| TS2769 | 60 | 0 |
| TS2698 | 0 | 1 |
| TS2353 | 4 | 2 |
| Demais códigos | 124 | 0 |
| **Total** | **2.061** | **20** |

Os tipos regenerados também expuseram divergências reais que os tipos antigos
não identificavam. Por isso, a redução não significa apenas retirar mensagens
antigas: o resultado mantém os conflitos de esquema visíveis.

Arquivos de evidência: [evidence.json](evidence.json),
[typescript-remaining.txt](typescript-remaining.txt) e
[SCHEMA_PROVENANCE.md](SCHEMA_PROVENANCE.md).

Base CI: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43025410002

Confirmação CI do resultado final de código (`9f88a543`):
https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43036549729
Os logs desse job confirmam os mesmos 20 erros, build aprovado, 59 testes
unitários, 139 regressões e o teste HTTP aprovado. A etapa final do workflow
continua a falhar intencionalmente quando o TypeScript falha; não foi removida.

## 2. Correções realizadas

- Acesso explícito por índice em 1.339 ocorrências TS4111, sem desligar regras do
  compilador e sem introduzir um escape genérico com `any`.
- Recuperação segura de posições de cursos e aulas salvas: índices negativos,
  inválidos ou antigos deixam de acessar objetos inexistentes. Conteúdos vazios
  produzem erro explícito. Inclui formações e cursos gratuitos e pagos.
- Contratos de respostas das APIs do cliente e do Painel Master validados com
  Zod. Campos monetários e permissões não são convertidos implicitamente.
  Os formatos foram conferidos no código conectado de `client-self` v3 e
  `master-panel-self`; nenhum endpoint autenticado foi chamado com dados reais.
- Conteúdo digital e estados de estudo mantidos como JSON serializável.
- Correção dos parâmetros opcionais de navegação, rotas dinâmicas, traduções,
  campos opcionais dos formulários e referência compartilhada dos sete programas
  de projetos legados.
- Os checkouts individuais já descontinuados continuam rejeitando compras. O
  código histórico foi mantido e separado para ser verificado pelo compilador.
  Nove testes executam os pontos de entrada com dependências sintéticas e
  verificam que não chegam a chamadas de pagamento/rede.
- Metadados opcionais de assinaturas são omitidos quando ausentes. Direitos,
  contratos, inscrições e preços existentes não foram removidos ou redefinidos.
- A projeção do cliente passou a incluir o país já existente no banco para que
  as regras regionais de oferta possam utilizar o dado disponível. Os valores
  das tabelas comerciais foram preservados.
- Links ao host provisório conhecido do Render passam a ser tratados como
  destinos internos no domínio oficial, preservando caminho, consulta e âncora.
  Hosts Render de terceiros não entram nessa regra.

## 3. Central Empresas e evolução comercial

As cinco URLs existentes foram preservadas:

| URL | Implementação e verificação |
| --- | --- |
| `/empresas` | Apresentação comercial e navegação; HTTP 200 e título verificado |
| `/empresas/servicos` | Oito frentes de RH, formação, carreira, bem-estar e soluções personalizadas; HTTP 200 |
| `/empresas/proposta` | Formulário institucional com validação, consentimento, honeypot, estado de envio, erro e protocolo; HTTP 200 |
| `/empresas/ldr-one` | Benefícios corporativos e ligação aos planos existentes; HTTP 200 |
| `/empresas/academy` | Formação de equipas, instituições, Rede Acadêmica e empregabilidade; HTTP 200 |

Foi corrigida uma causa concreta de navegação: a rota pai `/empresas` não
renderizava as páginas filhas. Agora utiliza `Outlet`, e o conteúdo de entrada
fica em `empresas.index.tsx`. O teste HTTP exige o título específico de cada
página, evitando que um HTTP 200 da página pai seja confundido com sucesso.

O formulário reutiliza o atendimento oficial, com o assunto institucional e
identificação da Central Empresas. Permite pedidos de serviços, demonstrações,
parcerias, licenciamento e propostas de aquisição. Não cria checkout, contrato
ou cobrança. A confirmação exige protocolo não vazio. Foram testados o payload,
validação e estados de confirmação com dados sintéticos; **não foi enviado um
pedido ao banco de produção para provar entrega operacional**.

As páginas incluem ligações à rede de profissionais, Academy, Rede Acadêmica,
planos empresariais e atendimento. A apresentação de bem-estar explicita âmbito
profissional e privacidade. Não foram anunciados contratos, resultados,
instituições clientes ou parcerias não comprovadas.

O catálogo institucional de cinco páginas foi criado e revisado visualmente:
`Catalogo_Institucional_Ecossistema_LDR_2026.pdf`. Apresenta RH, educação,
bem-estar, LDR ONE, rede profissional, Motor de Oportunidades, módulos digitais,
parcerias e licenciamento. Condições e disponibilidade ficam sob proposta.

## 4. Testes executados

| Verificação | Resultado e limite |
| --- | --- |
| `npm run typecheck` | **Falha: 20 erros**, preservados como bloqueio |
| `npm run build:render` | Aprovado, cliente e servidor Nitro gerados |
| `npm test` | 59 aprovados, zero falhas |
| `npm run test:regressions` | 139 aprovados, zero falhas |
| `npm run test:enterprise-http` | Cinco páginas HTTP 200, 16 assets HTTP 200 e 30 destinos internos registrados |
| Sandbox LDR ONE em TypeScript | 12 aprovados, sem chaves de pagamento |
| `node --test scripts/ldr-one-*.test.mjs` | 109 aprovados: webhooks, sessões, permissões, créditos e orquestração isolada |
| `git diff --check` | Aprovado |
| `npm ci --ignore-scripts --dry-run --no-audit --no-fund` | Aprovado a partir do workspace da aplicação |

As contagens de suítes são apresentadas separadamente porque algumas verificações
abrangem os mesmos módulos. O teste HTTP não confirma comportamento autenticado
das páginas de destino que dependem do banco: ele verifica seus registros de
rota. Sem credenciais, `/profissionais` retornou 500 ao tentar carregar o backend;
isso foi identificado como limite de configuração do ambiente, não marcado como
um fluxo funcional aprovado.

## 5. Workflows consultados no código validado

Estado confirmado para `9f88a543`. Alterações posteriores de documentação e
instalação reproduzível também exigem observar os checks do HEAD no PR.

| Workflow | Estado | Execução |
| --- | --- | --- |
| Central Empresas validation | **Falha no gate de tipos**; demais etapas aprovadas | 43036549729 |
| Validate AI READY MVP branch | Aprovado | 43036549580 |
| Official support privacy and regression checks | Aprovado | 43036549810 |
| Apply Academy subscription courses 2026-09-14 | Aprovado | 43036550382 |
| LDR ONE sandbox unit checks | Aprovado | 43036550276 |
| Opportunity Engine Safe Validation | Aprovado | 43036550263 |

O gerador de rotas foi fixado em `@tanstack/router-cli@1.168.0`, com lockfile e
execução local `tsr generate`, substituindo a resolução `@latest` durante o build.
As validações de AI READY, suporte e Academy passam a instalar pelo lockfile com
`npm ci`. Academy utiliza Node 22, alinhado aos demais gates atuais.

O workflow histórico da Academy reaplica scripts de integração no checkout e
pode gerar commits em `main` após um push nessa branch. Não houve push em `main`.
Esse comportamento precisa ser revisto no plano de lançamento para evitar que
geradores antigos reintroduzam versões anteriores de arquivos já corrigidos.

## 6. Módulos: alcance real da auditoria

| Módulo | Evidência obtida | Pendente |
| --- | --- | --- |
| Central Empresas / RH & Estratégia | Cinco rotas, formulário, catálogo, testes HTTP e de payload | Receção em staging e validação visual mobile |
| LDR Academy | Tipos, currículos, posições salvas, serialização, rotas e workflow | Percurso autenticado completo em staging |
| LDR ONE | Entitlements, retomada de checkout e 121 verificações sandbox | Integração autenticada de ambiente de teste |
| Clínica Social | Código público, catálogo e dependência da rede revistos; preços preservados | Backend configurado e teste funcional isolado |
| Painel LDR | Contratos de resposta, limites de acesso master e regressões | Teste com papéis sintéticos de administração |
| Human Room | Projeto dedicado confirmado no código; metadados RLS/policies consultados | Jornada de sala, mensagens e consentimento em staging |
| Rede Acadêmica | Regressões e metadados RLS de perfis, posts, diário e mensagens | Testes entre utilizadores sintéticos |
| LDR Carreira | Navegação, traduções e regressões do motor | Percursos de candidatura e empresa em staging |
| LDR Essence / rede profissional | Tipos, formulários, horários e propriedade dos registos | Cadastro e pesquisa com fixtures de backend |
| Biblioteca digital | JSON, catálogo, links, biblioteca e acesso preservado | Leitura autenticada de conteúdo de teste |
| AI READY | Formulário e tipos corrigidos; workflow aprovado | Jornada completa de aluno em staging |
| Suporte oficial | Testes de isolamento, anexos e confirmação durável aprovados | Receção operacional em ambiente de teste |
| Motor de Oportunidades | MVP existente identificado; regressões e workflow aprovados | Novas integrações empresariais com consentimento |

Os metadados consultados confirmam RLS e policies nos conjuntos acadêmico,
profissional, carreira/oportunidades e suporte selecionados. Isso não substitui
testes completos das condições de autorização. No projeto dedicado Human Room,
os conjuntos relevantes também têm RLS e policies. Não foram lidas conversas,
perfis pessoais, candidaturas ou registos clínicos para esta auditoria.

## 7. Bloqueios e riscos materiais

1. **Backend Render não confirmado.** Duas consultas pelo conector expiraram e
   o navegador apresentou login. Não foi possível verificar presença de todas as
   variáveis nem confirmar o `SUPABASE_URL` efetivo. O `render.yaml` versionado
   aponta para `main`, mas não prova a configuração atual do serviço.
2. **Contrato de esquema divergente.** No projeto público observado faltam sete
   tabelas, oito RPCs e um enum legados. Em tabelas sobrepostas há campos de
   sessão e estados de entrega incompatíveis. Os 20 erros permanecem em três
   arquivos: agenda administrativa, central de estados e portal do cliente.
   Detalhes em `SCHEMA_PROVENANCE.md` e no diagnóstico completo.
3. **Validação de respostas é deliberadamente estrita.** Respostas históricas
   fora do contrato serão recusadas, em vez de chegar incompletas à interface.
   É necessário testar fixtures representativas das funções e backend efetivos.
4. **QA visual não concluído.** O Chromium local foi bloqueado por restrição de
   syscall; o headless shell não pôde ser obtido e o navegador cloud não alcançou
   o servidor local. Não há evidência suficiente para aprovar o layout mobile.
   O PDF, separadamente, teve as cinco páginas renderizadas e inspecionadas.
5. **Segurança operacional.** Advisors sinalizam funções SECURITY DEFINER
   expostas e proteção de senhas comprometidas desativada. Policies ausentes em
   algumas tabelas com RLS não significam acesso público; precisam de revisão
   conforme o modelo pretendido. Nenhuma permissão foi alterada em produção.
6. **Links externos ainda exigem validação.** Foi identificado um destino de
   grupo de webinar com hostname malformado em `commercial-public-page.tsx`.
   Não foi inventado um novo destino nem substituído um canal sem confirmação.
   O teste dos 30 destinos cobre os links internos da Central Empresas.

## 8. Situação das fases e plano de publicação

| Fase solicitada | Situação |
| --- | --- |
| A - estabilidade | Grande redução comprovada; bloqueada pelos 20 conflitos de esquema |
| B - Central Empresas, RH e captação | Implementada e validada localmente/CI no alcance descrito |
| C - bem-estar, instituições e oportunidades | Apresentação e ligações adicionadas; MVP existente auditado; integração operacional nova pendente |
| D - demais módulos | Correções de tipos e experiência aplicadas; validação autenticada completa pendente |
| E - catálogo e preparação | Catálogo pronto; build/testes aprovados; lançamento e QA mobile bloqueados |

Próximos passos, antes de pedir aprovação para publicação:

1. Restabelecer a leitura do Render e confirmar o backend efetivo sem expor
   segredos; comparar com o projeto público e com a cadeia de migrations existente.
2. Preparar e validar em ambiente isolado a reconciliação de tabelas, RPCs,
   colunas e enums. Não aplicar mudanças em banco de produção automaticamente.
3. Zerar os 20 erros, executar novamente os gates e revisar geradores legados.
4. Validar login por papel, privacidade entre utilizadores, entrega dos pedidos,
   direitos de acesso, pagamentos de teste e layout mobile com dados sintéticos.
5. Apresentar o candidato e o plano de rollback para decisão do responsável.
   Merge e deploy de produção continuam a exigir autorização expressa.

## 9. Commits de implementação enviados

| Commit | Alteração |
| --- | --- |
| `de5242a9` | Acesso por índice em registos e claims de servidor |
| `9b4bfba3` | Currículos, posições salvas, interface e host provisório |
| `52af5c6d` | Tipos Supabase observados e contratos legados documentados |
| `e5ebf80c` | Central Empresas, propostas institucionais e páginas filhas |
| `1f7419af` | Políticas de checkouts encerrados preservadas e testadas |
| `191927a9` | Validação de respostas e metadados de direitos de acesso |
| `9f88a543` | Navegação, formulários, traduções e cursos |

O commit posterior deste relatório reúne a fixação do gerador, lockfile e
instalação reproduzível dos workflows. O PR permanece em draft e sem merge.
