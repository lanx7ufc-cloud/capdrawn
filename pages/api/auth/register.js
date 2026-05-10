import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, handle, email, password } = req.body
  const fullEmail = `${email}@capdrawn.com`

  const exists = await prisma.user.findFirst({
    where: { OR: [{ handle }, { email: fullEmail }] }
  })
  if (exists) return res.status(400).json({ error: 'Handle ou email já em uso' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, handle, email: fullEmail, password: hashed }
  })

  res.json({ ok: true, user: { id: user.id, name: user.name, handle: user.handle } })
}
