import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

function extractToken(req) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  if (req.query?.token) return req.query.token
  return null
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ error: 'Autenticazione richiesta.' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { subscription: true, certificate: true, history: true },
    })
    if (!user) return res.status(401).json({ error: 'Utente non trovato.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Sessione non valida o scaduta.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli amministratori.' })
  }
  next()
}
