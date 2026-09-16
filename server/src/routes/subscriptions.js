import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'
import { getCertStatus } from '../lib/status.js'
import { PLANS } from '../lib/plans.js'
import { validate, checkoutSchema } from '../lib/validation.js'

const router = Router()

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi di pagamento. Riprova tra qualche minuto.' },
})

function isCardExpired(expiry) {
  const [mm, yy] = expiry.split('/').map(Number)
  const expiryDate = new Date(2000 + yy, mm) // first day of the month AFTER expiry
  return new Date() >= expiryDate
}

router.post('/checkout', requireAuth, checkoutLimiter, validate(checkoutSchema), async (req, res) => {
  const { planId, card } = req.body
  const plan = PLANS[planId]

  const certStatus = getCertStatus(req.user.certificate)
  if (certStatus !== 'approved') {
    return res.status(403).json({ error: 'Serve un certificato medico approvato per acquistare un piano.' })
  }

  if (isCardExpired(card.expiry)) {
    return res.status(400).json({ error: 'La carta è scaduta.' })
  }

  const isAnnual = plan.billing === 'annual'
  const total = isAnnual ? plan.price * 12 : plan.price
  const last4 = card.number.slice(-4)
  const now = new Date()

  const currentSub = await prisma.subscription.findUnique({ where: { userId: req.user.id } })

  const label =
    plan.billing === 'one-time'
      ? `Acquisto ${plan.name}`
      : currentSub && currentSub.planId !== plan.id
      ? `Cambio piano: ${currentSub.planName} → ${plan.name}`
      : `Acquisto piano ${plan.name}`

  await prisma.$transaction(async (tx) => {
    if (plan.billing !== 'one-time') {
      const renewsAt = new Date(now)
      if (isAnnual) renewsAt.setFullYear(renewsAt.getFullYear() + 1)
      else renewsAt.setMonth(renewsAt.getMonth() + 1)

      await tx.subscription.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          billing: plan.billing,
          startedAt: now,
          renewsAt,
          cancelAtPeriodEnd: false,
        },
        update: {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          billing: plan.billing,
          startedAt: now,
          renewsAt,
          cancelAtPeriodEnd: false,
        },
      })
    } else {
      await tx.user.update({
        where: { id: req.user.id },
        data: { singleEntryCredits: { increment: 1 } },
      })
    }

    await tx.user.update({ where: { id: req.user.id }, data: { paymentLast4: last4 } })

    await tx.historyEntry.create({
      data: {
        userId: req.user.id,
        label,
        amount: total,
        method: `Carta •••• ${last4}`,
        status: 'Completato',
      },
    })
  })

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user), total })
})

router.post('/cancel', requireAuth, async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user.id } })
  if (!sub) return res.status(400).json({ error: 'Nessun abbonamento attivo.' })

  await prisma.$transaction([
    prisma.subscription.update({ where: { userId: req.user.id }, data: { cancelAtPeriodEnd: true } }),
    prisma.historyEntry.create({
      data: {
        userId: req.user.id,
        label: 'Rinnovo automatico disattivato',
        amount: 0,
        method: '—',
        status: 'Confermato',
      },
    }),
  ])

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user) })
})

router.post('/reactivate', requireAuth, async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user.id } })
  if (!sub) return res.status(400).json({ error: 'Nessun abbonamento da riattivare.' })

  await prisma.$transaction([
    prisma.subscription.update({ where: { userId: req.user.id }, data: { cancelAtPeriodEnd: false } }),
    prisma.historyEntry.create({
      data: {
        userId: req.user.id,
        label: 'Rinnovo automatico riattivato',
        amount: 0,
        method: '—',
        status: 'Confermato',
      },
    }),
  ])

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { subscription: true, certificate: true, history: true },
  })
  res.json({ user: serializeUser(user) })
})

export default router
