import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { videoId, type, subtype, reporterId } = req.body

  if (type === 'copyright' && subtype === 'owner') {
    await prisma.video.update({ where: { id: videoId }, data: { removed: true } })
  }

  await prisma.report.create({
    data: { videoId, type, subtype: subtype || null, reporterId, status: subtype === 'owner' ? 'removed' : 'pending' }
  })

  res.json({ ok: true })
}
