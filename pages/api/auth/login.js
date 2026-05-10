import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}
const prisma = globalForPrisma.prisma

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ ok: false, error: 'Email e senha obrigatórios' })

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ ok: false, error: 'JWT_SECRET não configurado no servidor' })

    const fullEmail = email.includes('@') ? email : `${email}@capdrawn.com`

    const user = await prisma.user.findUnique({ where: { email: fullEmail } })
    if (!user)
      return res.status(401).json({ ok: false, error: 'Usuário não encontrado' })

    if (user.password === 'offline_user')
      return res.status(401).json({ ok: false, error: 'Esta conta não tem senha. Crie uma conta completa.' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok)
      return res.status(401).json({ ok: false, error: 'Senha incorreta' })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      ok: true,
      token,
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
    console.error('LOGIN ERROR:', e)
    const msg = e?.message || String(e)
    if (msg.includes('does not exist')) {
      return res.status(500).json({ ok: false, error: 'Banco de dados não inicializado. Aguarde o redeploy.' })
    }
    res.status(500).json({ ok: false, error: 'Erro interno: ' + msg.slice(0, 120) })
  }
}
