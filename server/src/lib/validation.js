import { z } from 'zod'

const email = z.string().trim().toLowerCase().email('Inserisci un indirizzo email valido.').max(254)
const password = z.string().min(8, 'La password deve avere almeno 8 caratteri.').max(128)
const name = z.string().trim().min(1, 'Il nome non può essere vuoto.').max(100)

export const registerSchema = z.object({
  name,
  email,
  password,
})

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Inserisci email e password valide.').max(254),
  password: z.string().min(1, 'Inserisci email e password valide.').max(128),
})

export const updateProfileSchema = z.object({
  name: name.optional(),
  email: email.optional(),
})

export const cardSchema = z.object({
  number: z
    .string()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => /^\d{16}$/.test(v), 'Numero carta non valido.'),
  name: z.string().trim().min(1, 'Nome sulla carta mancante.').max(100),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Formato scadenza non valido (MM/AA).'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC non valido.'),
})

export const checkoutSchema = z.object({
  planId: z.enum(['single', 'monthly', 'annual'], { errorMap: () => ({ message: 'Piano non valido.' }) }),
  card: cardSchema,
})

export const rejectCertificateSchema = z.object({
  reason: z.string().trim().min(1).max(500).optional(),
})

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const first = result.error.issues[0]
      return res.status(400).json({ error: first?.message || 'Dati non validi.' })
    }
    req.body = result.data
    next()
  }
}
