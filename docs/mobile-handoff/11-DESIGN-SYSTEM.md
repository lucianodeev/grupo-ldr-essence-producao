# Design system

O app deve preservar a identidade visual atual do ecossistema LDR.

## Referências do projeto

- estilos globais em `apps/painel-ldr/src/styles.css`;
- componentes em `apps/painel-ldr/src/components`;
- UI baseada em React, Tailwind e componentes Radix/shadcn-like;
- ícones Lucide.

## Mobile

Criar tokens próprios para React Native:
- cores primárias/secundárias;
- background/surface/border;
- tipografia;
- espaçamento;
- radius;
- estados de sucesso/aviso/erro;
- tamanhos de botão e campo.

## Componentes mínimos

- Button
- Card
- Input
- Select/Picker
- Badge
- Avatar
- EmptyState
- LoadingState
- ErrorState
- Modal/BottomSheet
- Tabs
- Toast/Feedback
- PlanCard
- ServiceCard
- AppointmentCard
- FloatingWhatsAppButton

## UX

Manter hierarquia simples, foco mobile-first, áreas por perfil, CTAs claros e acessibilidade. Não tentar reproduzir literalmente o HTML desktop; adaptar a experiência para toque e telas menores.
