import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import Avatar from './Avatar.jsx'

const NAV_LINKS = [
  { label: 'Discipline', href: '#discipline' },
  { label: 'Attrezzature', href: '#attrezzature' },
  { label: 'Prezzi', href: '#prezzi' },
  { label: 'Dove siamo', href: '#dove-siamo' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { openAuthModal } = useUI()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleNavClick = (href) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 120)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-out ${
        scrolled || mobileOpen ? 'border-b border-white/10 bg-onyx-950/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 sm:px-10">
        <Link to="/" className="display-sm shrink-0 text-lg text-onyx-50 sm:text-xl" aria-label="Muscle & Fitness, torna alla home">
          Muscle <span className="font-medium text-accent-400">&amp;</span> Fitness
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="group relative py-1 text-sm text-onyx-200 transition-colors duration-300 hover:text-onyx-50"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-400 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 transition-colors duration-300 hover:border-white/40"
              >
                <Avatar seed={user.email} name={user.name} size={30} />
                <span className="text-sm text-onyx-100">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-onyx-400" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-[12px] border border-white/10 bg-onyx-900"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-onyx-100 transition-colors hover:bg-onyx-800"
                    >
                      <LayoutDashboard className="h-4 w-4 text-onyx-400" /> Area soci
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-onyx-100 transition-colors hover:bg-onyx-800"
                    >
                      <LogOut className="h-4 w-4 text-onyx-400" /> Esci
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-sm text-onyx-200 transition-colors duration-300 hover:text-onyx-50"
              >
                Accedi
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="rounded-full bg-accent-500 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-onyx-950 transition-colors duration-300 hover:bg-accent-400"
              >
                Diventa socio
              </button>
            </>
          )}
        </div>

        <button
          className="text-onyx-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="border-b border-white/5 py-4 text-left display-sm text-lg text-onyx-100"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-5 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="btn-ghost w-full">
                      Area soci
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        navigate('/')
                      }}
                      className="btn-ghost w-full"
                    >
                      Esci
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openAuthModal('login')} className="btn-ghost w-full">
                      Accedi
                    </button>
                    <button onClick={() => openAuthModal('register')} className="btn-primary w-full">
                      Diventa socio
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
