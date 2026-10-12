# LDR Academy — execução paralela dos 120 cursos (controle de qualidade)

> **Estado:** produção editorial em curso, não conclusão. Documento de coordenação; não publica cursos, não altera preços, assinaturas, autenticação, banco de dados ou certificados.

## Frentes independentes

| Frente | Quantidade | Identificação | Responsabilidade de revisão |
|---|---:|---|---|
| CC | 30 | CC-001 a CC-030 | Segurança, normas e cálculos de construção |
| TEC | 30 | TEC-001 a TEC-030 | Código executável, testes e segurança |
| BEL | 10 | BEL-001 a BEL-010 | Limites de práticas não invasivas |
| HOT | 10 | HOT-001 a HOT-010 | Operação hoteleira e proteção de dados |
| GAS | 10 | GAS-001 a GAS-010 | Higiene alimentar e custos |
| EDU | 10 | EDU-001 a EDU-010 | Pedagogia, acessibilidade e avaliação |
| SAU | 10 | SAU-001 a SAU-010 | Segurança, evidências e limites legais |
| PSI | 10 | PSI-001 a PSI-010 | Ética, evidências e encaminhamento |
| **Total** | **120** | | |

**Paralelismo:** cada frente pode redigir e revisar materiais de forma independente. O integrador só registra um curso quando sua validação individual passar; não se deve abrir 120 formações vazias para simular entrega.

## Contrato de entrega por curso

Cada registro individual deve conter:
- Código único da frente, slug e título verificados contra **todo o catálogo existente** e contra as outras 119 propostas.
- Público-alvo, pré-requisitos, objetivos verificáveis e escopo profissional/legal.
- Duração escolhida por evidência: 60, 120 ou 240 horas, ou 600 horas para cursos cujo escopo previamente aprovado exigir isso.
- Mapa de horas por módulo: leitura guiada, conteúdo, prática, avaliações e projeto, com soma exata; não atribuir horas por quantidade de parágrafos.
- Aulas escritas especificamente para o assunto, casos técnicos próprios, exercícios verificáveis, gabaritos/rubricas e referências reais.
- Projeto final, revisão humana, acessibilidade e mídias licenciadas; traduções PT/EN/FR/ES revisadas quando requeridas.
- Testes de execução do conteúdo técnico quando aplicável, navegação, autorização, progresso, pagamento e regressão.

## Máquina de estados obrigatória

`proposto → deduplicado → currículo aprovado → aulas redigidas → exercícios testados → revisão editorial → integração isolada → testes de produto → pronto para publicação → publicado`

Nenhum estado pode ser pulado. **Publicação exige evidência**, não apenas uma marcação booleana. Revisões rejeitadas retornam à etapa anterior.

## Distribuição de trabalho e integração

1. Fazer inventário do catálogo legado e de cada arquivo de catálogo importado; identificar sobreposições temáticas e nomes.
2. Reservar os 120 identificadores de trabalho acima; escolher slugs **somente após deduplicação**.
3. Trabalhar simultaneamente nas oito frentes, mantendo arquivos autorais separados por curso e mudanças pequenas, verificáveis e reversíveis.
4. Criar testes próprios por curso e uma validação de catálogo que falhe com slug duplicado, aulas repetidas ou horas inconsistentes.
5. Revisar conteúdos clínicos, técnicos e de segurança por profissionais competentes antes de integrar.
6. Integrar apenas cursos aprovados na biblioteca, preservando acesso e histórico de usuários.
7. Publicar via GitHub/Render após build, testes, revisão e aprovação; confirmar comportamento real em produção.

## Evidências existentes em 13/10/2026

- **Construção:** cinco currículos iniciais de obras; um curso com 14 aulas autorais em rascunho de 144 previstas, não publicado.
- **Tecnologia:** curso SQL de 60h com 12 unidades redigidas em documentos e nove aulas estruturadas em TypeScript; testes SQL e integração ainda pendentes.
- **Demais frentes:** nenhuma formação completa demonstrada nesta branch.
- **Publicação da expansão:** zero novos cursos confirmados em produção.

## Critérios de bloqueio

- Conteúdo repetido, genérico ou copiado sem direito de uso.
- Slug duplicado ou título que induza equivalência profissional não conferida.
- Carga horária sem plano de atividades demonstrável.
- Ausência de teste para exercícios executáveis.
- Referências inventadas, mídia sem licença ou tradução automática sem revisão.
- Ausência de validação dos direitos de acesso e de certificação.

**Esta matriz viabiliza a coordenação das frentes, mas não equivale à criação ou conclusão dos 120 cursos.**
