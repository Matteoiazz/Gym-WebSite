import React from 'react'
import { testimonials } from '../data/testimonials.js'

export default function TestimonialsSection() {
  return (
    <section className="border-y border-white/10 bg-onyx-900 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <h2 className="display max-w-3xl text-[9vw] text-onyx-50 sm:text-6xl lg:text-7xl">
          Chi si allena qui,
          <br />
          ci resta
        </h2>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col border-t border-white/10 pt-6">
              <blockquote className="text-sm leading-relaxed text-onyx-200">{t.quote}</blockquote>
              <figcaption className="mt-6 text-xs">
                <span className="block font-display font-semibold uppercase tracking-[0.1em] text-onyx-50">
                  {t.name}
                </span>
                <span className="mt-1 block text-onyx-400">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
