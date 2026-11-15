# Inventário Supabase da Biblioteca LDR — 15/11/2026

**Fonte:** projeto Supabase `sfrcsrzuoqdscflfuwik`, consultas SQL somente SELECT. Nenhuma alteração de dados.

## Totais observados
- `digital_product_content`: **23 linhas ativas** (19 chaves de produto distintas: 17 produtos com apenas PT e 2 com PT/EN/FR/ES).
- `training_programs`: **40 programas**, todos com `status='published'`.
- `training_modules`: **3 módulos**, todos publicados e associados exclusivamente ao programa `do-mamao-ao-negocio`.
- `training_materials`: **0 linhas**.

## Diagnóstico
**39 dos 40 programas publicados não têm módulos associados na tabela `training_modules`.** Isso é um sinal de risco de integridade editorial, **não prova que as respetivas aulas não existam**: é necessário procurar estruturas de conteúdo próprias nas rotas e outras tabelas.

## eBooks e livros: metadados
23 linhas ativas em `digital_product_content`. Produtos com quatro idiomas: `ebook_coragem_comecar` e `livro_menino_mamao`. Os restantes têm apenas PT e o leitor pode usar fallback PT. Os tamanhos de JSON variam aproximadamente de 1,75 KB a 37,7 KB; tamanho não demonstra completude ou qualidade.

## Próximas verificações obrigatórias
1. Enumerar chaves e estruturas de JSON (`jsonb_object_keys`) sem extrair dados pessoais.
2. Auditar capítulos e aulas em todas as fontes, inclusive cursos hardcoded e funções server.
3. Medir repetição exata e semelhança textual por secção; rever manualmente antes de editar.
4. Testar rotas e leitor autenticado com direitos de acesso reais ou contas de teste.
5. Conferir se todos os 40 programas têm entrega efetiva, carga horária e certificados, sem prometer certificação não verificada.

**Estado:** inventário parcial concluído; verificação pedagógica e funcional pendente. Não publicar redesign ou alterar oferta comercial com base apenas nestes números.
