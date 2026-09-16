const REQUIRED = ['DATABASE_URL', 'JWT_SECRET']

export function assertEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key])
  if (missing.length) {
    console.error(`Configurazione mancante: variabili d'ambiente richieste non impostate: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET troppo corto: usa una stringa casuale di almeno 32 caratteri.')
    process.exit(1)
  }
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.includes('change-this')) {
    console.error('JWT_SECRET non è stato cambiato dal valore di esempio. Imposta un segreto reale prima di avviare in produzione.')
    process.exit(1)
  }
}
