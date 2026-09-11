export type UndergraduateCourse={
 key:string; icon:string; title:string; years:number; semesters:number; intro:string; profile:string; opportunities:string; curriculum:string[][];
};

export const UNDERGRADUATE_COURSES:UndergraduateCourse[]=[
 {key:"psicanalise-clinica",icon:"🎓",title:"Graduação em Psicanálise Clínica",years:4,semesters:8,intro:"Proposta acadêmica preliminar com eixo predominante na Psicanálise Freudiana, articulando fundamentos, técnica, clínica, ética, pesquisa, estudos de caso e supervisão.",profile:"Para estudantes interessados em aprofundar teoria psicanalítica, escuta clínica, cultura e pesquisa.",opportunities:"Possibilidades profissionais dependerão da legislação aplicável, da instituição ofertante e da regulamentação vigente no local de atuação.",curriculum:[
  ["Introdução à Psicanálise","História da Psicanálise","Sigmund Freud I","Metodologia Científica","Psicologia e Desenvolvimento Humano"],
  ["Sigmund Freud II","Teoria do Inconsciente","Desenvolvimento Psicossexual","Sonhos e Formações do Inconsciente","Ética em Psicanálise"],
  ["Sigmund Freud III","Metapsicologia Freudiana","Narcisismo","Pulsão e Recalque","Angústia"],
  ["Psicopatologia Psicanalítica","Neurose","Psicose","Perversão","Transferência e Resistência"],
  ["Técnica Psicanalítica","Clínica Psicanalítica","Contratransferência","Melanie Klein","Donald Winnicott"],
  ["Jacques Lacan I","Jacques Lacan II","Psicanálise da Criança","Psicanálise do Adolescente","Psicanálise do Adulto"],
  ["Psicanálise e Envelhecimento","Psicanálise e Sexualidade","Psicanálise, Cultura e Sociedade","Autismo e Psicanálise","Saúde Mental e Trabalho Interdisciplinar"],
  ["Estudos de Casos Clínicos","Seminários Clínicos","Análise Pessoal","Supervisão Clínica","Pesquisa Científica e Trabalho de Conclusão"]]},
 {key:"psicopedagogia",icon:"🧠",title:"Graduação em Psicopedagogia",years:4,semesters:8,intro:"Proposta preliminar voltada à aprendizagem, desenvolvimento humano, educação inclusiva e intervenções psicopedagógicas em contextos educacionais e clínicos.",profile:"Para quem deseja estudar processos de aprendizagem, desenvolvimento e relações entre família, escola e educação.",opportunities:"A atuação profissional e eventuais estágios dependerão do projeto pedagógico definitivo e das regras aplicáveis.",curriculum:[
  ["Fundamentos da Educação","História da Educação","Filosofia da Educação","Psicologia da Educação"],
  ["Sociologia da Educação","Psicologia do Desenvolvimento","Desenvolvimento Humano","Teorias da Aprendizagem"],
  ["Neurociência e Aprendizagem","Alfabetização","Letramento","Educação Infantil"],
  ["Educação Inclusiva","Educação Especial","Dificuldades de Aprendizagem","Transtornos do Neurodesenvolvimento"],
  ["Psicopedagogia Institucional","Psicopedagogia Clínica","Avaliação Psicopedagógica","Família, Escola e Aprendizagem"],
  ["Intervenção Psicopedagógica","Ludicidade e Aprendizagem","Tecnologias Educacionais","Libras"],
  ["Ética Profissional","Metodologia Científica","Pesquisa em Psicopedagogia","Estudos de Caso"],
  ["Projeto Integrador","Práticas Acadêmicas","Estágio quando aplicável","TCC quando aplicável"]]},
 {key:"pedagogia",icon:"📚",title:"Graduação em Pedagogia",years:4,semesters:8,intro:"Proposta acadêmica preliminar para formação ampla em educação, didática, alfabetização, gestão escolar, inclusão e práticas pedagógicas.",profile:"Para estudantes interessados em ensino, aprendizagem, gestão educacional e políticas públicas de educação.",opportunities:"Campos de atuação dependerão da habilitação efetivamente aprovada, do diploma emitido pela futura IES e das normas aplicáveis.",curriculum:[
  ["História da Educação","Filosofia da Educação","Sociologia da Educação","Psicologia da Educação"],
  ["Desenvolvimento e Aprendizagem","Didática","Currículo","Políticas Educacionais"],
  ["Alfabetização e Letramento","Educação Infantil","Literatura Infantil","Planejamento Educacional"],
  ["Ensino Fundamental","Metodologias de Ensino","Avaliação da Aprendizagem","Legislação Educacional"],
  ["Gestão Escolar","Educação Inclusiva","Educação Especial","Libras"],
  ["Tecnologias Educacionais","Educação e Diversidade","Educação de Jovens e Adultos","Pesquisa em Educação"],
  ["Projetos Integradores","Atividades Extensionistas quando aplicáveis","Práticas Pedagógicas","Estágio conforme regulamentação"],
  ["Estágio Supervisionado quando aplicável","Seminários de Educação","Projeto Final","TCC quando aplicável"]]},
 {key:"gestao-rh",icon:"👥",title:"Graduação em Gestão de Recursos Humanos",years:2,semesters:4,intro:"Proposta acadêmica preliminar orientada à gestão de pessoas, recrutamento, desenvolvimento, liderança, tecnologia e estratégia de RH.",profile:"Para quem deseja atuar com pessoas, processos de RH, desenvolvimento organizacional e gestão estratégica.",opportunities:"Possibilidades incluem áreas de RH, recrutamento, treinamento, people analytics e gestão de pessoas, conforme qualificação e requisitos de cada função.",curriculum:[
  ["Fundamentos de Administração","Gestão de Pessoas","Recrutamento e Seleção","Comunicação Empresarial","Comportamento Organizacional"],
  ["Treinamento e Desenvolvimento","Cargos, Salários e Benefícios","Departamento Pessoal","Legislação Trabalhista","Cultura Organizacional"],
  ["Liderança","Gestão de Desempenho","Gestão por Competências","Diversidade e Inclusão","Saúde e Bem-Estar no Trabalho","Gestão de Conflitos"],
  ["Gestão Estratégica de RH","People Analytics","Tecnologia aplicada ao RH","Inteligência Artificial aplicada ao RH","Negociação","Empreendedorismo e Projeto Integrador"]]},
 {key:"inteligencia-artificial",icon:"🤖",title:"Graduação em Inteligência Artificial",years:2,semesters:4,intro:"Proposta acadêmica preliminar de formação tecnológica em programação, dados, machine learning, IA generativa, automação, agentes e governança de IA.",profile:"Para estudantes interessados em tecnologia, programação, dados e aplicações práticas de inteligência artificial.",opportunities:"Possibilidades podem incluir desenvolvimento, dados, automação e soluções de IA, conforme competências, mercado e exigências das funções.",curriculum:[
  ["Fundamentos de Computação","Lógica de Programação","Algoritmos","Python","Matemática para Computação","Estatística"],
  ["Banco de Dados","Estruturas de Dados","Engenharia de Software","Inteligência Artificial","Machine Learning","Ciência de Dados"],
  ["Deep Learning","Redes Neurais","Processamento de Linguagem Natural","IA Generativa","Engenharia de Prompts","APIs e Integrações","Cloud Computing"],
  ["Visão Computacional","Big Data","Automação","Agentes de Inteligência Artificial","IA aplicada aos Negócios","Segurança e Privacidade","Ética e Governança de IA","Projeto Final"]]},
 {key:"empreendedorismo",icon:"🚀",title:"Graduação em Empreendedorismo",years:2,semesters:4,intro:"Proposta acadêmica preliminar focada em criação e expansão de negócios, vendas, marketing, finanças, inovação, IA e internacionalização.",profile:"Para quem deseja criar, estruturar, gerir ou expandir negócios próprios e projetos empresariais.",opportunities:"Possibilidades incluem empreendedorismo, gestão comercial, inovação, negócios digitais e projetos empresariais, sem promessa de resultado ou renda.",curriculum:[
  ["Fundamentos de Administração","Empreendedorismo","Modelagem de Negócios","Business Model Canvas","Inovação","Marketing"],
  ["Marketing Digital","Vendas","Gestão Comercial","Gestão Financeira","Contabilidade para Empreendedores","Comportamento do Consumidor"],
  ["Estratégia Empresarial","Liderança","Gestão de Pessoas","Negociação","E-commerce","Branding","Gestão de Projetos"],
  ["Inteligência Artificial nos Negócios","Automação Empresarial","Internacionalização de Empresas","Startups","Captação de Recursos","Aspectos Jurídicos dos Negócios","Planejamento Empresarial","Projeto de Negócio"]]}
];

export function undergraduateCourse(key:string){return UNDERGRADUATE_COURSES.find(c=>c.key===key)??null;}
