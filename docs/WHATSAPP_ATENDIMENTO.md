# WhatsApp — Atendimento do Ecossistema Grupo LDR Essence

## Objetivo
Automatizar apenas o atendimento comercial e operacional do WhatsApp. O futuro chatbot "Mente Empreendedora" fica fora deste escopo e deve ser um produto separado.

## Entrada
A primeira interação deve pedir o idioma:
1. Português
2. Français
3. English
4. Español

A preferência do idioma deve ser salva para retornos futuros.

## Serviços por idioma
### Português
- RH & Recrutamento
- Sites & Soluções Digitais
- Mentoria & Psicanálise
- Essence Massage & Bem-Estar
- Palestras
- Treinamentos
- E-book
- Livro
- Atendimento humano

### Français / English / Español
- Essence Massage & Bem-Estar
- E-book
- Livro
- Atendimento humano

## Roteamento
- Compra direta: e-book e livro.
- Direto ou humano conforme o caso: massage, mentoria/psicanálise e treinamentos.
- Atendimento humano: RH/recrutamento, sites/soluções digitais e palestras.

## Regras
- O cliente pode digitar MENU para voltar ao início.
- O cliente pode solicitar atendimento humano a qualquer momento.
- Antes de transferir para humano, coletar nome, serviço, país e um resumo curto da necessidade.
- Não exibir em francês, inglês ou espanhol serviços disponíveis apenas em português.
- Contatos encaminhados ao humano devem receber o status `aguardando_atendimento_humano`.

## Integração técnica prevista
- WhatsApp Business Platform / Cloud API oficial da Meta.
- Webhook para receber mensagens e eventos.
- API de envio para respostas automáticas e templates aprovados.
- Persistência de idioma, etapa da conversa e histórico mínimo no Supabase.
- Integração futura com o painel profissional para filas de atendimento e acompanhamento.

## Variáveis necessárias para ativação
- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_VERIFY_TOKEN
- META_APP_SECRET

As credenciais devem ficar somente em variáveis de ambiente do servidor e nunca no código ou no navegador.
