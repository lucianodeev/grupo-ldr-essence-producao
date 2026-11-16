# Atendimento ao Cliente com Humanização e Resultado
## Unidade 4 — Investigar reclamações recorrentes e prevenir reincidências

**Estado:** conteúdo editorial original para revisão, não integrado nem publicado. A carga horária permanece por validar.

### Competências a demonstrar

O participante deverá distinguir reclamação individual de padrão recorrente; definir uma unidade de análise antes de calcular frequências; separar sintoma, causa possível e causa confirmada; testar uma hipótese com evidência operacional; propor uma intervenção com responsável e critério de verificação; e comunicar ao cliente uma melhoria sem prometer que nunca haverá nova falha.

### Aula 1 — Contar reclamações exige saber o que está a ser contado

Uma equipa recebe vinte mensagens sobre problemas de acesso durante uma semana. É tentador anunciar «vinte falhas», mas cinco mensagens podem ter vindo da mesma pessoa, que escreveu novamente porque não obteve resposta. Também pode haver três clientes afetados pelo mesmo incidente e dez casos distintos com sintomas parecidos. A contagem de mensagens mede volume de contacto, não necessariamente pessoas afetadas, incidentes técnicos ou falhas independentes. Antes de apresentar uma taxa, o analista deve escolher a unidade: mensagens, casos únicos, clientes únicos, transações ou sessões afetadas. Cada uma responde a uma pergunta diferente.

A deduplicação não pode apagar a experiência do cliente. Se alguém precisou de contactar quatro vezes pelo mesmo problema, há um único caso operacional, mas quatro contactos que revelam esforço adicional e possível deficiência de acompanhamento. Por isso, um painel útil pode apresentar simultaneamente «casos únicos» e «contactos por caso». Não é correto fundir casos apenas porque possuem a mesma palavra-chave. «Não consigo entrar» pode representar senha incorreta, acesso ainda não ativado ou indisponibilidade geral. Agrupar sintomas serve para investigar, não para declarar causas idênticas.

Também é preciso definir o período e a população de referência. Cinco reclamações em cinquenta acessos e cinco em cinco mil acessos representam proporções diferentes, mas uma proporção isolada ainda não prova qualidade ou satisfação. A equipa precisa de saber se os acessos são comparáveis, se houve mudança no canal de contacto e se a recolha de dados é consistente. A ausência de reclamações pode significar que tudo funcionou; também pode significar que o canal de suporte estava inacessível. Um indicador nunca deve substituir a análise do contexto.

### Aula 2 — Sintoma, hipótese e causa confirmada

Considere a reclamação «o botão de entrar não funciona». O sintoma é observável do ponto de vista da pessoa, mas a frase não revela o mecanismo. O atendente pode verificar a mensagem apresentada, o horário e o ambiente de utilização com consentimento e sem solicitar senhas. A equipa técnica pode consultar registos autorizados para avaliar se houve erro de autenticação, problema de rede, sessão expirada ou outra condição. Até existir evidência suficiente, essas explicações são hipóteses. Afirmar «o cliente utilizou o navegador errado» sem teste pode gerar uma correção inadequada e culpabilizar quem pediu ajuda.

Uma investigação pequena pode usar a sequência **observação → hipótese → teste → conclusão provisória**. A observação é «sete casos únicos relataram erro 403 depois de um lançamento». A hipótese é «uma regra de autorização alterada no lançamento bloqueou contas que deveriam ter acesso». O teste consiste em reproduzir a situação num ambiente autorizado, comparar permissões esperadas e efetivas e consultar registos pertinentes. A conclusão só se torna confirmada quando os resultados sustentam o mecanismo. Se o teste falhar, a equipa documenta a hipótese rejeitada e procura outra, em vez de ajustar a narrativa para proteger a primeira ideia.

Perguntar «porquê?» várias vezes pode ajudar a explorar relações, mas não transforma automaticamente uma cadeia de suposições em prova. «O cliente reclamou porque a interface é confusa; a interface é confusa porque o texto é pequeno; o texto é pequeno porque o projeto não considerou acessibilidade» contém afirmações que precisam de verificação independente. Uma investigação responsável identifica evidência, fonte, limitação e responsável por cada conclusão. Pode haver mais de uma causa contribuinte: um erro de permissão e uma mensagem pouco clara podem coexistir.

### Aula 3 — Melhorar o processo sem apagar o histórico

Depois de identificar uma causa provável, a organização precisa de escolher uma ação que ataque o mecanismo, não apenas a aparência da reclamação. Se os clientes não recebem atualização após uma transferência, aumentar o número de respostas automáticas pode criar mais mensagens sem resolver a falta de responsável. Uma intervenção melhor pode exigir que cada caso transferido tenha destinatário, confirmação de receção e ponto de revisão. O teste deve observar se os casos continuam sem retorno, e não apenas se a nova mensagem foi enviada.

Uma ação de melhoria precisa de cinco elementos: **problema delimitado**, **mudança concreta**, **responsável**, **data de verificação** e **medida de resultado**. «Melhorar a comunicação» é amplo demais para testar. «Durante duas semanas, verificar diariamente se os casos transferidos receberam confirmação de responsável até ao fim do turno» é uma proposta operacional delimitada, desde que o turno e a política do serviço sejam conhecidos. O resultado deve incluir possíveis efeitos indesejados: a confirmação pode melhorar enquanto o tempo até à solução continua elevado.

Uma correção técnica pode ser implementada e ainda assim exigir acompanhamento. A equipa deve distinguir correção aplicada, correção validada em teste, recuperação observada em produção e confirmação de resolução de casos individuais. Esses estados não são sinónimos. Também não se deve apagar registos antigos para fazer a taxa parecer melhor. A análise longitudinal depende de preservar definições, versões de processo e mudanças na forma de recolher dados, respeitando os prazos de conservação e as regras de privacidade.

### Caso integrado — Biblioteca fictícia Farol

Na primeira semana de junho, a Biblioteca Farol registou 120 tentativas de acesso de 80 contas distintas. Recebeu 18 mensagens sobre acesso, associadas a 9 casos únicos e 7 contas. Quatro dos nove casos foram abertos após uma atualização de permissões na quarta-feira. Dois desses quatro apresentam o mesmo código de erro 403. A equipa ainda não reproduziu a falha. Os restantes cinco casos incluem dúvidas sobre planos e recuperação de senha. Os números são fictícios e não representam a plataforma LDR.

A equipa de atendimento apresenta inicialmente «15% dos acessos falharam», dividindo 18 mensagens por 120 tentativas. A conclusão está errada: o numerador conta mensagens e o denominador conta tentativas. Além disso, não se sabe quantas tentativas falharam. A proporção de casos únicos relativamente às contas distintas seria 9/80, ou 11,25%, mas nem isso mede uma taxa de contas afetadas, pois alguns casos podem pertencer à mesma conta. A proporção de contas com reclamação registada é 7/80, ou 8,75%, e descreve apenas essa população e esse período. Não mede satisfação, taxa de falha nem causa técnica.

Um segundo erro seria declarar que a atualização de permissões causou os nove casos. Há coincidência temporal para quatro e um código de erro partilhado em dois, mas a relação causal continua por testar. A investigação pode comparar a versão de permissões antes e depois, reproduzir o comportamento numa conta de teste e verificar os registos autorizados. Se o teste confirmar a hipótese, a correção deve ser validada antes de comunicar resolução. Se não confirmar, a equipa deve manter aberta a investigação.

O responsável propõe duas medidas: verificar a autorização com contas de teste antes de futuras atualizações e acrescentar uma confirmação de receção às transferências para a equipa técnica. A primeira pretende reduzir falhas introduzidas por mudanças; a segunda pretende diminuir a incerteza de acompanhamento. Não se deve usar um único indicador para avaliar ambas. Para a primeira, observar erros de autorização reproduzidos em testes e incidentes confirmados após alterações. Para a segunda, observar casos transferidos sem responsável confirmado e contactos repetidos por ausência de retorno.

### Exercício — Reconstruir uma análise auditável

1. Produza uma tabela com cinco linhas: mensagens recebidas, casos únicos, contas reclamantes, tentativas de acesso e contas distintas. Registe respetivamente 18, 9, 7, 120 e 80. Indique a unidade de cada linha e uma conclusão que **não** pode ser extraída.
2. Calcule 7/80 e explique exatamente o que representa. Não apresente o valor como «taxa de falha».
3. Escreva duas hipóteses distintas para os erros 403 e indique uma evidência que poderia confirmar ou rejeitar cada uma. Não solicite credenciais reais.
4. Redija uma proposta de melhoria com responsável funcional, ação observável, período de verificação e dois indicadores adequados. Identifique uma consequência indesejada possível.
5. Prepare uma mensagem ao cliente que diga que a equipa está a investigar relatos de acesso e que haverá atualização pelo canal de suporte, sem afirmar que a causa já foi encontrada.

### Avaliação e respostas comentadas

**Pergunta 1.** É correto dividir 18 mensagens por 120 tentativas e chamar ao resultado taxa de falha?  
**Resposta:** Não. São unidades diferentes; mensagens repetidas não equivalem a tentativas falhadas.

**Pergunta 2.** O que significa 7/80 = 8,75%?  
**Resposta:** Sete das oitenta contas distintas registaram reclamação no período, segundo o conjunto de dados apresentado. Não significa que 8,75% dos acessos tenham falhado.

**Pergunta 3.** A coincidência com uma atualização confirma a causa?  
**Resposta:** Não. É um indício temporal que orienta um teste, mas não demonstra por si só o mecanismo.

**Pergunta 4.** Uma confirmação automática de transferência prova que o caso foi resolvido?  
**Resposta:** Não. Confirmação de receção, atribuição de responsável e resolução são eventos diferentes.

**Pergunta 5.** Como comunicar uma melhoria sem garantia excessiva?  
**Resposta:** Descrever a mudança aplicada e a verificação realizada, indicar o que continua em acompanhamento e evitar expressões como «o problema nunca mais ocorrerá».

**Rubrica:** unidades e denominadores coerentes; hipótese separada de causa; intervenção relacionada ao mecanismo; medidas independentes para correção e acompanhamento; ausência de dados sensíveis; comunicação sem garantias infundadas.

### Limites e continuidade

O caso e os números são inteiramente fictícios. Não se trata de auditoria de incidentes reais nem de certificação de métricas da Biblioteca LDR. Qualquer implementação futura exigirá revisão técnica, pedagógica, privacidade, acessibilidade e validação de carga horária. A unidade seguinte poderá abordar recuperação de confiança após falhas e acompanhamento pós-resolução, com foco em ações verificáveis e não em promessas de satisfação.

**Revisões pendentes:** especialistas operacionais, pedagógicos e de privacidade; leitores; adequação de métricas; duração.
