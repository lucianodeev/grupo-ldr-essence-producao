# Segurança para desenvolvimento mobile

## Regras obrigatórias

- Não expor Stripe Secret Key.
- Não expor Supabase Service Role.
- Não expor webhook secrets.
- Não embutir credenciais Google privadas.
- Não armazenar senhas no dispositivo.
- Não confiar em autorização apenas no frontend.
- Não permitir que o app escreva diretamente em tabelas administrativas sensíveis sem policy adequada.

## Sessão

Guardar tokens de sessão em SecureStore/Keychain/Keystore. Limpar dados sensíveis no logout.

## API

Toda operação privilegiada deve validar Bearer token, usuário, papel e recurso no backend. Aplicar rate limiting e validação de entrada onde aplicável.

## Pagamentos

Confirmar estados pelo webhook/backend. Nunca liberar benefício apenas pelo retorno visual do checkout.

## Dados pessoais

Aplicar minimização de dados, consentimento, retenção adequada e separação de informações sensíveis. Não registrar em analytics/logs conteúdo clínico, documentos privados, tokens ou dados completos de pagamento.

## Administração

Manter Painel Master fora do app inicial. Se funções administrativas forem adicionadas futuramente, exigir revisão específica de segurança, autorização server-side e trilha de auditoria.

## Antes de entregar a terceiros

- revisar `.env*`;
- revisar arquivos de configuração;
- rotacionar credenciais que tenham sido compartilhadas indevidamente;
- conceder acesso mínimo necessário ao GitHub/Supabase/Vercel/Stripe;
- remover acesso quando o contrato terminar.
