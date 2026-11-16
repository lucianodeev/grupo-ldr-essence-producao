# Biblioteca: continuação após os PRs 302 e 310

Base: `e941d5d7c5c743509752b9ad592fe94ab1d71603`.

## Alterações desta etapa

- Título da biblioteca com cor clara explícita, para vencer a regra global escura de h1.
- Anúncio fixo mantido na página inicial e retirado da biblioteca, onde cobria os controlos.
- Exportador offline dos 20 cursos já redigidos para o formato do leitor Academy: 131 unidades.
- Preservados objetivos, texto, casos, atividades, respostas, critérios, referências, limites das fontes e dados complementares das simulações. Cada unidade leva SHA-256 do corpo convertido e da unidade original.
- O exportador não grava ficheiros, não publica, não atualiza o catálogo nem escreve na base de dados. `--stdout` permite obter JSON completo para revisão privada; não guardar esse resultado em assets públicos.
- Testes novos verificam os 131 conteúdos, a renderização do Markdown e o bloqueio de todos os rascunhos pelo leitor. Conversão técnica não equivale a aprovação pedagógica ou publicação.

## Evidência local

`node --test apps/painel-ldr/tests/library-academy-candidates.test.cjs apps/painel-ldr/tests/library-dashboard-render.test.cjs`: 4 testes passaram, sem falhas.

`node tools/prepare-course-academy-candidates.cjs`: 20 cursos, 131 unidades, zero publicados ou elegíveis para ativação.

## Pendências reais

Atendimento ao Cliente continua como a única nova edição de leitura publicada, com as seis unidades já aprovadas na etapa anterior. Sem certificado nem carga horária validada.

Os outros 20 cursos mantêm `review` a falso e as pendências específicas nos JSON originais. Por exemplo, Apoio Administrativo requer revisão dos processos por profissional de administração; Preparação para Entrevistas requer pilotagem da simulação e revisão contextual. Não existe evidência desses atos nesta etapa e o exportador não os marca como concluídos. Direitos, aprovação editorial e acessibilidade também permanecem por fechar.

Dos 50 cursos históricos de assinatura, 29 ainda não têm uma nova edição redigida em `editorial/courses` ou publicada como Atendimento. O eBook em `editorial/drafts` também permanece rascunho. Não foram criados textos superficiais para simular conclusão nem convertidas estimativas em horas certificadas.

Nenhuma alteração de Stripe, assinaturas, permissões, produtos, progresso dos alunos, certificados históricos ou base de dados nesta etapa.
