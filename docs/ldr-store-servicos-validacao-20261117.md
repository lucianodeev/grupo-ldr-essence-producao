# LDR Store e Serviços Profissionais

## Demonstração local

A implementação está isolada na branch `feat/ldr-store-servicos-20261117`. O serviço Render consultado acompanha a `main` e tem previews de PR desativados.

Na raiz do repositório, com Node.js 22 ou superior:

```sh
npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=5200 VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=placeholder npm --prefix apps/painel-ldr run build:render
HOST=127.0.0.1 PORT=3128 SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_PUBLISHABLE_KEY=placeholder SUPABASE_SERVICE_ROLE_KEY=local-fixture npm --prefix apps/painel-ldr run start:render
```

- [LDR Store](http://127.0.0.1:3128/loja). Pesquise `psicanalise autismo`, filtre por eBooks, mude para real e abra o detalhe. O leitor continua na Biblioteca.
- [Serviços Profissionais](http://127.0.0.1:3128/servicos-profissionais). Escolha Recrutamento e seleção para abrir o briefing específico. A equipa recebe o pedido na Área Master e a proposta segue pelo percurso existente em Minha Área.

Com a aplicação local acima em execução, outro terminal pode correr a demonstração automatizada. O teste inicia uma API de dados sintética em loopback, abre as duas vitrines e verifica o protocolo do pedido. Os pedidos são descartados no fim da execução.

```sh
npm install --prefix /tmp/ldr-demo-browser --no-audit --no-fund playwright@1.56.1
/tmp/ldr-demo-browser/node_modules/.bin/playwright install chromium --only-shell
LDR_DEMO_PLAYWRIGHT=/tmp/ldr-demo-browser/node_modules/playwright node tools/test-ldr-commerce-browser.cjs
```

## Integrações e preservação

- A loja reúne as 91 entradas da Academy vindas diretamente de `academy-unified-catalog.ts` e os 15 eBooks vindos do catálogo editorial. Mantém chaves, links de estudo e indicação LDR ONE. As rotas privadas, as regras de assinatura, as compras e o progresso da Academy foram preservados.
- Preços dos eBooks e do checkout vêm do mesmo catálogo. O checkout da loja requer sessão autenticada, opção local explícita, Supabase em loopback, chave Stripe de teste e edição completa. A confirmação exige um evento assinado com a sessão, a moeda e o valor do pedido. Um reembolso integral impede uma confirmação tardia.
- Integração de colaboradores, recrutamento, consultoria de RH e formação seguem por proposta. O formulário e o percurso de aceite e pagamento são os existentes. Para mentoria, a vitrine lê apenas as três ofertas elegíveis ativas, sem obter links de pagamento, e encaminha a contratação para Minha Área.
- O inventário em leitura no Supabase confirmou três ofertas ativas de mentoria (75 €, 243 € e 441 €) e RLS ativo nas seis tabelas consultadas de catálogo, pedidos, conteúdo, recibos e atendimento. A verificação de RLS nesta fase foi de estado das tabelas.
- Dos 15 eBooks com edição portuguesa ativa, nove coincidiram com a contagem do índice publicado. Quatro estão comprimidos e precisam de validação após descodificação no ambiente de testes. **Falar com Quem Feriu** e **Da Pobreza ao Primeiro Contrato** têm seis páginas armazenadas cada, enquanto o catálogo anuncia 20 capítulos. O checkout da loja bloqueia essas edições até a discrepância ser resolvida. Os acessos legados de leitura foram preservados.

## Resultados locais

| Verificação | Resultado |
| --- | --- |
| Typecheck | Aprovado |
| Build Render | Aprovado com heap de 5.200 MB |
| Unitários | 59 aprovados |
| Regressões | 300 aprovadas, incluindo quatro de loja e serviços |
| Webhook assinado | 29 aprovados, incluindo incompatibilidade de valor/sessão, modo live, duplicação e reembolso |
| Navegador Chromium | Desktop a 1.280 px e móvel a 390 px, com submissão e protocolo sintéticos |

## Prontidão para publicação

A demonstração local e os eventos sintéticos validam o fluxo de navegação, entrada comercial e confirmação de pagamento. Falta executar o ciclo completo com uma conta de testes, Supabase local e Stripe em modo de teste, desde a criação de uma sessão até abrir o leitor depois do evento assinado e perder o direito de compra após reembolso. Use uma obra verificada e uma conta sem assinatura para isolar o teste de compra avulsa. Para o teste de serviços, aceite uma proposta de teste e confirme o pedido pela Área Master e Minha Área antes de verificar agenda.

Para habilitar apenas o checkout isolado, configure `LDR_STORE_SANDBOX_ENABLED=true`, `CLIENT_PANEL_URL` com a origem loopback da aplicação, `SUPABASE_URL` local, as chaves do Supabase descartável e `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` de teste. O processo de demonstração acima usa uma API sintética para o catálogo e o briefing. O ensaio com a Stripe requer uma base local com os esquemas e utilizadores de teste.

A auditoria npm encontrou 20 alertas nas dependências de execução que já constavam do lockfile, incluindo 6 críticos e 13 altos. Esta implementação não alterou dependências. O primeiro build atingiu o limite de memória padrão do Node neste ambiente. O build Render concluiu com o limite explícito indicado acima. A publicação ainda depende da validação Stripe/Supabase, do tratamento dos alertas relevantes, da resolução das edições incompletas e de autorização para merge e deploy.
