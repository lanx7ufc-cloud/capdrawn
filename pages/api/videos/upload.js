import cloudinary from '../../../lib/cloudinary'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ maxFileSize: 100 * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Erro ao ler arquivo' })

    const file = files.video?.[0]
    if (!file) return res.status(400).json({ error: 'Nenhum vídeo enviado' })

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: 'video',
        folder: 'capdrawnn/videos',
        transformation: [{ quality: 'auto' }]
      })

      const video = await prisma.video.create({
        data: {
          url:         result.secure_url,
          caption:     fields.caption?.[0] || '',
          distributed: fields.distributed?.[0] === 'true',
          uploaderId:  fields.uploaderId?.[0],
        }
      })

      res.json({ ok: true, video, url: result.secure_url })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Falha no upload' })
    }
  })
}
