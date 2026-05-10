import cloudinary from '../../../lib/cloudinary'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Erro ao ler arquivo' })

    const file = files.avatar?.[0]
    if (!file) return res.status(400).json({ error: 'Nenhuma foto enviada' })

    const userHandle = fields.userId?.[0] // frontend envia o handle ex: "joao"
    if (!userHandle) return res.status(400).json({ error: 'userId (handle) obrigatório' })

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: 'image',
        folder: 'capdrawnn/avatars',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      // Atualiza pelo handle (não pelo id interno do Prisma)
      await prisma.user.update({
        where: { handle: userHandle },
        data:  { avatarUrl: result.secure_url }
      })

      res.json({ ok: true, url: result.secure_url })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Falha no upload da foto' })
    }
  })
}
