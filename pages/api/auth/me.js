import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}
const prisma = globalForPrisma.prisma

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token)
      return res.status(401).json({ ok: false, error: 'Token não enviado' })

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ ok: false, error: 'JWT_SECRET não configurado' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    if (!user)
      return res.status(401).json({ ok: false, error: 'Usuário não encontrado' })

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
    console.error('ME ERROR:', e)
    res.status(401).json({ ok: false, error: 'Token inválido ou expirado' })
  }
}
