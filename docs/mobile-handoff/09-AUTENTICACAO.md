# Autenticação

A aplicação web usa Supabase Auth e middleware server-side para validar sessões e anexar Bearer token às server functions.

## Rotas de login existentes

- Cliente: `/cliente/login`
- Empresa: `/empresa/login`
- Funcionário: `/funcionario/login`
- Profissional: `/profissional/login`
- Login administrativo/geral: `/login`

## Mobile

Reutilizar Supabase Auth. Não criar um sistema paralelo de usuários/senhas.

Fluxo recomendado:
1. Usuário autentica.
2. App obtém sessão Supabase.
3. App consulta endpoint `/api/mobile/me`.
4. Backend devolve papel/área autorizada.
5. App monta navegação conforme autorização.

## Segurança

- Guardar refresh/session token em SecureStore/Keychain/Keystore.
- Não guardar senha em armazenamento local.
- Validar autorização no backend em toda operação crítica.
- Para login social, configurar redirect/deep link específico do app.
- Recuperação de senha deve abrir o app por universal link/deep link quando possível.

O frontend nunca deve ser a única barreira de autorização.
