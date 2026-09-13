export type TrichologyLesson={id:string;title:string;summary:string;content:string[]};
export type TrichologyModule={id:number;title:string;lessons:TrichologyLesson[];activity:string};
const L=(id:string,title:string,summary:string,content:string[]):TrichologyLesson=>({id,title,summary,content});
export const trichologyModules:TrichologyModule[]=[
{ id:1,title:"Fundamentos da Tricologia e Ciência Capilar",activity:"Construa o Mapeamento Capilar inicial de um caso real ou simulado.",lessons:[
L("m1l1","Introdução à tricologia","Bases científicas e limites profissionais.",["História e escopo da tricologia aplicada à beleza.","Diferença entre observação estética, cuidado capilar e diagnóstico médico."]),
L("m1l2","Anatomia do fio e do couro cabeludo","Estrutura da fibra, folículo e couro cabeludo.",["Folículo piloso, haste, cutícula, córtex e medula.","Glândulas sebáceas, queratina e melanina."]),
L("m1l3","Ciclo capilar","Fases anágena, catágena e telógena.",["Como o ciclo capilar influencia a observação profissional.","Quando sinais fogem do escopo estético e exigem encaminhamento."]),
L("m1l4","Tipos, curvaturas e propriedades","Porosidade, densidade, elasticidade e resistência.",["Leitura técnica da fibra capilar.","Impacto de hábitos, ambiente e processos químicos."]),
L("m1l5","Biossegurança e ética","Prática segura e documentação.",["Higiene, organização, consentimento e proteção de dados.","Limites legais, éticos e técnicos da atuação."]) ]},
{ id:2,title:"Avaliação Capilar e Alterações do Couro Cabeludo",activity:"Monte um Dossiê de Avaliação Capilar com histórico, fotos autorizadas e plano de acompanhamento.",lessons:[
L("m2l1","Anamnese capilar","Entrevista profissional estruturada.",["Histórico, hábitos, cosméticos e procedimentos prévios.","Definição de objetivos possíveis dentro do escopo profissional."]),
L("m2l2","Avaliação visual e tátil","Registro padronizado e observação.",["Iluminação, ângulos, textura, oleosidade, descamação e sensibilidade.","Padronização de fotografias para comparação de evolução."]),
L("m2l3","Tricoscopia introdutória","Uso observacional de ampliação.",["Princípios de câmera de aumento e tricoscópio digital.","Uso educacional sem diagnóstico médico."]),
L("m2l4","Alterações frequentes","Sinais comuns e encaminhamento.",["Quebra, danos químicos, térmicos e mecânicos.","Visão educacional de alopecias, dermatites, psoríase, caspa e eflúvios."]),
L("m2l5","Decisão profissional","Acompanhar, adaptar ou encaminhar.",["Critérios de segurança e comunicação responsável.","Integração com profissionais habilitados quando necessário."]) ]},
{ id:3,title:"Cosmetologia e Protocolos de Terapia Capilar",activity:"Crie três protocolos cosméticos profissionais completos.",lessons:[
L("m3l1","Fundamentos de cosmetologia","Leitura técnica de produtos.",["Shampoos, condicionadores, máscaras, séruns, tônicos, loções e óleos.","pH, composição e compatibilidade."]),
L("m3l2","Ativos e objetivos cosméticos","Escolha consciente de ativos.",["Hidratação, nutrição, reconstrução e equilíbrio do couro cabeludo.","Cuidados com contraindicações e sensibilidades."]),
L("m3l3","Protocolos profissionais","Sequência, tempo e registro.",["Estruture objetivo, materiais, produtos, técnica e acompanhamento.","Registre resposta e necessidade de ajustes."]),
L("m3l4","Técnicas manuais","Massagem e aplicação segura.",["Técnicas manuais do couro cabeludo dentro do escopo estético.","Cuidados antes e depois do atendimento."]),
L("m3l5","Cronograma capilar profissional","Planejamento por necessidade observada.",["Organização de ciclos de cuidado.","Ajustes baseados na evolução documentada."]) ]},
{ id:4,title:"Tecnologias e Prática Profissional",activity:"Acompanhe um caso por 30 dias usando o Diário de Evolução Capilar.",lessons:[
L("m4l1","Equipamentos de avaliação","Ferramentas de apoio à observação.",["Câmera, tricoscópio digital, lupa e iluminação.","Higienização, manutenção e documentação."]),
L("m4l2","Vapor e recursos cosméticos","Aplicação segura em protocolos.",["Uso profissional conforme fabricante e competência.","Controle de temperatura, tempo e conforto."]),
L("m4l3","Alta frequência, LED e fotobiomodulação","Visão educacional e limites.",["Princípios, contraindicações e documentação.","Uso somente quando compatível com formação e legislação local."]),
L("m4l4","Plano de 30 dias","Estrutura de acompanhamento.",["Situação inicial, objetivo, protocolo, sessões e ajustes.","Comparação de registros padronizados."]),
L("m4l5","Relatório de evolução","Síntese técnica do acompanhamento.",["Organize resultados observados, limites e próximos passos.","Evite promessas clínicas ou diagnósticas."]) ]},
{ id:5,title:"Gestão de Salão, Clínica e Negócio Capilar",activity:"Crie o projeto Meu Espaço de Terapia Capilar ou o plano de implementação no salão atual.",lessons:[
L("m5l1","Organização do espaço","Fluxo, agenda e experiência.",["Estrutura física, tempo de atendimento e jornada do cliente.","Documentação, prontuário e rotina operacional."]),
L("m5l2","Estoque e fornecedores","Controle e previsibilidade.",["Produtos, materiais, validade e reposição.","Critérios para seleção de fornecedores."]),
L("m5l3","Custos e precificação","Sustentabilidade financeira.",["Custos fixos, variáveis, margem e preço.","Fluxo de caixa, metas e indicadores básicos."]),
L("m5l4","Pacotes e recorrência","Oferta ética de serviços.",["Atendimento consultivo, programas de acompanhamento e pós-atendimento.","Fidelização sem promessas indevidas."]),
L("m5l5","Marketing profissional","Posicionamento e reputação.",["WhatsApp, Instagram, Google, avaliações e indicações.","Parcerias e relacionamento com outros profissionais."]) ]},
{ id:6,title:"Carreira de Terapeuta Capilar e Projeto Final",activity:"Entregue a Jornada de Evolução Capilar e seu plano profissional.",lessons:[
L("m6l1","Posicionamento profissional","Como apresentar sua atuação.",["Identidade, especialização, serviços e portfólio.","Comunicação clara sobre limites e proposta de valor."]),
L("m6l2","Primeiros clientes","Plano 5, 10 e 30 clientes.",["Estratégia de ativação de rede, conteúdo, indicação e parcerias.","Organização do acompanhamento e reputação."]),
L("m6l3","Kit para começar","Essencial, recomendado e avançado.",["Luvas, toalhas, capas, recipientes, espátulas, pincéis, borrifadores, pentes, escovas, clips, balança, iluminação, câmera, fichas e cosméticos.","Recomendados: lupa, tricoscópio digital, vaporizador, carrinho, tablet/computador e sistema de gestão."]),
L("m6l4","Plano de investimento","Quanto preciso para começar.",["Separe estrutura, materiais, cosméticos, equipamentos e marketing.","Priorize o essencial antes de investir em recursos avançados."]),
L("m6l5","Projeto final","Jornada de Evolução Capilar.",["Reúna avaliação inicial, objetivos, protocolos, produtos, técnicas, registros, fotos autorizadas, evolução e reflexão crítica.","Inclua limites do atendimento e encaminhamento quando aplicável."]) ]}
];
export const TRICHOLOGY_TOTAL_LESSONS=trichologyModules.reduce((n,m)=>n+m.lessons.length,0);
export const TRICHOLOGY_PROJECTS=[
{number:1,title:"Mapeamento Capilar",afterModule:1},
{number:2,title:"Dossiê de Avaliação Capilar",afterModule:2},
{number:3,title:"3 Protocolos Profissionais",afterModule:3},
{number:4,title:"Acompanhamento de 30 Dias",afterModule:4},
{number:5,title:"Meu Espaço de Terapia Capilar",afterModule:5},
{number:6,title:"Jornada de Evolução Capilar · Projeto Final",afterModule:6},
] as const;
