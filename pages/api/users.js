import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { handle, name, desc, area, color, avatar, joined } = req.body
    if (!handle || !name) return res.status(400).json({ error: 'handle e name obrigatórios' })

    // Gera email e senha placeholder pois o schema exige esses campos
    const placeholderEmail = `${handle}@capdrawnn.local`
    const placeholderPass  = 'offline_user'

    try {
      const user = await prisma.user.upsert({
        where: { handle },
        update: {
          name,
          bio:       desc  || null,
          area:      area  || null,
          avatarUrl: avatar || null,
        },
        create: {
          handle,
          name,
          email:     placeholderEmail,
          password:  placeholderPass,
          bio:       desc   || null,
          area:      area   || null,
          avatarUrl: avatar || null,
        }
      })
      res.json({ ok: true, user })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Erro ao salvar usuário' })
    }

  } else if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany()
      res.json({ ok: true, users })
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar usuários' })
    }

  } else {
    res.status(405).end()
  }
}
