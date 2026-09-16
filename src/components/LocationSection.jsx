import React from 'react'
import { Navigation } from 'lucide-react'

const ADDRESS = 'Via F. Gullo, Spezzano Piccolo, CS, Italia'
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// The embed renders Google's raw error page until "Maps Embed API" is enabled on the key's project.
const MAPS_EMBED_ENABLED = import.meta.env.VITE_GOOGLE_MAPS_EMBED_ENABLED === 'true'
const EMBED_SRC = `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(
  ADDRESS
)}&zoom=15`
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`

const ROWS = [
  { k: 'Indirizzo', v: 'Via F. Gullo, Spezzano Piccolo (CS)' },
  { k: 'Orari', v: 'Tutti i giorni, 06:00 – 24:00' },
  { k: 'Telefono', v: '+39 333 19 60 623' },
  { k: 'Instagram', v: '@muscleefitness04' },
]

export default function LocationSection() {
  return (
    <section id="dove-siamo" className="border-t border-white/10 bg-onyx-900">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:py-28 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]">
          <h2 className="display text-[10vw] text-onyx-50 sm:text-6xl lg:text-7xl">
            Siamo
            <br />
            in Presila
          </h2>

          <dl className="mt-10 max-w-md">
            {ROWS.map((row) => (
              <div key={row.k} className="flex justify-between gap-6 border-t border-white/10 py-4 last:border-b">
                <dt className="text-xs uppercase tracking-[0.14em] text-onyx-400">{row.k}</dt>
                <dd className="text-right text-sm text-onyx-100">{row.v}</dd>
              </div>
            ))}
          </dl>

          <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" className="btn-primary mt-10 self-start">
            <Navigation className="h-4 w-4" /> Indicazioni stradali
          </a>
        </div>

        <div className="relative min-h-[380px] border-t border-white/10 bg-onyx-800 lg:min-h-full lg:border-l lg:border-t-0">
          {MAPS_KEY && MAPS_EMBED_ENABLED ? (
            <iframe
              title="Mappa della sede di Muscle &amp; Fitness"
              src={EMBED_SRC}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.4] contrast-[1.05]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="group absolute inset-0 block overflow-hidden"
              aria-label="Apri la posizione in Google Maps"
            >
              <img
                src="/images/floor-wide.jpg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover opacity-50 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-60"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-onyx-950/90 to-onyx-950/20" />
              <span className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-4">
                <span className="display-sm text-3xl text-onyx-50">
                  Via F. Gullo
                  <br />
                  Spezzano Piccolo
                </span>
                <span className="shrink-0 text-sm text-onyx-200 underline-offset-4 group-hover:underline">
                  Apri in Maps
                </span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
