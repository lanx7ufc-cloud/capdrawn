import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const fullEmail = email.includes('@') ? email : `${email}@capdrawn.com`

  const user = await prisma.user.findUnique({ where: { email: fullEmail } })
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

  res.json({ token, user: { id: user.id, name: user.name, handle: user.handle, email: user.email } })
}
