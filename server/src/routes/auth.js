import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'
import { validate, registerSchema, loginSchema } from '../lib/validation.js'

const router = Router()

function makeQrSeed(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'Esiste già un account con questa email. Accedi.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      qrSeed: makeQrSeed(email + Date.now()),
      certificate: { create: { status: 'none' } },
    },
    include: { subscription: true, certificate: true, history: true },
  })

  const token = signToken(user)
  res.status(201).json({ token, user: serializeUser(user) })
})

router.post('/login', validate(loginSchema), async (req, res) => {
  const email = req.body.email.toLowerCase()
  const { password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true, certificate: true, history: true },
  })

  // Always run bcrypt.compare, even for an unknown user, against a fixed dummy
  // hash — otherwise response time leaks whether the account exists.
  const hashToCheck = user?.passwordHash ?? '$2a$12$C6UzMDM.H6dfI/f/IKcEeOfRoBSuS8L5aFB0QKO4pKl6xY4Q3RJqu'
  const valid = await bcrypt.compare(password, hashToCheck)

  if (!user || !valid) {
    return res.status(401).json({ error: 'Email o password non corretti.' })
  }

  const token = signToken(user)
  res.json({ token, user: serializeUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: serializeUser(req.user) })
})

export default router
