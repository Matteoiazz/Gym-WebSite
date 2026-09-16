import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'
import { getSubStatus, getCertStatus } from '../lib/status.js'
import { validate, rejectCertificateSchema } from '../lib/validation.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/users', async (req, res) => {
  const q = (req.query.search || '').trim().toLowerCase()
  const users = await prisma.user.findMany({
    where: { role: 'member' },
    include: { subscription: true, certificate: true, history: true },
    orderBy: { memberSince: 'desc' },
  })
  const filtered = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users
  res.json({ users: filtered.map(serializeUser) })
})

router.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { subscription: true, certificate: true, history: true },
  })
  if (!user) return res.status(404).json({ error: 'Utente non trovato.' })
  res.json({ user: serializeUser(user) })
})

router.get('/stats', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'member' },
    include: { subscription: true, certificate: true, history: true },
  })
  let activeSubs = 0
  let pendingCerts = 0
  let totalAccesses = 0
  for (const u of users) {
    const subStatus = getSubStatus(u.subscription)
    if (subStatus === 'active' || subStatus === 'cancelling') activeSubs += 1
    if (getCertStatus(u.certificate) === 'pending') pendingCerts += 1
    totalAccesses += u.history.filter((h) => h.amount === 0 && h.status === 'Ingresso registrato').length
  }
  res.json({ total: users.length, activeSubs, pendingCerts, totalAccesses })
})

router.post('/certificates/:userId/approve', async (req, res) => {
  const cert = await prisma.certificate.findUnique({ where: { userId: req.params.userId } })
  if (!cert) return res.status(404).json({ error: 'Certificato non trovato.' })

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  await prisma.certificate.update({
    where: { userId: req.params.userId },
    data: {
      status: 'approved',
      reviewedAt: now,
      reviewedBy: req.user.name,
      expiresAt,
      rejectionReason: null,
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user) })
})

router.post('/certificates/:userId/reject', validate(rejectCertificateSchema), async (req, res) => {
  const { reason } = req.body
  const cert = await prisma.certificate.findUnique({ where: { userId: req.params.userId } })
  if (!cert) return res.status(404).json({ error: 'Certificato non trovato.' })

  await prisma.certificate.update({
    where: { userId: req.params.userId },
    data: {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: req.user.name,
      expiresAt: null,
      rejectionReason: reason || 'Documento non valido.',
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user) })
})

export default router
