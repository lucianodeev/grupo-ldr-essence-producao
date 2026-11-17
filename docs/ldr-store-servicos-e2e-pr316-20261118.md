# PR #316 — E2E isolado: execução e bloqueios (18/11/2026)

## Estado
**NÃO EXECUTADO como E2E real.** Os testes sintéticos anteriores não equivalem a checkout Stripe de teste + Supabase descartável + sessão autenticada + Área Master. Não publicar nem fazer merge.

## Pré-condições obrigatórias
- Supabase local descartável (loopback), esquema migrado e dados sintéticos; nunca apontar para projeto remoto de produção.
- Aplicação local em loopback com `LDR_STORE_SANDBOX_ENABLED=true`, `CLIENT_PANEL_URL` e `VITE_SUPABASE_URL` locais.
- Stripe `sk_test_` e `whsec_` de teste, sem imprimir segredos em logs.
- Dois utilizadores de teste distintos (cliente sem assinatura nem compra anterior; operador Master).
- Um eBook com conteúdo completo comprovado e acesso individual não previamente concedido.
- Proposta de teste com preço e estado de aceite explícitos.

## Cenário A — eBook
1. Confirmar ausência de entitlement para cliente teste.
2. Abrir detalhe da obra verificada e iniciar checkout de teste; verificar `cs_test_`, moeda e montante.
3. Concluir pagamento com cartão de teste, processar webhook assinado; conferir ordem `pago` uma vez.
4. Entrar na Biblioteca como cliente e abrir capítulos do eBook; conferir isolamento entre utilizadores.
5. Executar reembolso integral **somente em modo de teste**; processar evento assinado.
6. Conferir `reembolsado`, revogação do direito derivado da compra e impossibilidade de leitura sem outro direito.
7. Reenviar eventos e inverter ordem (reembolso antes de conclusão); verificar idempotência e ausência de reativação.

## Cenário B — proposta
1. Enviar briefing sintético pelo formulário de Serviços Profissionais.
2. Conferir protocolo e registo na Área Master com origem e contacto fictício.
3. Criar e enviar proposta de teste com escopo, valor e validade; conferir visibilidade em Minha Área.
4. Aceitar proposta como cliente de teste; conferir `quote_state=accepted`.
5. Criar sessão de pagamento Stripe test; concluir e processar webhook assinado.
6. Conferir estado `pago`, pedido atualizado na Área Master e confirmação em Minha Área.
7. Reenviar webhook; conferir ausência de pedido ou crédito duplicado.

## Evidências exigidas
- IDs sintéticos das ordens e sessões de teste (sem segredos), estado antes/depois, logs redigidos, captura do leitor e da Área Master, resultado por passo.
- Registrar bloqueios sem marcar sucesso. Não fazer alterações remotas nem pagamentos reais.

## Bloqueio observado nesta sessão
- A ligação Stripe disponibilizou somente contexto **livemode=true**, inadequado para estes testes.
- O projeto Supabase inspecionado apresenta apenas branch principal; nenhuma base descartável local foi fornecida.
- O ambiente de execução desta sessão tem Node, mas não possui Docker nem Supabase CLI configurados.
- Não houve teste E2E, reembolso, merge ou deploy.

## Próxima ação
Executar os dois cenários num Work com ambiente de desenvolvimento isolado e credenciais Stripe de teste, mantendo esta branch e documentando evidências neste PR.
