import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  const videos = await prisma.video.findMany({
    where: { removed: false },
    include: {
      uploader: { select: { name: true, handle: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  res.json(videos)
}
