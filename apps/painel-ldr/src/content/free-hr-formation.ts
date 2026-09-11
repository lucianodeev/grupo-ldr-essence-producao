export type HrUnit={id:string;module:string;title:string;reading:string;activity:string};
export const FREE_HR_TITLE="Formação em Gestão de Pessoas e Recursos Humanos";
export const FREE_HR_HOURS=600;
export const FREE_HR_NOTICE="Formação livre de caráter profissional. Não corresponde a curso de graduação, bacharelado, licenciatura ou tecnólogo e não confere diploma de nível superior reconhecido pelo MEC.";
const modules=[
["Módulo 1 · Fundamentos da Gestão de Pessoas",["Introdução à Gestão de Pessoas","Evolução do RH","RH tradicional x RH estratégico","Papel do profissional de RH","Gestão de pessoas nas organizações"]],
["Módulo 2 · Recrutamento e Seleção",["Planejamento de contratação","Divulgação de vagas","Triagem de currículos","Entrevistas","Seleção por competências","Integração de novos colaboradores"]],
["Módulo 3 · Liderança e Gestão de Equipes",["Fundamentos da liderança","Estilos de liderança","Desenvolvimento de equipes","Delegação","Feedback","Tomada de decisão"]],
["Módulo 4 · Comunicação Organizacional",["Comunicação profissional","Comunicação assertiva","Escuta ativa","Comunicação entre equipes","Reuniões produtivas","Feedback profissional"]],
["Módulo 5 · Treinamento e Desenvolvimento",["Identificação de necessidades","Planejamento de treinamentos","Desenvolvimento profissional","Educação corporativa","Avaliação de treinamento"]],
["Módulo 6 · Desempenho e Competências",["Gestão por competências","Avaliação de desempenho","Metas e indicadores","Plano de desenvolvimento individual","Desenvolvimento de talentos"]],
["Módulo 7 · Clima, Cultura e Engajamento",["Cultura organizacional","Clima organizacional","Motivação","Engajamento","Experiência do colaborador","Retenção de talentos"]],
["Módulo 8 · Gestão de Conflitos",["Tipos de conflitos","Mediação","Negociação","Relações profissionais","Comunicação em situações difíceis"]],
["Módulo 9 · Rotinas e Processos de RH",["Admissão e integração","Organização documental","Jornada e acompanhamento","Férias e desligamentos","Processos administrativos de RH"]],
["Módulo 10 · RH Estratégico",["Planejamento estratégico de pessoas","Indicadores de RH","People Analytics: fundamentos","Planejamento de força de trabalho","RH e resultados empresariais"]],
["Módulo 11 · Carreira e Desenvolvimento Profissional",["Planejamento de carreira","Competências profissionais","Empregabilidade","Desenvolvimento contínuo","Plano de carreira"]],
["Módulo 12 · Ética, Diversidade e Futuro do Trabalho",["Ética profissional","Diversidade e inclusão","Saúde e bem-estar organizacional","Transformação digital","Inteligência Artificial aplicada ao RH","Tendências do futuro do trabalho"]]
] as const;
const reading=(m:string,t:string)=>`Nesta unidade, você estudará ${t.toLowerCase()} dentro do contexto de ${m.replace(/^Módulo \\d+ · /,"")}. O objetivo é compreender conceitos, aplicações e limites profissionais, relacionando o tema à realidade das organizações. Leia de forma crítica, registre os conceitos principais e pense em exemplos reais ou simulados. Ao aplicar práticas de RH, considere o contexto da organização, a ética, a proteção de dados, a diversidade e a legislação vigente na jurisdição em que a organização atua. Esta formação apresenta fundamentos profissionais e não substitui orientação jurídica, contábil ou trabalhista especializada.`;
export const FREE_HR_UNITS:HrUnit[]=modules.flatMap(([module,titles],mi)=>titles.map((title,ui)=>({id:`rh-${mi+1}-${ui+1}`,module,title,reading:reading(module,title),activity:`Atividade de fixação: descreva um exemplo prático de ${title.toLowerCase()} e registre três aprendizados que poderiam ser aplicados em uma organização.`})));
export const FREE_HR_MODULES=modules.map(([title])=>title);
