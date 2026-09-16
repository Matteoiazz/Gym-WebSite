import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { assertEnv } from './lib/env.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import certificateRoutes from './routes/certificates.js'
import subscriptionRoutes from './routes/subscriptions.js'
import accessRoutes from './routes/access.js'
import adminRoutes from './routes/admin.js'

assertEnv()

const app = express()
const PORT = process.env.PORT || 4000
const isProd = process.env.NODE_ENV === 'production'

app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '100kb' }))
app.use(morgan(isProd ? 'combined' : 'dev'))

// Generic ceiling on every route; endpoints handling sensitive actions
// (login, register, checkout, certificate upload) layer a stricter limiter
// on top of this in their own route file.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/access', accessRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Risorsa non trovata.' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Richiesta troppo grande.' })
  }
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500
  res.status(status).json({ error: isProd && status === 500 ? 'Errore interno del server.' : err.message })
})

app.listen(PORT, () => {
  console.log(`Muscle & Fitness API in ascolto su http://localhost:${PORT}`)
})
