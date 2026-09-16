import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'
import { canAccessGym } from '../lib/status.js'

const router = Router()

router.post('/simulate', requireAuth, async (req, res) => {
  const access = canAccessGym(req.user)
  if (!access.ok) {
    const message =
      access.reason === 'certificate'
        ? 'Serve un certificato medico approvato per accedere in palestra.'
        : 'Nessun accesso disponibile: acquista un ingresso singolo o un abbonamento.'
    return res.status(403).json({ error: message, reason: access.reason })
  }

  await prisma.$transaction(async (tx) => {
    let remaining = req.user.singleEntryCredits
    let label = 'Accesso in palestra (badge smart)'
    if (access.viaCredit) {
      remaining -= 1
      label = `Accesso con ingresso singolo (${remaining} rimanenti)`
      await tx.user.update({ where: { id: req.user.id }, data: { singleEntryCredits: remaining } })
    }
    await tx.historyEntry.create({
      data: {
        userId: req.user.id,
        label,
        amount: 0,
        method: access.viaCredit ? 'Ingresso Singolo' : 'Badge Digitale',
        status: 'Ingresso registrato',
      },
    })
  })

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user) })
})

export default router
