import React, { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const STATS = [
  { value: 500, suffix: '+', label: 'Soci attivi' },
  { value: 6, suffix: '+', label: 'Coach certificati' },
  { value: 10, suffix: '+', label: 'Corsi in calendario' },
  { value: 18, suffix: 'h', label: 'Aperti ogni giorno' },
]

// Cell borders are set per position: divide-* utilities misplace the rules when the grid wraps to 2x2.
const CELL = [
  'border-b border-r pr-5 lg:border-b-0 lg:pr-8',
  'border-b pl-5 lg:border-r lg:px-8',
  'border-r pr-5 lg:px-8',
  'pl-5 lg:pl-8',
]

function Figure({ value, suffix, label, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf
    let start = null
    const duration = 1400
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <div ref={ref} className={`border-white/10 py-8 lg:py-12 ${className}`}>
      <p className="display tabular text-[2.75rem] text-onyx-50 sm:text-6xl">
        {display}
        <span className="text-accent-400">{suffix}</span>
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-onyx-400">{label}</p>
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="relative isolate overflow-hidden border-y border-white/10">
      <img
        src="/images/floor-wide.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 -z-10 bg-onyx-950/70" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-2 px-6 sm:px-10 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Figure key={s.label} {...s} className={CELL[i]} />
        ))}
      </div>
    </section>
  )
}
