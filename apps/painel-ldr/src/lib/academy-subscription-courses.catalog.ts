export type AcademyLocale = "pt" | "en" | "fr" | "es";

type I18nText = Record<AcademyLocale, string>;
export type SubscriptionCourseModule = {title:string;topics:string[];activity:string;};
export type SubscriptionCourse = {
  slug:string;
  productKey:string;
  category:"comportamento"|"gestao"|"marketing"|"educacao"|"direito"|"psicanalise";
  track:string;
  hours:number;
  certificate:true;
  subscriptionOnly:true;
  name:I18nText;
  description:I18nText;
  modules:SubscriptionCourseModule[];
  materials:string[];
  disclaimer?:I18nText;
};

const i18n=(text:string):I18nText=>({pt:text,en:text,fr:text,es:text});

type CourseRow={slug:string;productKey:string;category:SubscriptionCourse["category"];track:string;hours:number;title:string;focus:string};

const rawCourses = `como-se-preparar-para-uma-entrevista-de-emprego|curso_assinatura_como_se_preparar_para_uma_entrevista_de_emprego|gestao|Primeiro Emprego|80|Como se Preparar para uma Entrevista de Emprego|preparação para entrevistas
redacao-profissional-e-escrita-para-processos-seletivos|curso_assinatura_redacao_profissional_e_escrita_para_processos_seletivos|educacao|Comunicação, Redação e Oratória|100|Redação Profissional e Escrita para Processos Seletivos|redação profissional
orientacao-de-carreira|curso_assinatura_orientacao_de_carreira|gestao|Desenvolvimento Pessoal e Vida Profissional|120|Orientação de Carreira|orientação de carreira
auxiliar-de-escritorio|curso_assinatura_auxiliar_de_escritorio|gestao|Escritório e Administração|160|Auxiliar de Escritório|rotinas de auxiliar de escritório
como-ganhar-dinheiro-com-inteligencia-artificial|curso_assinatura_como_ganhar_dinheiro_com_inteligencia_artificial|marketing|Inteligência Artificial Aplicada|120|Como Ganhar Dinheiro com Inteligência Artificial|uso ético da IA para criar valor
como-vender-produtos-e-servicos-com-estrategia|curso_assinatura_como_vender_produtos_e_servicos_com_estrategia|marketing|Vendas e Produtos Digitais|140|Como Vender Produtos e Serviços com Estratégia|vendas com estratégia
como-selecionar-a-vaga-certa-para-o-seu-perfil|curso_assinatura_como_selecionar_a_vaga_certa_para_o_seu_perfil|gestao|Primeiro Emprego|80|Como Selecionar a Vaga Certa para o Seu Perfil|seleção consciente de vagas
orientacao-de-carreira-internacional|curso_assinatura_orientacao_de_carreira_internacional|gestao|Carreira Internacional|160|Orientação de Carreira Internacional|carreira internacional
raciocinio-logico-para-estudos-concursos-e-selecoes|curso_assinatura_raciocinio_logico_para_estudos_concursos_e_selecoes|educacao|Estudos, Raciocínio e Conhecimentos Gerais|120|Raciocínio Lógico para Estudos, Concursos e Seleções|raciocínio lógico
conhecimentos-gerais-para-vida-academica-e-profissional|curso_assinatura_conhecimentos_gerais_para_vida_academica_e_profissional|educacao|Estudos, Raciocínio e Conhecimentos Gerais|120|Conhecimentos Gerais para Vida Acadêmica e Profissional|conhecimentos gerais
curriculo-estrategico-como-apresentar-sua-historia-profissional|curso_assinatura_curriculo_estrategico_como_apresentar_sua_historia_profissional|gestao|Recolocação Profissional|80|Currículo Estratégico: Como Apresentar sua História Profissional|currículo estratégico
linkedin-profissional-perfil-networking-e-oportunidades|curso_assinatura_linkedin_profissional_perfil_networking_e_oportunidades|marketing|Recolocação Profissional|80|LinkedIn Profissional: Perfil, Networking e Oportunidades|LinkedIn profissional
comunicacao-profissional-para-o-mercado-de-trabalho|curso_assinatura_comunicacao_profissional_para_o_mercado_de_trabalho|comportamento|Comunicação, Redação e Oratória|100|Comunicação Profissional para o Mercado de Trabalho|comunicação profissional
atendimento-ao-cliente-com-humanizacao-e-resultado|curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado|gestao|Escritório e Administração|120|Atendimento ao Cliente com Humanização e Resultado|atendimento ao cliente
assistente-administrativo-na-pratica|curso_assinatura_assistente_administrativo_na_pratica|gestao|Escritório e Administração|180|Assistente Administrativo na Prática|assistência administrativa
rotinas-de-escritorio-e-organizacao-administrativa|curso_assinatura_rotinas_de_escritorio_e_organizacao_administrativa|gestao|Escritório e Administração|160|Rotinas de Escritório e Organização Administrativa|organização administrativa
introducao-ao-departamento-pessoal|curso_assinatura_introducao_ao_departamento_pessoal|gestao|Escritório e Administração|140|Introdução ao Departamento Pessoal|departamento pessoal
nocoes-de-recursos-humanos-para-iniciantes|curso_assinatura_nocoes_de_recursos_humanos_para_iniciantes|gestao|Escritório e Administração|120|Noções de Recursos Humanos para Iniciantes|recursos humanos para iniciantes
inteligencia-artificial-para-estudantes-e-profissionais|curso_assinatura_inteligencia_artificial_para_estudantes_e_profissionais|marketing|Inteligência Artificial Aplicada|100|Inteligência Artificial para Estudantes e Profissionais|IA para estudo e trabalho
como-criar-produtos-digitais-do-zero|curso_assinatura_como_criar_produtos_digitais_do_zero|marketing|Vendas e Produtos Digitais|160|Como Criar Produtos Digitais do Zero|criação de produtos digitais
como-divulgar-um-produto-na-internet|curso_assinatura_como_divulgar_um_produto_na_internet|marketing|Vendas e Produtos Digitais|120|Como Divulgar um Produto na Internet|divulgação digital
como-fazer-uma-proposta-comercial-profissional|curso_assinatura_como_fazer_uma_proposta_comercial_profissional|marketing|Empreendedorismo Realista|100|Como Fazer uma Proposta Comercial Profissional|proposta comercial
como-conduzir-reunioes-e-apresentacoes-com-seguranca|curso_assinatura_como_conduzir_reunioes_e_apresentacoes_com_seguranca|comportamento|Comunicação, Redação e Oratória|100|Como Conduzir Reuniões e Apresentações com Segurança|reuniões e apresentações
como-sair-da-ideia-e-chegar-ao-primeiro-cliente|curso_assinatura_como_sair_da_ideia_e_chegar_ao_primeiro_cliente|marketing|Empreendedorismo Realista|160|Como Sair da Ideia e Chegar ao Primeiro Cliente|primeiro cliente
empreendedorismo-para-quem-esta-comecando-do-zero|curso_assinatura_empreendedorismo_para_quem_esta_comecando_do_zero|gestao|Empreendedorismo Realista|180|Empreendedorismo para Quem Está Começando do Zero|empreendedorismo inicial
organizacao-pessoal-e-gestao-do-tempo|curso_assinatura_organizacao_pessoal_e_gestao_do_tempo|comportamento|Desenvolvimento Pessoal e Vida Profissional|80|Organização Pessoal e Gestão do Tempo|organização pessoal
produtividade-sem-ansiedade|curso_assinatura_produtividade_sem_ansiedade|comportamento|Desenvolvimento Pessoal e Vida Profissional|80|Produtividade sem Ansiedade|produtividade saudável
planejamento-de-estudos-para-adultos|curso_assinatura_planejamento_de_estudos_para_adultos|educacao|Estudos, Raciocínio e Conhecimentos Gerais|100|Planejamento de Estudos para Adultos|planejamento de estudos
tecnicas-de-aprendizagem-e-memorizacao|curso_assinatura_tecnicas_de_aprendizagem_e_memorizacao|educacao|Estudos, Raciocínio e Conhecimentos Gerais|100|Técnicas de Aprendizagem e Memorização|aprendizagem e memorização
escrita-academica-para-iniciantes|curso_assinatura_escrita_academica_para_iniciantes|educacao|Comunicação, Redação e Oratória|120|Escrita Acadêmica para Iniciantes|escrita acadêmica
como-fazer-apresentacoes-profissionais|curso_assinatura_como_fazer_apresentacoes_profissionais|comportamento|Comunicação, Redação e Oratória|100|Como Fazer Apresentações Profissionais|apresentações profissionais
oratoria-e-seguranca-para-falar-em-publico|curso_assinatura_oratoria_e_seguranca_para_falar_em_publico|comportamento|Comunicação, Redação e Oratória|120|Oratória e Segurança para Falar em Público|oratória
inteligencia-emocional-no-trabalho|curso_assinatura_inteligencia_emocional_no_trabalho|comportamento|Desenvolvimento Pessoal e Vida Profissional|100|Inteligência Emocional no Trabalho|inteligência emocional no trabalho
autoconhecimento-e-escolhas-profissionais|curso_assinatura_autoconhecimento_e_escolhas_profissionais|comportamento|Desenvolvimento Pessoal e Vida Profissional|100|Autoconhecimento e Escolhas Profissionais|autoconhecimento profissional
desenvolvimento-pessoal-para-vida-profissional|curso_assinatura_desenvolvimento_pessoal_para_vida_profissional|comportamento|Desenvolvimento Pessoal e Vida Profissional|120|Desenvolvimento Pessoal para Vida Profissional|desenvolvimento pessoal aplicado
como-lidar-com-rejeicao-em-processos-seletivos|curso_assinatura_como_lidar_com_rejeicao_em_processos_seletivos|comportamento|Recolocação Profissional|80|Como Lidar com Rejeição em Processos Seletivos|rejeição em processos seletivos
como-recomecar-profissionalmente|curso_assinatura_como_recomecar_profissionalmente|gestao|Recolocação Profissional|120|Como Recomeçar Profissionalmente|recomeço profissional
transicao-de-carreira-com-planejamento|curso_assinatura_transicao_de_carreira_com_planejamento|gestao|Recolocação Profissional|140|Transição de Carreira com Planejamento|transição de carreira
trabalho-remoto-e-organizacao-profissional|curso_assinatura_trabalho_remoto_e_organizacao_profissional|gestao|Carreira Internacional|100|Trabalho Remoto e Organização Profissional|trabalho remoto
atendimento-online-e-comunicacao-digital|curso_assinatura_atendimento_online_e_comunicacao_digital|gestao|Escritório e Administração|100|Atendimento Online e Comunicação Digital|atendimento online
vendas-pelo-whatsapp-e-redes-sociais|curso_assinatura_vendas_pelo_whatsapp_e_redes_sociais|marketing|Vendas e Produtos Digitais|120|Vendas pelo WhatsApp e Redes Sociais|vendas por WhatsApp e redes sociais
como-criar-uma-oferta-irresistivel-sem-promessas-falsas|curso_assinatura_como_criar_uma_oferta_irresistivel_sem_promessas_falsas|marketing|Vendas e Produtos Digitais|120|Como Criar uma Oferta Irresistível sem Promessas Falsas|oferta ética e forte
precificacao-para-servicos-e-produtos-digitais|curso_assinatura_precificacao_para_servicos_e_produtos_digitais|marketing|Empreendedorismo Realista|100|Precificação para Serviços e Produtos Digitais|precificação
educacao-financeira-basica-para-profissionais|curso_assinatura_educacao_financeira_basica_para_profissionais|gestao|Desenvolvimento Pessoal e Vida Profissional|100|Educação Financeira Básica para Profissionais|educação financeira básica
como-organizar-documentos-rotinas-e-metas|curso_assinatura_como_organizar_documentos_rotinas_e_metas|gestao|Escritório e Administração|80|Como Organizar Documentos, Rotinas e Metas|documentos, rotinas e metas
introducao-ao-marketing-digital-para-iniciantes|curso_assinatura_introducao_ao_marketing_digital_para_iniciantes|marketing|Vendas e Produtos Digitais|120|Introdução ao Marketing Digital para Iniciantes|marketing digital inicial
captacao-de-clientes-com-etica-e-estrategia|curso_assinatura_captacao_de_clientes_com_etica_e_estrategia|marketing|Empreendedorismo Realista|120|Captação de Clientes com Ética e Estratégia|captação ética de clientes
carreira-para-imigrantes-e-mercado-internacional|curso_assinatura_carreira_para_imigrantes_e_mercado_internacional|gestao|Carreira Internacional|160|Carreira para Imigrantes e Mercado Internacional|carreira para imigrantes
preparacao-para-bolsas-intercambios-e-oportunidades-academicas|curso_assinatura_preparacao_para_bolsas_intercambios_e_oportunidades_academicas|educacao|Carreira Internacional|140|Preparação para Bolsas, Intercâmbios e Oportunidades Acadêmicas|bolsas e intercâmbios
projeto-de-vida-trabalho-e-futuro-profissional|curso_assinatura_projeto_de_vida_trabalho_e_futuro_profissional|comportamento|Desenvolvimento Pessoal e Vida Profissional|160|Projeto de Vida, Trabalho e Futuro Profissional|projeto de vida e trabalho`;

const rows:CourseRow[]=rawCourses.trim().split("\n").map((line)=>{
  const [slug,productKey,category,track,hours,title,focus]=line.split("|");
  return {slug,productKey,category:category as CourseRow["category"],track,hours:Number(hours),title,focus};
});

const trackVoice:Record<string,string>={
  "Primeiro Emprego":"para transformar insegurança inicial em preparação concreta",
  "Recolocação Profissional":"para reorganizar trajetória, evidências e abordagem ao mercado",
  "Carreira Internacional":"para ler oportunidades fora do país com realismo, documentação e adaptação cultural",
  "Escritório e Administração":"para criar rotina, método e postura profissional em ambientes administrativos",
  "Inteligência Artificial Aplicada":"para usar tecnologia com ética, utilidade e revisão humana",
  "Vendas e Produtos Digitais":"para estruturar oferta, comunicação e venda sem promessas falsas",
  "Comunicação, Redação e Oratória":"para escrever, falar e apresentar ideias com clareza e presença",
  "Desenvolvimento Pessoal e Vida Profissional":"para organizar escolhas, limites e projetos sem substituir cuidado clínico",
  "Estudos, Raciocínio e Conhecimentos Gerais":"para estudar com método, repertório e pensamento crítico",
  "Empreendedorismo Realista":"para sair da ideia e construir entrega comercial com consistência",
};

const descriptionFor=(row:CourseRow)=>i18n(`${row.title} é um curso livre de ${row.hours} horas criado ${trackVoice[row.track]??"para apoiar uma jornada prática de aprendizagem"}. O percurso combina orientação objetiva, exercícios aplicados e materiais de apoio para que o aluno avance no próprio ritmo, com certificado ao final.`);

const moduleThemes=[
  ["Aula zero", "como aproveitar este curso sem pressa nem improviso", "Criar um compromisso simples de estudo e definir quando o conteúdo será aplicado."],
  ["Leitura do cenário", "o que está em jogo neste tema", "Mapear uma situação real ou simulada e separar fatos, expectativas e dúvidas."],
  ["Vocabulário essencial", "termos, critérios e limites de atuação", "Montar um glossário pessoal com os conceitos que mais aparecem na prática."],
  ["Diagnóstico de ponto de partida", "onde o aluno está antes de aplicar", "Preencher uma autoavaliação objetiva, sem julgamento e com evidências."],
  ["Método LDR de organização", "clareza, sequência e prioridade", "Organizar uma rotina de aplicação em três etapas: preparar, executar e revisar."],
  ["Comunicação do próprio valor", "como apresentar uma ideia sem exagero", "Escrever uma apresentação curta, direta e adequada ao contexto profissional."],
  ["Ferramentas práticas", "modelos, checklists e roteiros de execução", "Escolher uma ferramenta do curso e aplicar em um caso concreto."],
  ["Decisões e riscos", "como evitar atalhos, promessas e escolhas frágeis", "Listar riscos comuns e criar uma resposta segura para cada um deles."],
  ["Exercício guiado", "prática com orientação passo a passo", "Executar o exercício principal do módulo e registrar aprendizados."],
  ["Estudo de caso", "análise de uma situação parecida com a vida real", "Responder ao caso com diagnóstico, ação recomendada e justificativa."],
  ["Produção autoral", "criação de material próprio", "Criar um documento, roteiro ou plano que possa ser reutilizado depois."],
  ["Revisão com critérios", "como melhorar sem apagar a própria voz", "Revisar a entrega usando critérios de clareza, ética, utilidade e coerência."],
  ["Aplicação em contexto real", "adaptação ao trabalho, estudo ou negócio", "Adaptar o conteúdo para uma situação concreta da vida do aluno."],
  ["Projeto final", "síntese prática do percurso", "Entregar um plano final com objetivo, ação, prazo e indicador simples de avanço."],
  ["Fechamento", "aprendizado, certificado e continuidade", "Registrar os principais avanços e escolher o próximo curso ou trilha."],
] as const;

const modulesFor=(row:CourseRow):SubscriptionCourseModule[]=>moduleThemes.map(([title,topic,activity],idx)=>({
  title:idx===0?`${title}: antes de entrar em ${row.focus}`:`${title}: ${row.focus}`,
  topics:[topic, row.track, idx===14?`${row.hours}h de percurso com certificado`:`aplicação prática em ${row.focus}`],
  activity:activity.replace("o curso", row.title).replace("do módulo", `sobre ${row.focus}`),
}));

const materialsFor=(row:CourseRow)=>{
  const base={
    gestao:[`Mapa de decisão para ${row.focus}`,`Checklist de rotina para ${row.focus}`,`Plano de ação profissional em ${row.focus}`],
    marketing:[`Roteiro de oferta para ${row.focus}`,`Modelo de abordagem ética em ${row.focus}`,`Planilha simples de acompanhamento de ${row.focus}`],
    comportamento:[`Caderno reflexivo de ${row.focus}`,`Roteiro de autoavaliação para ${row.focus}`,`Plano de prática semanal em ${row.focus}`],
    educacao:[`Guia de estudo para ${row.focus}`,`Exercícios graduados de ${row.focus}`,`Checklist de revisão para ${row.focus}`],
    direito:[`Mapa conceitual de ${row.focus}`,`Checklist de leitura responsável`, `Roteiro de estudo de caso`],
    psicanalise:[`Roteiro de leitura conceitual`, `Mapa de autores e conceitos`, `Caderno de estudo crítico`],
  } as Record<SubscriptionCourse["category"],string[]>;
  return base[row.category];
};

const disclaimerFor=(slug:string):I18nText|undefined=>{
  if(slug.includes("ganhar-dinheiro")||slug.includes("precificacao")||slug.includes("captacao"))return i18n("Conteúdo educacional. Não promete renda, contrato, cliente ou resultado financeiro garantido.");
  if(slug.includes("ansiedade")||slug.includes("inteligencia-emocional")||slug.includes("produtividade-sem-ansiedade"))return i18n("Conteúdo educacional de desenvolvimento pessoal. Não substitui acompanhamento médico, psicológico ou psicoterapêutico.");
  if(slug.includes("financeira"))return i18n("Conteúdo educacional geral. Não constitui recomendação individualizada de investimento ou consultoria financeira.");
  return undefined;
};

export const ACADEMY_SUBSCRIPTION_COURSES:SubscriptionCourse[] = rows.map((row)=>({
  slug:row.slug,
  productKey:row.productKey,
  category:row.category,
  track:row.track,
  hours:row.hours,
  certificate:true,
  subscriptionOnly:true,
  name:i18n(row.title),
  description:descriptionFor(row),
  modules:modulesFor(row),
  materials:materialsFor(row),
  disclaimer:disclaimerFor(row.slug),
}));

export const ACADEMY_SUBSCRIPTION_TRACKS = Array.from(new Set(ACADEMY_SUBSCRIPTION_COURSES.map((course)=>course.track)));

export function getAcademySubscriptionCourse(slug:string){
  return ACADEMY_SUBSCRIPTION_COURSES.find((course)=>course.slug===slug)??null;
}

export function academySubscriptionCoursesByTrack(track:string){
  return ACADEMY_SUBSCRIPTION_COURSES.filter((course)=>course.track===track);
}
