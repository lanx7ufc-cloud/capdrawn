import cloudinary from '../../../lib/cloudinary'
import prisma from '../../../lib/prisma'
import formidable from 'formidable'
import jwt from 'jsonwebtoken'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ── Autenticação via token JWT
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
      console.error('[upload] formidable error:', err)
      return res.status(400).json({ error: 'Erro ao ler arquivo: ' + err.message })
    }

    const file = files.video?.[0]
    if (!file) return res.status(400).json({ error: 'Nenhum vídeo enviado' })

    // Valida MIME antes de qualquer coisa
    const mime = file.mimetype || ''
    if (!mime.startsWith('video/')) {
      return res.status(400).json({ error: 'Arquivo deve ser um vídeo' })
    }

    try {
      let uploaderId = tokenUserId

      // Fallback: busca pelo handle enviado no campo
      if (!uploaderId) {
        const uploaderHandle = fields.uploaderId?.[0]
        if (!uploaderHandle) {
          return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        const user = await prisma.user.findUnique({ where: { handle: uploaderHandle } })
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado. Faça login novamente.' })
        }
        uploaderId = user.id
      }

      // Confirma que o uploaderId existe no banco antes de criar o vídeo
      const uploaderExists = await prisma.user.findUnique({ where: { id: uploaderId } })
      if (!uploaderExists) {
        return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' })
      }

      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: 'video',
        folder: 'capdrawnn/videos',
        transformation: [{ quality: 'auto' }],
      })

      const caption     = fields.caption?.[0] || ''
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
      console.error('[upload] erro:', e)
      res.status(500).json({ error: 'Falha no upload: ' + (e.message || 'erro desconhecido') })
    }
  })
}
