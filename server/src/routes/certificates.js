import { Router } from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileTypeFromFile } from 'file-type'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'

const router = Router()

const UPLOAD_DIR = path.resolve('uploads', 'certificates')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Declared (client-reported) mimetype gates the initial multer accept/reject.
const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png'])
// Actual file signature (magic bytes) must match one of these after upload —
// a mismatch means the file's real content doesn't match its claimed type
// (e.g. an executable renamed to certificate.pdf) and is rejected.
const ALLOWED_REAL_TYPES = new Set(['pdf', 'jpg', 'png'])

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi caricamenti. Riprova tra qualche minuto.' },
})

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10)
    cb(null, `${req.user.id}-${crypto.randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Formato non supportato. Usa PDF, JPG o PNG.'))
    }
    cb(null, true)
  },
})

router.post('/upload', requireAuth, uploadLimiter, (req, res) => {
  upload.single('certificate')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Nessun file caricato.' })

    const detected = await fileTypeFromFile(req.file.path).catch(() => null)
    if (!detected || !ALLOWED_REAL_TYPES.has(detected.ext)) {
      fs.unlink(req.file.path, () => {})
      return res.status(400).json({ error: 'Il contenuto del file non corrisponde a un PDF, JPG o PNG valido.' })
    }

    const existing = await prisma.certificate.findUnique({ where: { userId: req.user.id } })
    if (existing?.filePath) {
      fs.unlink(existing.filePath, () => {})
    }

    const safeName = req.file.originalname.slice(0, 150)

    await prisma.certificate.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        status: 'pending',
        fileName: safeName,
        filePath: req.file.path,
        mimeType: detected.mime,
        uploadedAt: new Date(),
      },
      update: {
        status: 'pending',
        fileName: safeName,
        filePath: req.file.path,
        mimeType: detected.mime,
        uploadedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        expiresAt: null,
        rejectionReason: null,
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true, certificate: true, history: true },
    })
    res.json({ user: serializeUser(user) })
  })
})

router.get('/:userId/file', requireAuth, async (req, res) => {
  const { userId } = req.params
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Non autorizzato a visualizzare questo file.' })
  }

  const cert = await prisma.certificate.findUnique({ where: { userId } })
  if (!cert?.filePath || !fs.existsSync(cert.filePath)) {
    return res.status(404).json({ error: 'Nessun certificato disponibile.' })
  }

  res.setHeader('Content-Type', cert.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cert.fileName || 'certificato')}"`)
  fs.createReadStream(cert.filePath).pipe(res)
})

export default router
