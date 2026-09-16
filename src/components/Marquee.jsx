import React from 'react'

const ITEMS = [
  'Technogym',
  'Panatta',
  'Diamond',
  'Piscina',
  'Kick-boxing',
  'Crosstraining',
  'Riabilitazione motoria',
  'Accesso badge 06—24',
]

function Row({ hidden }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {ITEMS.map((item) => (
        <span key={item} className="flex shrink-0 items-center">
          <span className="display-sm px-8 text-2xl text-onyx-200 sm:text-3xl">{item}</span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-onyx-900 py-6">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
