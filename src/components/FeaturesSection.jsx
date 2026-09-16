import React from 'react'
import { ScanFace, Users2, Dumbbell, Stethoscope, Lightbulb, ParkingCircle } from 'lucide-react'
import Reveal from './Reveal.jsx'

const FEATURES = [
  {
    icon: ScanFace,
    title: 'Accesso con badge smart',
    text: 'Entri in autonomia dalle 06:00 alle 24:00, tutti i giorni, con il badge digitale della tua area personale.',
  },
  {
    icon: Users2,
    title: 'Coach qualificati',
    text: 'Istruttori certificati per kick-boxing, nuoto, crosstraining e sala pesi, presenti in sala.',
  },
  {
    icon: Dumbbell,
    title: 'Sala attrezzi completa',
    text: 'Technogym, Panatta e Diamond: cardio, isotoniche, carico libero e manubriera fino ai carichi alti.',
  },
  {
    icon: Stethoscope,
    title: 'Riabilitazione motoria',
    text: 'Percorsi di recupero funzionale seguiti da professionisti, con attrezzature dedicate.',
  },
  {
    icon: Lightbulb,
    title: 'Impianto domotico',
    text: 'Luci, audio e clima gestiti in modo automatico: la sala è sempre pronta anche quando entri da solo.',
  },
  {
    icon: ParkingCircle,
    title: 'Parcheggio gratuito',
    text: 'Posti riservati ai soci davanti alla struttura, senza strisce blu e senza giri per il paese.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-onyx-950 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="display text-[9vw] text-onyx-50 sm:text-6xl lg:text-7xl">
              Perché
              <br />
              qui
            </h2>
            <Reveal className="plate mt-10 hidden h-80 rounded-[14px] lg:block">
              <img src="/images/bikes.jpg" alt="La zona cardio" loading="lazy" />
            </Reveal>
          </div>

          <dl className="divide-y divide-white/10 lg:col-span-7">
            {FEATURES.map((f) => (
              <div key={f.title} className="group flex gap-6 py-7 first:pt-0">
                <f.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-onyx-400 transition-colors duration-300 group-hover:text-accent-400"
                  strokeWidth={1.75}
                />
                <div>
                  <dt className="display-sm text-xl text-onyx-50">{f.title}</dt>
                  <dd className="mt-2 max-w-lg text-sm leading-relaxed text-onyx-300">{f.text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
