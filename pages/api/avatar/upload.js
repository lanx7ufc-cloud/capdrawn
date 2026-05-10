import cloudinary from '../../../lib/cloudinary'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 }) // 5MB máx

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Erro ao ler arquivo' })

    const file = files.avatar?.[0]
    if (!file) return res.status(400).json({ error: 'Nenhuma foto enviada' })

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: 'image',
        folder: 'capdrawnn/avatars',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      // Atualiza a URL no banco
      const userId = fields.userId?.[0]
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: result.secure_url }
      })

      res.json({ ok: true, url: result.secure_url })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Falha no upload da foto' })
    }
  })
}
