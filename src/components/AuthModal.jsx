import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const { login, register, loading } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setForm({ name: '', email: '', password: '' })
      setLocalError('')
      setShowPassword(false)
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    try {
      if (mode === 'login') {
        const result = await login(form.email, form.password)
        onSuccess?.({ isAdmin: !!result?.isAdmin })
      } else {
        await register(form.name, form.email, form.password)
        onSuccess?.({ isAdmin: false })
      }
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setLocalError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-onyx-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[14px] bg-onyx-900 shadow-lift"
          >
            <div className="plate relative h-28">
              <img src="/images/weights-room.jpg" alt="" aria-hidden="true" />
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-onyx-950/60 text-onyx-100 transition-colors duration-300 hover:bg-onyx-950"
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-7">
              <h2 className="display-sm text-3xl text-onyx-50">
                {mode === 'login' ? 'Bentornato' : 'Diventa socio'}
              </h2>
              <p className="mt-2 text-sm text-onyx-400">
                {mode === 'login'
                  ? 'Accedi per gestire abbonamento, badge e certificato.'
                  : 'Crea l’account: il certificato medico lo carichi subito dopo.'}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <AnimatePresence mode="wait" initial={false}>
                  {mode === 'register' && (
                    <motion.div
                      key="name-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-onyx-400">
                        Nome completo
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onyx-400" />
                        <input
                          type="text"
                          required={mode === 'register'}
                          value={form.name}
                          onChange={handleChange('name')}
                          placeholder="Mario Rossi"
                          className="field pl-10"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-onyx-400">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onyx-400" />
                    <input
                      type="text"
                      required
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="mario.rossi@email.com"
                      className="field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-onyx-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onyx-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={mode === 'register' ? 8 : undefined}
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="••••••••"
                      className="field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-400 hover:text-onyx-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="mt-1.5 text-xs text-onyx-400">Almeno 8 caratteri.</p>
                  )}
                </div>

                <AnimatePresence>
                  {localError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 overflow-hidden rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {localError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Attendere...
                    </>
                  ) : mode === 'login' ? (
                    'Accedi'
                  ) : (
                    'Crea Account'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-onyx-400">
                {mode === 'login' ? 'Non hai un account?' : 'Hai già un account?'}{' '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-semibold text-accent-400 hover:text-accent-300"
                >
                  {mode === 'login' ? 'Registrati' : 'Accedi'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
