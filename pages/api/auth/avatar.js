import { PrismaClient } from '@prisma/client'
import cloudinary from '../../../lib/cloudinary'
import jwt from 'jsonwebtoken'

const globalForPrisma = globalThis
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}
const prisma = globalForPrisma.prisma

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verifica JWT
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ ok: false, error: 'Token obrigatório' })

  let userId
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    userId = decoded.userId
  } catch {
    return res.status(401).json({ ok: false, error: 'Token inválido' })
  }

  try {
    const { avatarBase64, name, bio } = req.body

    let avatarUrl = undefined

    // Faz upload do avatar para Cloudinary se enviado
    if (avatarBase64) {
      const result = await cloudinary.uploader.upload(avatarBase64, {
        resource_type: 'image',
        folder: 'capdrawnn/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
      })
      avatarUrl = result.secure_url
    }

    // Atualiza no banco
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name      && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
      }
    })

    res.json({
      ok: true,
      user: {
        id:        user.id,
        name:      user.name,
        handle:    user.handle,
        avatarUrl: user.avatarUrl,
        bio:       user.bio,
      }
    })
  } catch (e) {
    console.error('avatar update error:', e)
    res.status(500).json({ ok: false, error: 'Erro ao atualizar perfil: ' + e.message })
  }
}
