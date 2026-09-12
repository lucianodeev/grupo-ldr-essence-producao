import type { PsychoanalysisModule } from "@/content/psychoanalysis-curriculum";

export type AcademicLevel="Fundamentos"|"Intermediário"|"Avançado"|"Pesquisa e Clínica Avançada"|"Especialista Internacional";

type ModuleRigor={
  primary:string;
  counterpoint:string;
  research:string;
  epistemic:string;
  casePrompt:string;
};

const rigorByPosition:ModuleRigor[]=[
  {primary:"Freud e Breuer, Estudos sobre a Histeria (1895), e Freud, A Interpretação dos Sonhos (1900).",counterpoint:"Compare a narrativa clássica do nascimento da Psicanálise com historiografia contemporânea e com críticas ao uso retrospectivo dos primeiros casos como prova de eficácia.",research:"Diferencie documento histórico, relato clínico, reconstrução biográfica e evidência empírica.",epistemic:"Não trate um caso histórico como demonstração causal nem como ensaio clínico.",casePrompt:"Reconstrua um impasse clínico do final do século XIX e mostre quais hipóteses poderiam ou não ser sustentadas hoje."},
  {primary:"Freud, O Ego e o Id (1923) e Novas Conferências Introdutórias (1933).",counterpoint:"Compare o modelo estrutural com modelos contemporâneos de cognição, autorregulação e conflito motivacional sem convertê-los em equivalentes.",research:"Examine o estatuto metapsicológico de Id, Ego e Superego e pergunte que tipo de afirmação cada conceito permite.",epistemic:"Modelo teórico não é estrutura anatômica do cérebro.",casePrompt:"Formule duas leituras concorrentes para o mesmo conflito psíquico e indique quais dados favoreceriam cada uma."},
  {primary:"Freud, Três Ensaios sobre a Teoria da Sexualidade (1905) e A Dissolução do Complexo de Édipo (1924).",counterpoint:"Confronte a teoria freudiana do desenvolvimento com conhecimentos atuais sobre desenvolvimento, gênero, sexualidade e diversidade familiar.",research:"Separe história das ideias, valor clínico interpretativo e alegações desenvolvimentais testáveis.",epistemic:"Evite universalizar trajetórias familiares e sexuais como se fossem invariantes biológicas.",casePrompt:"Analise uma vinheta sem presumir que uma configuração familiar determina automaticamente uma estrutura psíquica."},
  {primary:"Freud, Introdução ao Narcisismo (1914), As Pulsões e seus Destinos (1915) e Além do Princípio do Prazer (1920).",counterpoint:"Compare diferentes leituras da repetição, agressividade e investimento libidinal e identifique o que permanece especulativo.",research:"Diferencie conceito metapsicológico de hipótese neurobiológica e localize limites de tradução entre campos.",epistemic:"Pulsão de morte não deve ser apresentada como mecanismo neurológico comprovado.",casePrompt:"Construa uma hipótese de repetição que possa ser revisada diante de novos dados clínicos."},
  {primary:"Freud, A Repressão (1915), Inibição, Sintoma e Angústia (1926), e Anna Freud, O Ego e os Mecanismos de Defesa (1936).",counterpoint:"Compare a tradição psicanalítica das defesas com pesquisas contemporâneas sobre coping, regulação emocional e vieses cognitivos.",research:"Pergunte como um constructo clínico pode ser operacionalizado, observado e falsamente inferido.",epistemic:"Não transforme mecanismos de defesa em rótulos diagnósticos automáticos.",casePrompt:"Apresente três explicações alternativas para a mesma conduta defensiva e indique o que faltaria investigar."},
  {primary:"Freud, A Interpretação dos Sonhos (1900), Psicopatologia da Vida Cotidiana (1901) e Os Chistes e sua Relação com o Inconsciente (1905).",counterpoint:"Confronte interpretação psicanalítica com explicações cognitivas e neurocientíficas de memória, sonho e erro sem reduzir um campo ao outro.",research:"Avalie o risco de viés confirmatório em interpretações retrospectivas.",epistemic:"Associação singular tem prioridade sobre dicionários universais de símbolos.",casePrompt:"Produza uma interpretação provisória e depois escreva duas hipóteses concorrentes capazes de explicar o mesmo material."},
  {primary:"Freud, Recomendações aos Médicos que Exercem a Psicanálise (1912), Sobre o Início do Tratamento (1913) e Recordar, Repetir e Elaborar (1914).",counterpoint:"Compare princípios técnicos clássicos com ética contemporânea, consentimento, documentação, risco e prática interdisciplinar.",research:"Diferencie recomendação técnica, tradição institucional e evidência de resultado.",epistemic:"Técnica clínica não deve ser aplicada como protocolo rígido fora do contexto.",casePrompt:"Justifique uma intervenção, uma não intervenção e um encaminhamento possível para a mesma vinheta."},
  {primary:"Freud, A Dinâmica da Transferência (1912) e Observações sobre o Amor Transferencial (1915).",counterpoint:"Compare transferência com conceitos relacionais contemporâneos sem assumir equivalência terminológica.",research:"Examine como expectativas do terapeuta podem influenciar leitura do vínculo clínico.",epistemic:"Transferência é hipótese clínica construída no processo, não explicação automática de toda reação ao analista.",casePrompt:"Diferencie fatos observáveis, inferências transferenciais e efeitos possíveis da própria conduta do analista."},
  {primary:"Textos selecionados de Melanie Klein, Donald Winnicott e Jacques Lacan, sempre lidos em sua tradição e contexto próprios.",counterpoint:"Construa uma matriz comparativa mostrando convergências, incompatibilidades e problemas de tradução entre escolas.",research:"Avalie se conceitos de escolas distintas respondem à mesma pergunta ou a problemas diferentes.",epistemic:"Evite criar uma síntese artificial apagando divergências teóricas reais.",casePrompt:"Leia a mesma vinheta a partir de três escolas e defenda qual leitura é mais produtiva sem declarar uma delas universalmente verdadeira."},
  {primary:"Freud, O Mal-Estar na Civilização (1930), Psicologia das Massas e Análise do Eu (1921) e literatura contemporânea sobre sofrimento social.",counterpoint:"Confronte explicações intrapsíquicas com determinantes sociais, econômicos, laborais, tecnológicos e culturais.",research:"Diferencie associação clínica, correlação populacional e causalidade social.",epistemic:"Não psicologize fenômenos estruturais nem reduza todo sofrimento social a conflito intrapsíquico.",casePrompt:"Construa uma formulação que integre história singular e contexto social sem transformar um nível em causa total do outro."},
  {primary:"Literatura psicanalítica histórica e contemporânea sobre autismo, lida em diálogo crítico com classificações e pesquisa atual em neurodesenvolvimento.",counterpoint:"Inclua perspectivas de pessoas autistas, neurodiversidade, psiquiatria, psicologia do desenvolvimento, fonoaudiologia e terapia ocupacional.",research:"Analise diferenças entre hipótese psicanalítica, descrição fenomenológica, diagnóstico e evidência neurobiológica.",epistemic:"A Psicanálise não deve ser apresentada como explicação causal comprovada do autismo nem como substituta da avaliação multiprofissional.",casePrompt:"Elabore um caso distinguindo necessidades sensoriais, comunicação, sofrimento subjetivo, contexto e hipóteses clínicas revisáveis."},
  {primary:"Casos freudianos e literatura contemporânea de construção de caso, supervisão e raciocínio clínico.",counterpoint:"Submeta cada formulação a hipóteses alternativas, dados ausentes e risco de viés retrospectivo.",research:"Use uma matriz: dado observado, relato do paciente, inferência clínica, hipótese concorrente, decisão e evidência necessária.",epistemic:"Uma narrativa coerente pode estar errada; coerência não substitui sustentação clínica.",casePrompt:"Produza uma construção de caso completa e depois redija uma seção intitulada ‘Como minha hipótese pode estar errada?’."},
  {primary:"Freud, A Análise Terminável e Interminável (1937), textos técnicos e literatura contemporânea sobre formação e ética clínica.",counterpoint:"Discuta análise pessoal, poder, autoridade, conflitos de interesse e limites institucionais.",research:"Diferencie tradição formativa, exigência institucional e evidência sobre competência clínica.",epistemic:"Experiência pessoal não substitui supervisão, conhecimento ou responsabilidade profissional.",casePrompt:"Analise um ponto cego do analista e descreva como análise pessoal, supervisão e limites poderiam modificar a condução."},
  {primary:"Literatura clássica e contemporânea de supervisão, formulação de caso, ética e prática baseada em reflexão crítica.",counterpoint:"Compare supervisão confirmatória com supervisão que procura ativamente hipóteses concorrentes e sinais de erro.",research:"Inclua auditoria de decisão: o que foi observado, por que se interveio, qual efeito ocorreu e o que será revisto.",epistemic:"Supervisão não transforma hipótese em verdade; deve ampliar dúvida qualificada e responsabilidade.",casePrompt:"Defenda uma decisão clínica diante de uma banca fictícia e responda a três objeções fundamentadas."},
  {primary:"Fontes oficiais de cada jurisdição, GDPR/EDPB quando aplicável, códigos éticos pertinentes e literatura interdisciplinar internacional sobre neurodiversidade e migração.",counterpoint:"Compare países sem presumir uma legislação europeia única e inclua diferenças entre profissão regulamentada, atividade livre, saúde e educação.",research:"Exija pesquisa documental com data, órgão oficial, link, escopo da norma e limites de interpretação.",epistemic:"Nenhuma aula do curso constitui autorização legal para exercer profissão regulamentada em outro país.",casePrompt:"Escolha um país, produza um dossiê regulatório verificável e construa um plano de carreira de 90 dias com riscos, limites e fontes oficiais."},
];

export function getAcademicLevel(moduleIndex:number):AcademicLevel{
  if(moduleIndex<=3)return "Fundamentos";
  if(moduleIndex<=7)return "Intermediário";
  if(moduleIndex<=10)return "Avançado";
  if(moduleIndex<=13)return "Pesquisa e Clínica Avançada";
  return "Especialista Internacional";
}

export function enhancePsychoanalysisCurriculum(modules:PsychoanalysisModule[]):PsychoanalysisModule[]{
  return modules.map((module,moduleIndex)=>{
    const level=getAcademicLevel(moduleIndex);
    const rigor=rigorByPosition[moduleIndex]??rigorByPosition[rigorByPosition.length-1];
    const lessons=module.lessons.map((lesson,lessonIndex)=>({
      ...lesson,
      content:[
        ...lesson.content,
        `NÍVEL ACADÊMICO — ${level}. Esta unidade deve ser estudada como problema de investigação, não como conteúdo para memorização.`,
        `PROBLEMA CENTRAL — Em que condições “${lesson.title}” ajuda a compreender o fenômeno estudado e em que condições esse conceito pode produzir uma leitura excessiva, circular ou insuficiente?`,
        `FONTE PRIMÁRIA E LEITURA DE ALTO RIGOR — ${rigor.primary} Localize a formulação no texto original sempre que possível, registre contexto, data, tradução utilizada e mudanças conceituais ao longo da obra.`,
        `CONTRAPONTO CRÍTICO — ${rigor.counterpoint}`,
        `PESQUISA E EVIDÊNCIA — ${rigor.research} Para artigos contemporâneos, identifique pergunta, método, amostra, resultado, limitações, conflitos de interesse e se a conclusão realmente decorre dos dados.`,
        `LIMITE EPISTEMOLÓGICO — ${rigor.epistemic}`,
        `LABORATÓRIO DE CASO — ${rigor.casePrompt}`,
        `ARGUMENTAÇÃO — Escreva uma tese de 150–300 palavras sobre “${lesson.title}”, apresente a melhor objeção possível à sua própria tese e responda sem recorrer a autoridade ou frases prontas.`,
        `DECISÃO CLÍNICA E ÉTICA — Se este conceito influenciasse uma decisão clínica, explicite o que é dado, o que é inferência, quais riscos existem, quais alternativas devem ser consideradas e quando encaminhar ou buscar supervisão.`,
        `PRODUÇÃO ACADÊMICA — Registre ao menos uma referência primária, uma referência crítica ou contemporânea e uma pergunta de pesquisa que permaneceu aberta ao final da unidade ${lessonIndex+1}.`,
      ],
    }));
    return {
      ...module,
      lessons,
      activity:`AVALIAÇÃO DE ALTO RIGOR — ${module.activity} Além da resposta principal, entregue: (1) uma tese argumentada; (2) uma hipótese concorrente; (3) um limite epistemológico; (4) uma aplicação clínica; (5) uma decisão ética; (6) duas referências comentadas. Critério de excelência: distinguir fatos, conceitos, inferências e evidências sem confundi-los.`,
    };
  });
}
