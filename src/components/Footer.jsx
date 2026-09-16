import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Instagram, Phone } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Discipline', type: 'scroll', href: '#discipline' },
  { label: 'Attrezzature', type: 'scroll', href: '#attrezzature' },
  { label: 'Prezzi', type: 'scroll', href: '#prezzi' },
  { label: 'Dove siamo', type: 'scroll', href: '#dove-siamo' },
  { label: 'Area soci', type: 'route', to: '/dashboard' },
]

export default function Footer() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleScrollLink = (href) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 120)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer id="contatti" className="border-t border-white/10 bg-onyx-950">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="display text-4xl text-onyx-50 sm:text-5xl">
              Muscle
              <br />
              &amp; Fitness
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-onyx-400">
              A.S.D. Muscle &amp; Fitness — Via F. Gullo, Spezzano Piccolo (CS).
              Aperti tutti i giorni dalle 06:00 alle 24:00.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="https://www.instagram.com/muscleefitness04/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-onyx-300 transition duration-300 ease-out hover:border-white/50 hover:text-onyx-50"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="tel:+393331960623"
                aria-label="Telefono"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-onyx-300 transition duration-300 ease-out hover:border-white/50 hover:text-onyx-50"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav className="lg:col-span-3">
            <h2 className="text-xs uppercase tracking-[0.14em] text-onyx-400">Naviga</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  {item.type === 'route' ? (
                    <Link to={item.to} className="text-onyx-200 transition-colors hover:text-accent-400">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleScrollLink(item.href)}
                      className="text-onyx-200 transition-colors hover:text-accent-400"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className="text-xs uppercase tracking-[0.14em] text-onyx-400">Contatti</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="tel:+393331960623" className="text-onyx-200 transition-colors hover:text-accent-400">
                  +39 333 19 60 623
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/muscleefitness04/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-onyx-200 transition-colors hover:text-accent-400"
                >
                  @muscleefitness04
                </a>
              </li>
              <li className="text-onyx-400">Via F. Gullo, Spezzano Piccolo (CS)</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 text-xs text-onyx-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} A.S.D. Muscle &amp; Fitness</p>
          <p>Aperti tutti i giorni, 06:00 – 24:00</p>
        </div>
      </div>
    </footer>
  )
}
