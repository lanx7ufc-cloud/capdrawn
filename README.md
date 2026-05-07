# 🎵 CapDrawn

**Removedor de silêncio de áudio com IA.** Plataforma profissional para podcasters, YouTubers e criadores de conteúdo.

## ✨ Funcionalidades

- 🧠 Detecção inteligente de silêncios
- ⚡ Processamento ultrarrápido (até 2h de áudio)
- 🎚 Controle de limiar, duração mínima e padding
- 👁 Visualização de waveform original vs processado
- 📦 Exportação em MP3/WAV
- 👥 Sistema de perfis, comentários e VIP
- 🎬 Feed de vídeos curtos

## 🚀 Deploy no Railway

1. Faça fork deste repositório
2. No [Railway](https://railway.app), clique em **New Project → Deploy from GitHub**
3. Selecione o repositório `capdrawn`
4. Adicione o banco PostgreSQL em **New → Database → PostgreSQL**
5. Railway irá configurar a variável `DATABASE_URL` automaticamente
6. O deploy é feito em segundos!

## 🔧 Rodar localmente

```bash
npm install
node server.js
