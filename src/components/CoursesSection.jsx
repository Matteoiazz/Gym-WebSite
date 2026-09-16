import React from 'react'
import { courses } from '../data/courses.js'
import Reveal from './Reveal.jsx'

function Tile({ course, size, delay }) {
  const heights = {
    lead: 'h-[68vh] min-h-[420px]',
    tall: 'h-64 sm:h-[calc(34vh-0.5rem)] sm:min-h-[206px]',
    base: 'h-72',
  }

  return (
    <article className="group relative">
      <Reveal className={`plate rounded-[14px] ${heights[size]}`} delay={delay}>
        <img
          src={course.image}
          alt={course.name}
          loading="lazy"
          className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </Reveal>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 lg:p-8">
        <h3 className={`display-sm text-onyx-50 ${size === 'lead' ? 'text-4xl lg:text-5xl' : 'text-2xl'}`}>
          {course.name}
        </h3>
        {size !== 'tall' && (
          <p className="mt-2 max-w-md text-xs leading-relaxed text-onyx-200 sm:text-sm">
            {course.description}
          </p>
        )}
        <p className="mt-3 text-xs text-onyx-400">
          {course.duration} · {course.level} · {course.calories}
        </p>
      </div>
    </article>
  )
}

export default function CoursesSection() {
  const [lead, second, third, ...rest] = courses

  return (
    <section id="discipline" className="bg-onyx-950 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-2xl text-[10vw] text-onyx-50 sm:text-6xl lg:text-7xl">
            Ogni disciplina,
            <br />
            una sola tessera
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-onyx-300">
            Dal ring alla vasca, dalla sala pesi al recupero funzionale. Ogni
            attività è seguita da istruttori qualificati e inclusa
            nell'abbonamento.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Tile course={lead} size="lead" delay={0} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Tile course={second} size="tall" delay={0.08} />
            <Tile course={third} size="tall" delay={0.14} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((course, i) => (
            <div
              key={course.id}
              className={rest.length % 2 === 1 && i === rest.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}
            >
              <Tile course={course} size="base" delay={0.05 * i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
