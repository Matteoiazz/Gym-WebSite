import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const FAQS = [
  {
    q: 'Serve davvero il certificato medico?',
    a: "Sì, per legge è obbligatorio per l'attività sportiva non agonistica. Lo carichi dalla tua area personale dopo la registrazione: il nostro staff lo verifica di norma entro 24-48 ore.",
  },
  {
    q: "Come funziona l'accesso con il badge smart?",
    a: "Dopo l'iscrizione e l'approvazione del certificato, la tua area personale genera un badge digitale univoco. Lo avvicini al lettore all'ingresso e la porta si sblocca: nessuna attesa e nessuna reception da trovare aperta.",
  },
  {
    q: "Posso disdire l'abbonamento quando voglio?",
    a: 'Sì. Dalla dashboard disattivi il rinnovo automatico in qualsiasi momento: mantieni l’accesso fino alla fine del periodo già pagato, senza penali.',
  },
  {
    q: 'Qual è la differenza tra ingresso singolo e abbonamento?',
    a: "L'ingresso singolo vale un accesso una tantum, utile per provare la struttura. L'abbonamento mensile o annuale dà accesso illimitato 06:00–24:00 e include tutti i corsi collettivi.",
  },
  {
    q: "I corsi collettivi sono inclusi nell'abbonamento?",
    a: "Sì: kick-boxing, nuoto, crosstraining e le altre attività collettive sono incluse in Mensile e Annuale. L'ingresso singolo dà diritto a un corso a scelta.",
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-onyx-950 pb-24 lg:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid gap-12 xl:grid-cols-12 xl:gap-16">
          <h2 className="display text-[9vw] text-onyx-50 sm:text-6xl xl:sticky xl:top-28 xl:col-span-5 xl:self-start">
            Domande
            <br />
            ricorrenti
          </h2>

          <div className="xl:col-span-7">
            {FAQS.map((faq, i) => {
              const isOpen = open === i
              return (
                <div key={faq.q} className="border-t border-white/10 last:border-b">
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="display-sm text-lg text-onyx-50 sm:text-xl">{faq.q}</span>
                      <Plus
                        className={`mt-1 h-4 w-4 shrink-0 text-onyx-400 transition-transform duration-300 ease-out ${
                          isOpen ? 'rotate-45 text-accent-400' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 text-sm leading-relaxed text-onyx-300">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
