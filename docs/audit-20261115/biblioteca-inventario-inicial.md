# Biblioteca LDR — auditoria inicial (15/11/2026)

## Escopo e evidências
Inspeção estática de `src/routes/_clientarea.cliente.biblioteca.tsx`, `src/components/library-storefront.tsx`, `src/lib/digital-content.server.ts` e `src/lib/editorial-catalog.ts`. **Não é uma validação de conteúdos existentes no Supabase de produção nem teste autenticado.**

## Problema corrigido nesta branch
- O cartão **Filme LDR** apontava para `/cliente/biblioteca`, a própria biblioteca, sem abrir um filme. A promoção do cartão foi retirada da vitrine até existir uma rota de entrega verificada. Nenhum ficheiro audiovisual, compra ou dado de aluno foi apagado.

## Riscos confirmados no código
- A biblioteca agrega várias ofertas e catálogos com estados de acesso diferentes; o redesign deve separar **Meus conteúdos**, **Continuar**, **Explorar**, **Gratuitos**, **eBooks** e **Assinatura**.
- O leitor digital procura `digital_product_content` ativo por chave e idioma, com fallback para português. Existência de cartão não prova existência de capítulos completos.
- O acesso aos livros é verificado por compras com `payment_status=pago` e aliases; validar também o caminho de assinatura LDR ONE nos fluxos aplicáveis antes de mudar o gating.
- A vitrine usa títulos e descrições em português em itens do catálogo, mesmo quando a interface está noutro idioma.

## Auditoria ainda necessária (não afirmar como aprovada)
1. Inventariar os registos reais de cursos, módulos, aulas, avaliações, certificados e conteúdos digitais no Supabase em **modo leitura**; cruzar com rotas e catálogos.
2. Detectar textos idênticos e quase duplicados por módulo/capítulo, com evidência de produto, origem e excerto. Não apagar automaticamente.
3. Testar leitores, PDFs/anexos, links, progressos, matrículas, pagamentos sintéticos, assinaturas e certificados por perfil.
4. Verificar acesso real em sessão de aluno e em dispositivos móveis; documentar indisponibilidades sem fingir que passaram.
5. Implementar redesign em componentes reutilizáveis, com estados de carregamento, vazio e erro, preservando compras e progresso.

## Regras de segurança
Branch isolada; sem merge, publicação, alteração de preços, cobranças reais ou alterações destrutivas. Produtos não auditados devem ser marcados como **por validar**, não como prontos.
