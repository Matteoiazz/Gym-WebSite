import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { plans } from '../data/plans.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function PricingSection() {
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useUI()
  const { selectPlan } = useCart()
  const navigate = useNavigate()

  const handleChoose = (plan) => {
    selectPlan(plan)
    if (isAuthenticated) navigate('/checkout')
    else openAuthModal('register', '/checkout')
  }

  return (
    <section id="prezzi" className="bg-onyx-950 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-2xl text-[10vw] text-onyx-50 sm:text-6xl lg:text-7xl">
            Un prezzo,
            <br />
            tutta la struttura
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-onyx-300">
            Nessun costo di iscrizione nascosto e nessun vincolo: il rinnovo
            automatico si disattiva dalla tua area personale quando vuoi.
          </p>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[14px] border border-white/10 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col border-white/10 p-8 lg:p-10 [&:not(:last-child)]:border-b lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r ${
                plan.highlighted ? 'bg-onyx-800' : 'bg-onyx-900'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display-sm text-2xl text-onyx-50">{plan.name}</h3>
                {plan.badge && (
                  <span className="shrink-0 rounded-full bg-accent-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-onyx-950">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-onyx-400">{plan.tagline}</p>

              <p className="mt-8 flex items-baseline gap-2">
                {plan.originalPrice && (
                  <span className="text-lg text-onyx-400 line-through">€{plan.originalPrice}</span>
                )}
                <span className="display tabular text-6xl text-onyx-50">€{plan.price}</span>
                <span className="text-sm text-onyx-400">/{plan.period}</span>
              </p>

              <ul className="mt-8 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-snug text-onyx-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleChoose(plan)}
                className={`mt-10 w-full ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}
              >
                Scegli {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
