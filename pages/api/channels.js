import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { handle, name, email } = req.body
    if (!handle || !email) return res.status(400).json({ error: 'handle e email obrigatórios' })

    try {
      // Salva o channelEmail direto no User (já existe no schema)
      const user = await prisma.user.update({
        where: { handle },
        data: {
          channelEmail: email,
          // name do canal pode ir pro name do user ou ignorar
        }
      })
      res.json({ ok: true, user })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Erro ao salvar canal' })
    }

  } else if (req.method === 'GET') {
    try {
      const channels = await prisma.user.findMany({
        where: { channelEmail: { not: null } },
        select: { handle: true, name: true, channelEmail: true }
      })
      res.json({ ok: true, channels })
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar canais' })
    }

  } else {
    res.status(405).end()
  }
}
