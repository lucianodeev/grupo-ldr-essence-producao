export type LeadershipLesson={id:string;title:string;summary:string;content:string[]};
export type LeadershipModule={id:number;title:string;lessons:LeadershipLesson[];activity:string};

type Topic={title:string;focus:string;practice:string};
const lesson=(moduleId:number,index:number,t:Topic):LeadershipLesson=>({
 id:`l${moduleId}-${index+1}`,title:t.title,summary:`Estudo diário de aproximadamente 40 minutos sobre ${t.title.toLowerCase()}.`,content:[
  `BLOCO 1 · CONTEXTO E OBJETIVO (≈8 min) — ${t.focus} Observe como esse tema aparece no cotidiano de quem lidera pessoas e identifique uma situação concreta da sua realidade profissional para acompanhar durante a aula.`,
  `BLOCO 2 · DESENVOLVIMENTO CONCEITUAL (≈8 min) — Estude ${t.title.toLowerCase()} separando fatos, interpretações, responsabilidades e impactos. O objetivo não é decorar uma fórmula, mas compreender critérios que permitam agir com clareza, coerência e responsabilidade em contextos diferentes.`,
  `BLOCO 3 · APLICAÇÃO NA GESTÃO (≈8 min) — ${t.practice} Registre quais comportamentos do líder favorecem o resultado e quais aumentam ruído, dependência, conflito ou perda de confiança.`,
  `BLOCO 4 · ANÁLISE DE SITUAÇÃO (≈8 min) — Imagine uma equipe em que esse tema não está sendo bem conduzido. Descreva o problema observável, as pessoas afetadas, os riscos de não agir e duas alternativas de intervenção. Compare consequências antes de escolher uma resposta.`,
  `BLOCO 5 · EXERCÍCIO E APRENDIZADO-CHAVE (≈8 min) — Escreva uma ação que você aplicaria nas próximas 24 horas, uma pergunta que faria à equipe e um indicador que mostraria evolução. Finalize com três aprendizados sobre ${t.title.toLowerCase()} e uma decisão prática para sua atuação como líder.`
 ]
});
const mod=(id:number,title:string,activity:string,topics:Topic[]):LeadershipModule=>({id,title,activity,lessons:topics.map((t,i)=>lesson(id,i,t))});
const t=(title:string,focus:string,practice:string):Topic=>({title,focus,practice});

export const leadershipPeopleModules:LeadershipModule[]=[
mod(1,"Fundamentos da Liderança","Construa um diagnóstico do seu perfil atual de liderança, com forças, riscos, valores e três comportamentos prioritários para desenvolver.",[
 t("O que significa liderar","Liderar é produzir direção, confiança e condições para que pessoas assumam responsabilidades, e não apenas ocupar um cargo.","Analise como propósito, exemplo e clareza influenciam o comportamento da equipe."),
 t("Liderança x chefia","Autoridade formal e capacidade de influência não são a mesma coisa.","Compare uma ordem baseada apenas no cargo com uma orientação que cria entendimento e compromisso."),
 t("O papel do líder contemporâneo","O líder atual equilibra resultado, pessoas, aprendizagem, tecnologia e mudanças constantes.","Mapeie as diferentes expectativas que empresa, equipe e clientes colocam sobre a liderança."),
 t("Responsabilidade e influência","Influenciar exige assumir consequências pelas decisões e pelo ambiente criado ao redor delas.","Identifique o que está sob controle direto, influência e preocupação do líder."),
 t("Estilos de liderança","Estilos diferentes podem ser úteis conforme maturidade da equipe, urgência e natureza da tarefa.","Compare abordagens diretiva, participativa, delegadora e orientadora em situações concretas."),
 t("Liderança situacional","Uma mesma resposta não serve para todas as pessoas nem para todas as fases de uma equipe.","Escolha o nível de direção e apoio adequado para três perfis com experiências diferentes."),
 t("Autoconhecimento do líder","Reconhecer padrões pessoais reduz decisões impulsivas e incoerentes.","Liste gatilhos, forças, pontos cegos e situações em que seu comportamento muda sob pressão."),
 t("Valores e coerência","Valores só ganham credibilidade quando aparecem nas decisões difíceis.","Confronte valores declarados com escolhas reais de prioridade, reconhecimento e correção."),
 t("Confiança nas relações profissionais","Confiança nasce de previsibilidade, competência, respeito e cumprimento de acordos.","Identifique comportamentos que constroem ou desgastam confiança em uma equipe."),
 t("Identidade de liderança","A identidade do líder é construída pela repetição de escolhas, não por um título.","Escreva os princípios pelos quais você deseja ser reconhecido como líder.")]),
mod(2,"Comunicação e Inteligência Emocional","Reescreva uma conversa profissional difícil usando escuta, assertividade, regulação emocional e acordos claros.",[
 t("Comunicação na liderança","A qualidade da execução depende da qualidade do entendimento criado.","Transforme uma orientação vaga em mensagem com contexto, expectativa, prazo e confirmação."),
 t("Escuta ativa","Escutar é buscar significado antes de formular resposta.","Pratique perguntas de esclarecimento, síntese e confirmação sem interromper prematuramente."),
 t("Comunicação assertiva","Assertividade combina respeito, objetividade e limite.","Separe fato, impacto, necessidade e pedido em uma mensagem profissional."),
 t("Inteligência emocional","Reconhecer emoções ajuda a escolher respostas em vez de apenas reagir.","Mapeie emoção, pensamento automático, impulso e resposta possível em uma situação de pressão."),
 t("Autocontrole em situações difíceis","Autocontrole não é ausência de emoção, mas capacidade de preservar critério.","Crie um protocolo pessoal para desacelerar decisões quando estiver sob tensão."),
 t("Empatia profissional","Empatia permite compreender a perspectiva do outro sem abandonar responsabilidade e limites.","Reconheça necessidades de um colaborador e formule uma resposta que acolha sem prometer o que não pode cumprir."),
 t("Comunicação não violenta no trabalho","Observação, sentimento, necessidade e pedido ajudam a reduzir acusações.","Converta julgamentos e rótulos em descrições observáveis e pedidos específicos."),
 t("Conversas difíceis","Assuntos evitados tendem a crescer e contaminar relações.","Prepare abertura, fatos, escuta, limite, acordo e acompanhamento para uma conversa delicada."),
 t("Ruídos de comunicação","Suposições, canais inadequados e mensagens incompletas produzem retrabalho.","Faça um diagnóstico de onde a informação se perde entre decisão e execução."),
 t("Comunicação que gera confiança","Coerência entre fala, decisão e comportamento fortalece segurança psicológica.","Planeje como comunicar uma decisão impopular com transparência e respeito.")]),
mod(3,"Gestão de Equipes","Crie um plano de organização de equipe com papéis, autonomia, acordos de colaboração e indicadores de funcionamento.",[
 t("Formação de equipes","Uma equipe precisa de propósito comum, papéis e interdependência real.","Defina o que transforma um conjunto de pessoas em uma unidade de trabalho."),
 t("Papéis dentro da equipe","Ambiguidade de papel cria lacunas, sobreposição e conflitos.","Desenhe responsabilidades e interfaces entre três funções que precisam colaborar."),
 t("Diversidade de perfis profissionais","Diferenças de experiência, ritmo e perspectiva podem ampliar a qualidade das decisões.","Planeje como distribuir contribuições sem transformar diferenças em estereótipos."),
 t("Delegação","Delegar é transferir responsabilidade com contexto, recursos e acompanhamento adequado.","Escolha uma tarefa e defina resultado esperado, autonomia, prazo e ponto de revisão."),
 t("Responsabilidade e prestação de contas","Autonomia exige clareza sobre compromissos e consequências.","Crie acordos para acompanhar entregas sem microgerenciamento."),
 t("Autonomia","Autonomia cresce quando competência, confiança e limites estão claros.","Defina quais decisões podem ser tomadas sem autorização e quais exigem alinhamento."),
 t("Engajamento","Engajamento é influenciado por sentido, condições, reconhecimento e possibilidade de contribuição.","Investigue causas de desengajamento antes de atribuí-lo à atitude individual."),
 t("Colaboração","Colaboração exige mecanismos para compartilhar informação, decidir e resolver dependências.","Desenhe um ritual simples de alinhamento entre pessoas que dependem umas das outras."),
 t("Equipes presenciais e remotas","Distância muda a forma de criar visibilidade, conexão e coordenação.","Defina acordos de canal, disponibilidade, documentação e reuniões para uma equipe híbrida."),
 t("Equipes de alto desempenho","Desempenho sustentável combina objetivo, competência, confiança, aprendizagem e disciplina.","Avalie uma equipe em cinco dimensões e escolha a principal alavanca de melhoria.")]),
mod(4,"Motivação, Desempenho e Feedback","Construa uma conversa completa de feedback e um plano de desenvolvimento com critérios de acompanhamento.",[
 t("O que influencia a motivação","Motivação não depende de uma única técnica e varia conforme pessoa, contexto e momento.","Investigue fatores de energia, frustração, sentido e condições de trabalho."),
 t("Motivação individual e coletiva","Necessidades individuais coexistem com objetivos compartilhados.","Compare ações que atendem uma pessoa com práticas que fortalecem o grupo."),
 t("Reconhecimento","Reconhecimento útil é específico, verdadeiro e conectado à contribuição.","Transforme elogios genéricos em reconhecimento que ensina o comportamento valorizado."),
 t("Gestão de desempenho","Desempenho precisa de expectativa, recursos, acompanhamento e consequência.","Diagnostique se uma entrega fraca decorre de clareza, capacidade, condição ou compromisso."),
 t("Definição de expectativas","Pessoas não conseguem entregar consistentemente aquilo que nunca foi explicitado.","Escreva uma expectativa com resultado, qualidade, prazo e critérios de sucesso."),
 t("Metas e acompanhamento","Metas orientam atenção quando são compreensíveis e acompanhadas com dados.","Transforme uma meta ampla em marcos e indicadores de curto prazo."),
 t("Feedback profissional","Feedback conecta comportamento observável, impacto e desenvolvimento.","Prepare um feedback baseado em evidências, sem rótulos pessoais."),
 t("Feedback corretivo","Corrigir exige firmeza sobre o padrão e abertura para compreender causas.","Estruture uma conversa sobre comportamento inadequado com limite e próximo passo."),
 t("Feedback de desenvolvimento","Desenvolver é ampliar capacidade futura, não apenas avaliar o passado.","Identifique uma competência e proponha experiência prática, apoio e revisão."),
 t("Plano de melhoria de desempenho","Um plano eficaz define problema, expectativa, suporte, prazo e evidências.","Construa um plano de 30 dias para um caso de desempenho abaixo do esperado.")]),
mod(5,"Conflitos e Situações Difíceis","Analise um conflito de equipe e apresente diagnóstico, intervenção, acordo e forma de acompanhamento.",[
 t("Origem dos conflitos","Conflitos podem nascer de interesse, recurso, papel, comunicação, valor ou relacionamento.","Classifique um conflito antes de escolher como intervir."),
 t("Tipos de conflito","Nem todo conflito é destrutivo; divergências de tarefa podem melhorar decisões.","Diferencie conflito produtivo de conflito relacional e escolha respostas distintas."),
 t("Identificação precoce","Sinais pequenos costumam aparecer antes da ruptura aberta.","Observe mudanças de comunicação, cooperação, atrasos e formação de alianças."),
 t("Mediação","Mediar é criar condições para entendimento e acordo sem decidir tudo pelas partes.","Estruture abertura, versões, interesses, opções e compromissos de uma mediação."),
 t("Negociação","Negociação responsável procura critérios e interesses além de posições rígidas.","Prepare alternativas, limites e pontos de troca antes de uma negociação."),
 t("Comportamentos difíceis","O líder deve trabalhar com comportamentos observáveis, não diagnósticos pessoais.","Descreva um comportamento problemático, seu impacto e o padrão esperado."),
 t("Limites profissionais","Limites protegem respeito, responsabilidade e funcionamento da equipe.","Defina como responder a uma violação recorrente sem humilhar nem normalizar."),
 t("Pressão e crises","Crises exigem prioridade, comunicação curta e revisão frequente de informação.","Monte uma sequência de decisão para as primeiras horas de uma situação crítica."),
 t("Decisões difíceis","Algumas decisões têm custos inevitáveis e precisam de critérios explícitos.","Compare opções por impacto, risco, justiça, viabilidade e reversibilidade."),
 t("Reconstrução após conflitos","Encerrar uma discussão não significa restaurar confiança automaticamente.","Crie acordos de reparação, comportamento futuro e acompanhamento.")]),
mod(6,"Gestão de Pessoas e Desenvolvimento de Talentos","Crie um plano de desenvolvimento individual com competência-alvo, experiências, apoio, prazo e evidências de evolução.",[
 t("Fundamentos da gestão de pessoas","Gestão de pessoas conecta estratégia, experiência do colaborador e capacidade de entrega.","Mapeie decisões de pessoas que pertencem ao líder e as que exigem parceria com RH."),
 t("Identificação de competências","Competências precisam ser observadas em comportamentos e resultados.","Converta uma competência abstrata em evidências que possam ser acompanhadas."),
 t("Potencial profissional","Potencial não é promessa; é hipótese sustentada por aprendizagem, desempenho e contexto.","Avalie potencial sem confundir visibilidade, afinidade ou tempo de empresa com capacidade."),
 t("Desenvolvimento de talentos","Desenvolvimento combina desafio, prática, feedback e reflexão.","Escolha uma experiência real de trabalho capaz de desenvolver uma competência."),
 t("Plano de desenvolvimento individual","Um PDI precisa ser pequeno o suficiente para ser executado.","Defina objetivo, ação, recurso, prazo e indicador para um colaborador."),
 t("Integração de novos profissionais","Onboarding reduz incerteza e acelera pertencimento e produtividade.","Desenhe os primeiros 30 dias de um novo integrante da equipe."),
 t("Retenção","Retenção sustentável começa por entender por que pessoas ficam e por que saem.","Planeje uma conversa de permanência e identifique fatores controláveis pelo líder."),
 t("Sucessão","Sucessão reduz dependência de pessoas-chave e prepara continuidade.","Identifique funções críticas e experiências necessárias para possíveis sucessores."),
 t("Desenvolvimento de futuros líderes","Preparar líderes exige oportunidades reais de decisão e responsabilidade.","Crie uma trilha prática para alguém assumir progressivamente funções de liderança."),
 t("Cultura de aprendizagem contínua","Equipes aprendem quando erro analisável vira informação e conhecimento circula.","Crie um ritual de revisão de aprendizados sem cultura de culpa.")]),
mod(7,"Liderança e RH na Prática","Resolva um caso completo de contratação, integração e acompanhamento inicial sob a perspectiva do líder.",[
 t("Relação entre liderança e RH","Líder e RH possuem responsabilidades complementares na experiência do colaborador.","Separe decisões do gestor, suporte de RH e pontos que exigem atuação conjunta."),
 t("Participação do líder no recrutamento","O líder traduz necessidades do trabalho em critérios de seleção.","Construa um briefing de vaga baseado em resultados e competências essenciais."),
 t("Entrevistas e seleção","Entrevistas melhores usam critérios consistentes e evidências comportamentais.","Prepare perguntas ligadas ao trabalho e uma forma comparável de registrar respostas."),
 t("Integração e onboarding","O líder é decisivo para transformar admissão em pertencimento e clareza.","Planeje apresentação, expectativas, primeiras entregas e pontos de acompanhamento."),
 t("Acompanhamento do período inicial","Os primeiros meses precisam de feedback frequente e critérios explícitos.","Monte revisões de 7, 30, 60 e 90 dias para um novo colaborador."),
 t("Avaliação de desempenho","Avaliar exige evidências, contexto e critérios conhecidos previamente.","Separe resultados, comportamentos, desenvolvimento e fatores externos na avaliação."),
 t("Absenteísmo e problemas de desempenho","Ausências e queda de entrega precisam ser tratadas com dados, respeito e políticas aplicáveis.","Prepare uma conversa que investigue fatos sem fazer suposições indevidas."),
 t("Retenção de profissionais","O líder influencia reconhecimento, crescimento, clareza e qualidade das relações.","Identifique riscos de saída e ações legítimas de retenção."),
 t("Desligamentos profissionais","Desligamentos exigem respeito, clareza, documentação e alinhamento com políticas e legislação aplicável.","Planeje uma comunicação objetiva que preserve dignidade e segurança do processo."),
 t("Experiência do colaborador","A experiência é formada por inúmeros pontos de contato, não apenas benefícios.","Mapeie momentos críticos da jornada e escolha dois para melhorar.")]),
mod(8,"Liderança Estratégica e Transformação","Construa um plano de mudança organizacional com objetivo, partes interessadas, comunicação, riscos e indicadores.",[
 t("Pensamento estratégico","Pensar estrategicamente conecta contexto, escolhas, recursos e consequências futuras.","Diferencie urgência operacional de decisão que muda direção ou capacidade."),
 t("Tomada de decisão","Boas decisões combinam informação suficiente, critérios e responsabilidade.","Use uma matriz simples para comparar alternativas sem buscar certeza impossível."),
 t("Priorização","Priorizar significa escolher o que não será feito agora.","Classifique demandas por impacto, urgência, esforço e alinhamento estratégico."),
 t("Gestão de mudanças","Mudança precisa de motivo compreensível, capacidade e acompanhamento.","Mapeie quem será afetado, o que precisa mudar e quais recursos serão necessários."),
 t("Resistência às mudanças","Resistência pode carregar informação sobre medo, perda, dúvida ou falha de desenho.","Investigue a causa antes de rotular pessoas como resistentes."),
 t("Cultura organizacional","Cultura aparece no que é recompensado, tolerado e repetido.","Compare valores declarados com comportamentos realmente incentivados."),
 t("Liderança multicultural","Contextos culturais diferentes alteram expectativas sobre hierarquia, comunicação e decisão.","Prepare uma reunião considerando estilos culturais sem transformar diferenças em estereótipos."),
 t("Liderança em ambientes internacionais","Equipes internacionais exigem clareza sobre idioma, fuso, legislação e contexto local.","Crie acordos operacionais para uma equipe distribuída em países diferentes."),
 t("Tecnologia e inteligência artificial na gestão","IA pode apoiar análise e produtividade, mas responsabilidade humana, privacidade e julgamento permanecem essenciais.","Liste tarefas que podem receber apoio de IA e decisões que exigem revisão humana explícita."),
 t("Liderança do futuro","O futuro da liderança combina aprendizagem contínua, adaptabilidade, ética e capacidade de desenvolver pessoas.","Escreva um plano pessoal de competências para os próximos dois anos.")]),
mod(9,"Prática e Formação do Líder","Entregue um plano completo de liderança e gestão de pessoas com diagnóstico, objetivos, comunicação, desenvolvimento, desempenho, conflitos, indicadores e plano de ação.",[
 t("Diagnóstico de uma equipe","Diagnóstico antecede intervenção e precisa combinar dados, observação e escuta.","Analise propósito, papéis, relações, desempenho, capacidade e contexto de uma equipe simulada."),
 t("Identificação de problemas prioritários","Sintomas visíveis podem ter causas diferentes.","Transforme queixas genéricas em problemas observáveis e escolha o que deve ser tratado primeiro."),
 t("Construção do plano de liderança","Um plano conecta diagnóstico, objetivo, comportamento do líder e rotina de acompanhamento.","Defina três prioridades de liderança para um ciclo de 90 dias."),
 t("Simulação de reunião de equipe","Reuniões precisam produzir informação, decisão ou coordenação.","Prepare pauta, papéis, tempo, decisões esperadas e registro de compromissos."),
 t("Simulação de feedback","A prática revela dificuldades que a teoria não mostra.","Escreva e ensaie uma conversa com fato, impacto, escuta, expectativa e acordo."),
 t("Simulação de gestão de conflito","O líder precisa sustentar neutralidade de processo sem fugir de responsabilidades.","Conduza em papel uma mediação com duas versões divergentes e um acordo verificável."),
 t("Desenvolvimento de um colaborador","Desenvolver alguém exige objetivo e oportunidades reais de prática.","Monte um PDI e uma sequência de experiências para um caso simulado."),
 t("Decisão estratégica aplicada","Decisões estratégicas precisam explicitar critérios, riscos e trade-offs.","Compare três alternativas e registre por que uma delas será escolhida."),
 t("Plano de 90 dias como líder","Os primeiros 90 dias devem equilibrar diagnóstico, relações, entregas e aprendizagem.","Organize prioridades para dias 1–30, 31–60 e 61–90."),
 t("Projeto final: liderança e gestão de pessoas","O projeto final integra toda a formação em uma proposta coerente e aplicável.","Finalize diagnóstico, equipe, objetivos, comunicação, desenvolvimento, desempenho, conflitos, indicadores, prioridades e plano de ação; revise coerência e registre aprendizados finais.")])
];

export const LEADERSHIP_TOTAL_LESSONS=leadershipPeopleModules.reduce((n,m)=>n+m.lessons.length,0);
export const leadershipLessonIndex=leadershipPeopleModules.flatMap((m,mi)=>m.lessons.map((l,li)=>({moduleIndex:mi,lessonIndex:li,lesson:l})));
