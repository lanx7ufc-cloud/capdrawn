import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) return res.status(401).json({ error: 'Token não enviado' })
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Servidor sem JWT_SECRET' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

    res.json({
      ok: true,
      user: {
        id:         user.id,
        name:       user.name,
        handle:     user.handle,
        email:      user.email,
        avatarUrl:  user.avatarUrl,
        isVip:      user.isVip,
        isVerified: user.isVerified,
      }
    })
  } catch (e) {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
