import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'
import { validate, updateProfileSchema } from '../lib/validation.js'

const router = Router()

router.patch('/me', requireAuth, validate(updateProfileSchema), async (req, res) => {
  const nextName = req.body.name ?? req.user.name
  const nextEmail = req.body.email ?? req.user.email

  if (nextEmail !== req.user.email) {
    const clash = await prisma.user.findUnique({ where: { email: nextEmail } })
    if (clash) return res.status(409).json({ error: 'Questa email è già in uso da un altro account.' })
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: nextName, email: nextEmail },
    include: { subscription: true, certificate: true, history: true },
  })

  res.json({ user: serializeUser(updated) })
})

export default router
