import cloudinary from '../../../lib/cloudinary'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import jwt from 'jsonwebtoken'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ── Autenticação via token JWT (header Authorization: Bearer <token>)
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()

  let tokenUserId = null
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      tokenUserId = decoded.userId
    } catch (_) {
      // token inválido/expirado — tenta pelo handle abaixo
    }
  }

  const form = formidable({ maxFileSize: 100 * 1024 * 1024 }) // 100 MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('formidable error:', err)
      return res.status(400).json({ error: 'Erro ao ler arquivo: ' + err.message })
    }

    const file = files.video?.[0]
    if (!file) return res.status(400).json({ error: 'Nenhum vídeo enviado' })

    try {
      let uploaderId = tokenUserId

      // fallback: busca pelo handle enviado no campo
      if (!uploaderId) {
        const uploaderHandle = fields.uploaderId?.[0]
        if (uploaderHandle) {
          const user = await prisma.user.findUnique({ where: { handle: uploaderHandle } })
          if (user) {
            uploaderId = user.id
          } else {
            // cria conta offline só se não vier token
            const created = await prisma.user.create({
              data: {
                handle:   uploaderHandle,
                name:     uploaderHandle,
                email:    `${uploaderHandle}@capdrawnn.local`,
                password: 'offline_user',
              }
            })
            uploaderId = created.id
          }
        }
      }

      // Valida que o arquivo é realmente um vídeo
      const mime = file.mimetype || ''
      if (!mime.startsWith('video/')) {
        return res.status(400).json({ error: 'Arquivo deve ser um vídeo' })
      }

      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: 'video',
        folder: 'capdrawnn/videos',
        transformation: [{ quality: 'auto' }],
      })

      const caption = fields.caption?.[0] || ''
      const distributed = fields.distributed?.[0] === 'true'

      const video = await prisma.video.create({
        data: {
          url:         result.secure_url,
          caption,
          distributed,
          uploaderId,
        }
      })

      res.json({ ok: true, video, url: result.secure_url })
    } catch (e) {
      console.error('upload error:', e)
      res.status(500).json({ error: 'Falha no upload: ' + (e.message || 'erro desconhecido') })
    }
  })
}
