// pages/api/comments.js
import prisma from '../../lib/prisma'

export default async function handler(req, res) {

  // ══ POST — salva comentário e retorna erro visível se falhar ══
  if (req.method === 'POST') {
    const { handle, text, videoId } = req.body
    if (!handle || !text)
      return res.status(400).json({ ok: false, error: 'handle e text são obrigatórios' })

    try {
      const user = await prisma.user.findUnique({ where: { handle } })
      if (!user)
        return res.status(404).json({ ok: false, error: `Usuário @${handle} não encontrado no banco` })

      const comment = await prisma.comment.create({
        data: {
          text,
          userId: user.id,
          videoId: videoId || null,
        },
        include: {
          user: { select: { handle: true, name: true, avatarUrl: true } }
        }
      })

      return res.json({ ok: true, comment })

    } catch (e) {
      console.error('[comments POST] erro:', e)
      return res.status(500).json({
        ok: false,
        error: 'Erro ao salvar comentário: ' + e.message
      })
    }

  // ══ GET — retorna APENAS comentários de usuários reais (não bots) ══
  } else if (req.method === 'GET') {
    const { videoId } = req.query

    try {
      const comments = await prisma.comment.findMany({
        where: videoId
          ? { videoId }
          : { videoId: null },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: {
              handle: true,
              name: true,
              avatarUrl: true,
              isVip: true,
              isVerified: true,
              email: true,       // usado para filtrar bots abaixo
            }
          }
        }
      })

      // Filtra bots: emails com @capdrawnn.local são contas de bot/offline
      const realComments = comments.filter(c => {
        if (!c.user) return false
        const isBotEmail = c.user.email?.endsWith('@capdrawnn.local')
        return !isBotEmail
      })

      // Remove o campo email da resposta (não expor)
      const safeComments = realComments.map(c => ({
        id:        c.id,
        text:      c.text,
        createdAt: c.createdAt,
        videoId:   c.videoId,
        user: {
          handle:     c.user.handle,
          name:       c.user.name,
          avatarUrl:  c.user.avatarUrl,
          isVip:      c.user.isVip,
          isVerified: c.user.isVerified,
        }
      }))

      return res.json({ ok: true, comments: safeComments })

    } catch (e) {
      console.error('[comments GET] erro:', e)
      return res.status(500).json({ ok: false, error: 'Erro ao buscar comentários: ' + e.message })
    }

  } else {
    res.status(405).end()
  }
}
