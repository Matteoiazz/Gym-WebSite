import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'

export default function CtaBanner() {
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useUI()

  const start = () => {
    if (isAuthenticated) document.querySelector('#prezzi')?.scrollIntoView({ behavior: 'smooth' })
    else openAuthModal('register')
  }

  return (
    <section className="relative isolate overflow-hidden">
      <img
        src="/images/crosstraining.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-onyx-950/80" />

      <div className="mx-auto max-w-[1400px] px-6 py-28 sm:px-10 lg:py-36">
        <h2 className="display max-w-4xl text-[11vw] text-onyx-50 sm:text-6xl lg:text-[clamp(3.5rem,6vw,6rem)]">
          Il badge è pronto
          <br />
          in giornata
        </h2>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-onyx-200">
          Registrati, carica il certificato medico e scegli l'accesso. Appena lo
          staff approva il certificato, la porta si apre con il tuo badge.
        </p>
        <button onClick={start} className="btn-primary mt-10">
          Diventa socio
        </button>
      </div>
    </section>
  )
}
