# Painéis e usuários

## Cliente
Rotas principais começam em `/cliente`. Funções relevantes: `client-portal.functions.ts`, catálogo, pedidos, agenda, biblioteca e pagamentos.

## Empresa
Rotas principais começam em `/empresa`. Funções relevantes: `organization-portal.functions.ts` e `company-subscription.functions.ts`. Inclui funcionários, benefícios, compras avulsas, assinaturas e agenda.

## Funcionário
Rotas principais começam em `/funcionario`. Usuário recebe benefícios atribuídos pela empresa e acessa agenda/serviços conforme permissões.

## Profissional
Rotas principais em `/profissional/login`, `/painel-profissional`, `/profissional-*` e perfil público `/profissional/$slug`. Inclui perfil, serviços, agenda, documentos, mensagens, assinatura e marketplace.

## Master/Admin
Rotas administrativas devem permanecer protegidas e separadas do painel profissional. Não portar integralmente para mobile na primeira versão.

## Perfis e autorização

O app deve sempre obter o usuário autenticado e o papel/permissão no backend antes de liberar navegação. Não confiar apenas em esconder telas no frontend.
