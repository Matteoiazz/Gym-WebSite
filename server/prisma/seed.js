import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@musclefitness.it').toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Amministratore'

  if (!password || password.length < 12 || password === 'imposta-una-password-lunga-e-casuale') {
    console.error('ADMIN_PASSWORD mancante o debole: imposta nel .env una password casuale di almeno 12 caratteri.')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`L'account admin (${email}) esiste già. Nessuna modifica.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'admin',
      qrSeed: 'admin',
      certificate: { create: { status: 'none' } },
    },
  })

  console.log(`Account admin creato: ${email} (password letta da ADMIN_PASSWORD nel .env).`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
