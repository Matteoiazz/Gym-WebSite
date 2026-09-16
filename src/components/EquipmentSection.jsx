import React from 'react'
import Reveal from './Reveal.jsx'

const BRANDS = [
  {
    name: 'Technogym',
    line: 'Cardio e isotoniche',
    image: '/images/cardio.jpg',
    text: 'Tapis roulant, vogatori e linea isotonica per il lavoro guidato, con biomeccanica studiata per chi parte da zero e per chi allena da anni.',
  },
  {
    name: 'Panatta',
    line: 'Ghisa e forza pura',
    image: '/images/plates.jpg',
    text: 'Le macchine a carico libero e i rack che reggono il lavoro pesante: la parte della sala dove si alza davvero.',
  },
  {
    name: 'Diamond',
    line: 'Sala pesi completa',
    image: '/images/dumbbells.jpg',
    text: 'Panche, manubriere e postazioni dedicate, dalla prima scheda al bodybuilding avanzato.',
  },
]

export default function EquipmentSection() {
  return (
    <section id="attrezzature" className="bg-onyx-950 pb-24 lg:pb-32">
      <Reveal className="plate h-[46vh] min-h-[320px] w-full">
        <img src="/images/machines-row.jpg" alt="La sala attrezzi vista dall'ingresso" loading="lazy" />
      </Reveal>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="-mt-24 relative z-10 lg:-mt-32">
          <h2 className="display max-w-3xl text-[9vw] text-onyx-50 sm:text-6xl lg:text-7xl">
            Ferro serio,
            <br />
            non arredamento
          </h2>
        </div>

        <div className="mt-16 grid gap-y-14 lg:grid-cols-3 lg:gap-x-10">
          {BRANDS.map((brand, i) => (
            <div key={brand.name} className="flex flex-col">
              <Reveal className="plate h-56 rounded-[14px]" delay={0.06 * i}>
                <img src={brand.image} alt={`Attrezzature ${brand.name}`} loading="lazy" />
              </Reveal>
              <h3 className="display-sm mt-6 text-3xl text-onyx-50">{brand.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-accent-400">{brand.line}</p>
              <p className="mt-4 text-sm leading-relaxed text-onyx-300">{brand.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
