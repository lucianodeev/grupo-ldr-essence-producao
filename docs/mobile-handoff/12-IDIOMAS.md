# Idiomas

O ecossistema trabalha com quatro idiomas:

- Português (PT)
- Inglês (EN)
- Francês (FR)
- Espanhol (ES)

## Mobile

Reutilizar a estrutura de traduções existente em `apps/painel-ldr/src/lib/i18n` como referência de conteúdo e chaves.

Recomendação:
- criar namespace por feature;
- detectar idioma do aparelho no primeiro acesso;
- permitir troca manual;
- persistir preferência;
- usar fallback PT;
- não misturar strings hardcoded em componentes novos.

## Formatação

Usar locale adequado para datas, horas, moedas e números. Valores devem respeitar a região/currency definida pelo backend e nunca ser calculados apenas com base no idioma do aparelho.
