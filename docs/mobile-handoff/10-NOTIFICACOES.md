# Notificações mobile

## Objetivo

Adicionar push notifications sem substituir a central de notificações existente.

## Eventos recomendados

- confirmação de pagamento;
- lembrete de atendimento;
- alteração/cancelamento de agenda;
- nova solicitação;
- benefício liberado;
- assinatura renovada;
- falha de pagamento;
- assinatura programada para cancelamento;
- nova mensagem profissional;
- aviso importante da plataforma.

## Arquitetura

React Native + Expo: Expo Notifications com FCM no Android e APNs no iOS.

Criar tabela/registro de tokens por usuário/dispositivo e endpoint autenticado `POST /api/mobile/push-token`.

O backend deve disparar push a partir de eventos de negócio já confirmados. Nunca usar somente eventos locais do app como fonte de verdade para pagamento ou assinatura.

## Preferências

Respeitar preferências de comunicação e permitir desativar categorias não essenciais. Notificações transacionais críticas devem seguir requisitos legais e de produto.
