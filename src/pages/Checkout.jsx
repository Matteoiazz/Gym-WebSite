import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, Check, ArrowLeft } from 'lucide-react'
import { plans } from '../data/plans.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getCertStatus } from '../utils/status.js'

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const STEP_LABELS = ['Piano', 'Pagamento', 'Conferma']
const stepTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] }

export default function Checkout() {
  const { selectedPlan, selectPlan, clearSelection, completeOrder } = useCart()
  const { user, subscribeToPlan } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(selectedPlan ? 'payment' : 'plan')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState({})
  const [payError, setPayError] = useState('')
  const [chargedTotal, setChargedTotal] = useState(0)

  const plan = selectedPlan
  const isAnnual = plan?.billing === 'annual'
  const certStatus = getCertStatus(user.medicalCertificate)
  const certApproved = certStatus === 'approved'

  useEffect(() => {
    if (certStatus === 'none') {
      navigate('/dashboard', { replace: true })
    }
  }, [certStatus])

  const total = useMemo(() => {
    if (!plan) return 0
    return isAnnual ? plan.price * 12 : plan.price
  }, [plan, isAnnual])

  const handlePickPlan = (p) => {
    selectPlan(p)
    setStep('payment')
  }

  const validate = () => {
    const next = {}
    if (card.number.replace(/\s/g, '').length < 16) next.number = 'Il numero carta deve avere 16 cifre.'
    if (!card.name.trim()) next.name = 'Scrivi il nome come appare sulla carta.'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) next.expiry = 'Usa il formato MM/AA.'
    if (card.cvc.length < 3) next.cvc = 'Il CVC ha 3 o 4 cifre.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handlePay = (e) => {
    e.preventDefault()
    if (!validate()) return
    setPayError('')
    setStep('processing')
    setTimeout(async () => {
      try {
        const serverTotal = await subscribeToPlan(plan, card)
        setChargedTotal(serverTotal)
        completeOrder({ plan, total: serverTotal, last4: card.number.replace(/\s/g, '').slice(-4) })
        setStep('success')
      } catch (err) {
        setPayError(err.message || 'Pagamento non riuscito. Controlla i dati della carta e riprova.')
        setStep('payment')
      }
    }, 2200)
  }

  const handleFinish = () => {
    clearSelection()
    navigate('/dashboard')
  }

  if (certStatus === 'none') {
    return null
  }

  if (!certApproved) {
    const copy = {
      pending: {
        title: 'Certificato in revisione',
        text: 'Lo staff sta verificando il tuo certificato medico. Potrai acquistare non appena viene approvato, di norma entro 24–48 ore.',
      },
      rejected: {
        title: 'Certificato rifiutato',
        text: `Il certificato non è stato accettato${
          user.medicalCertificate?.rejectionReason ? `: ${user.medicalCertificate.rejectionReason}` : '.'
        } Caricane uno nuovo dalla tua area soci.`,
      },
      expired: {
        title: 'Certificato scaduto',
        text: 'Il certificato medico non è più valido. Caricane uno aggiornato dalla tua area soci per continuare.',
      },
    }[certStatus]

    return (
      <div className="relative isolate flex min-h-screen items-end overflow-hidden bg-onyx-950 px-6 pb-16 pt-32 sm:px-10">
        <img
          src="/images/weights-room.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-onyx-950 via-onyx-950/80 to-onyx-950/40" />
        <div className="mx-auto w-full max-w-[1400px]">
          <h1 className="display max-w-3xl text-5xl text-onyx-50 sm:text-7xl">{copy.title}</h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-onyx-200">{copy.text}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-10">
            Vai all'area soci
          </button>
        </div>
      </div>
    )
  }

  const stepIdx = step === 'plan' ? 0 : step === 'payment' ? 1 : 2

  return (
    <div className="min-h-screen bg-onyx-950 lg:grid lg:grid-cols-2">
      <aside className="plate relative hidden lg:block">
        <img
          src={plan?.id === 'single' ? '/images/dumbbells.jpg' : '/images/hero-floor.jpg'}
          alt=""
          aria-hidden="true"
          className="absolute inset-0"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-12">
          {plan ? (
            <>
              <p className="text-sm text-onyx-300">Stai acquistando</p>
              <p className="display mt-2 text-6xl text-onyx-50">{plan.name}</p>
              <p className="tabular mt-6 text-2xl text-onyx-50">
                €{total}
                <span className="ml-2 text-sm text-onyx-300">
                  {isAnnual ? `per 12 mesi · €${plan.price}/mese` : `/${plan.period}`}
                </span>
              </p>
            </>
          ) : (
            <p className="display text-6xl text-onyx-50">
              Scegli
              <br />
              l'accesso
            </p>
          )}
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-6 pb-16 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md flex-1">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                onClick={() => setStep('plan')}
                aria-label="Torna alla scelta del piano"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-onyx-300 transition-colors duration-300 hover:border-white/40 hover:text-onyx-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="display-sm text-3xl text-onyx-50">Completa l'acquisto</h1>
          </div>

          <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Avanzamento acquisto">
            {STEP_LABELS.map((label, i) => (
              <li key={label} aria-current={i === stepIdx ? 'step' : undefined}>
                <div className={`h-0.5 rounded-full transition-colors duration-500 ${i <= stepIdx ? 'bg-accent-500' : 'bg-white/10'}`} />
                <p className={`mt-2 text-xs ${i <= stepIdx ? 'text-onyx-100' : 'text-onyx-400'}`}>{label}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              {step === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={stepTransition}
                  className="divide-y divide-white/10 border-y border-white/10"
                >
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePickPlan(p)}
                      className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <div>
                        <p className="display-sm text-xl text-onyx-50 transition-colors duration-300 group-hover:text-accent-400">
                          {p.name}
                        </p>
                        <p className="mt-1 text-xs text-onyx-400">{p.tagline}</p>
                      </div>
                      <p className="tabular shrink-0 text-right">
                        <span className="text-lg text-onyx-50">€{p.price}</span>
                        <span className="block text-xs text-onyx-400">/{p.period}</span>
                      </p>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 'payment' && plan && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={stepTransition}
                >
                  <div className="flex items-baseline justify-between border-y border-white/10 py-4 lg:hidden">
                    <div>
                      <p className="display-sm text-lg text-onyx-50">{plan.name}</p>
                      {isAnnual && <p className="text-xs text-onyx-400">€{plan.price}/mese, addebitati annualmente</p>}
                    </div>
                    <p className="tabular text-lg text-onyx-50">€{total}</p>
                  </div>

                  <form onSubmit={handlePay} noValidate className="mt-6 space-y-5 lg:mt-0">
                    <div>
                      <label htmlFor="cc-number" className="mb-1.5 block text-xs text-onyx-400">
                        Numero carta
                      </label>
                      <input
                        id="cc-number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={card.number}
                        onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                        placeholder="4242 4242 4242 4242"
                        aria-invalid={!!errors.number}
                        className="field tabular"
                      />
                      {errors.number && <p className="mt-1.5 text-xs text-red-400">{errors.number}</p>}
                    </div>

                    <div>
                      <label htmlFor="cc-name" className="mb-1.5 block text-xs text-onyx-400">
                        Nome sulla carta
                      </label>
                      <input
                        id="cc-name"
                        autoComplete="cc-name"
                        value={card.name}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                        placeholder={user?.name ?? 'Mario Rossi'}
                        aria-invalid={!!errors.name}
                        className="field"
                      />
                      {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cc-exp" className="mb-1.5 block text-xs text-onyx-400">
                          Scadenza
                        </label>
                        <input
                          id="cc-exp"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={card.expiry}
                          onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/AA"
                          aria-invalid={!!errors.expiry}
                          className="field tabular"
                        />
                        {errors.expiry && <p className="mt-1.5 text-xs text-red-400">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label htmlFor="cc-cvc" className="mb-1.5 block text-xs text-onyx-400">
                          CVC
                        </label>
                        <input
                          id="cc-cvc"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={card.cvc}
                          onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="123"
                          aria-invalid={!!errors.cvc}
                          className="field tabular"
                        />
                        {errors.cvc && <p className="mt-1.5 text-xs text-red-400">{errors.cvc}</p>}
                      </div>
                    </div>

                    {payError && (
                      <p role="alert" className="rounded-[10px] bg-red-500/10 px-3.5 py-3 text-xs text-red-300">
                        {payError}
                      </p>
                    )}

                    <button type="submit" className="btn-primary w-full">
                      <Lock className="h-4 w-4" /> Paga €{total}
                    </button>

                    <p className="text-center text-xs text-onyx-400">Pagamento simulato: nessun addebito reale.</p>
                  </form>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={stepTransition}
                  className="flex flex-col items-start py-10"
                  role="status"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
                  <p className="display-sm mt-6 text-2xl text-onyx-50">Elaborazione del pagamento</p>
                  <p className="mt-2 text-sm text-onyx-400">Resta su questa pagina, servono pochi secondi.</p>
                </motion.div>
              )}

              {step === 'success' && plan && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={stepTransition}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
                  </span>
                  <h2 className="display mt-6 text-5xl text-onyx-50">Sei dentro</h2>
                  <p className="mt-4 text-sm leading-relaxed text-onyx-300">
                    {plan.name} attivo. Il badge nella tua area soci è già abilitato.
                  </p>

                  <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
                    {[
                      ['Piano', plan.name],
                      ['Totale addebitato', `€${chargedTotal}`],
                      ['Carta', `•••• ${card.number.replace(/\s/g, '').slice(-4)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-3.5">
                        <dt className="text-onyx-400">{k}</dt>
                        <dd className="tabular text-onyx-100">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button onClick={handleFinish} className="btn-primary flex-1">
                      Vai all'area soci
                    </button>
                    <button
                      onClick={() => {
                        clearSelection()
                        navigate('/')
                      }}
                      className="btn-ghost flex-1"
                    >
                      Torna al sito
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
