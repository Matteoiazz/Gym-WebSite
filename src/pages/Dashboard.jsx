import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ScanLine, CheckCircle2, AlertTriangle, XCircle, Loader2, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getSubStatus, getCertStatus, canAccessGym } from '../utils/status.js'
import QRCodeView from '../components/QRCode.jsx'

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_CERT_FILE_BYTES = 4 * 1024 * 1024

const SUB_META = {
  active: { label: 'Attivo', cls: 'text-emerald-400', Icon: CheckCircle2 },
  cancelling: { label: 'In scadenza', cls: 'text-amber-400', Icon: AlertTriangle },
  expired: { label: 'Scaduto', cls: 'text-red-400', Icon: XCircle },
}

const CERT_META = {
  none: { label: 'Non caricato', cls: 'text-onyx-400' },
  pending: { label: 'In revisione', cls: 'text-amber-400' },
  approved: { label: 'Approvato', cls: 'text-emerald-400' },
  rejected: { label: 'Rifiutato', cls: 'text-red-400' },
  expired: { label: 'Scaduto', cls: 'text-red-400' },
}

function Panel({ title, aside, children, className = '' }) {
  return (
    <section className={`surface-line p-6 sm:p-8 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display-sm text-xl text-onyx-50 sm:text-2xl">{title}</h2>
        {aside}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function CertUploadButton({ onUpload, label = 'Carica certificato' }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    if (file.size > MAX_CERT_FILE_BYTES) {
      setError('Il file supera i 4MB. Esporta il PDF a una risoluzione più bassa e riprova.')
      return
    }
    setUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err.message || 'Caricamento non riuscito. Riprova.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-5">
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-ghost px-5 py-2.5 text-xs"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? 'Caricamento…' : label}
      </button>
      <p className="mt-2 text-xs text-onyx-400">PDF, JPG o PNG, massimo 4MB.</p>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user, logGymAccess, cancelSubscription, reactivateSubscription, updateProfile, uploadCertificate } =
    useAuth()
  const { clearSelection } = useCart()
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email })
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [subActionError, setSubActionError] = useState('')
  const [subActionLoading, setSubActionLoading] = useState(false)
  const navigate = useNavigate()

  const handleSimulateAccess = () => {
    if (!access.ok) return
    setScanning(true)
    setAccessError('')
    setTimeout(async () => {
      try {
        await logGymAccess()
        setScanSuccess(true)
        setTimeout(() => setScanSuccess(false), 2200)
      } catch (err) {
        setAccessError(err.message)
      } finally {
        setScanning(false)
      }
    }, 1400)
  }

  const startEditProfile = () => {
    setProfileForm({ name: user.name, email: user.email })
    setProfileError('')
    setEditingProfile(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const name = profileForm.name.trim()
    const email = profileForm.email.trim()
    if (!name) return setProfileError('Inserisci il tuo nome.')
    if (!EMAIL_RE.test(email)) return setProfileError('Questa email non è valida: controlla la @ e il dominio.')
    setSavingProfile(true)
    setProfileError('')
    try {
      await updateProfile({ name, email })
      setEditingProfile(false)
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleConfirmCancel = async () => {
    setSubActionLoading(true)
    setSubActionError('')
    try {
      await cancelSubscription()
      setShowCancelConfirm(false)
    } catch (err) {
      setSubActionError(err.message)
    } finally {
      setSubActionLoading(false)
    }
  }

  const handleReactivate = async () => {
    setSubActionLoading(true)
    setSubActionError('')
    try {
      await reactivateSubscription()
    } catch (err) {
      setSubActionError(err.message)
    } finally {
      setSubActionLoading(false)
    }
  }

  const goToCheckout = () => {
    clearSelection()
    navigate('/checkout')
  }

  const sub = user.subscription
  const status = getSubStatus(sub)
  const subMeta = SUB_META[status]
  const certStatus = getCertStatus(user.medicalCertificate)
  const certMeta = CERT_META[certStatus]
  const access = canAccessGym(user)

  return (
    <div className="min-h-screen bg-onyx-950 pb-24">
      <header className="plate relative h-[44vh] min-h-[320px]">
        <img src="/images/floor-wide.jpg" alt="" aria-hidden="true" className="absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-10 sm:px-10">
          <h1 className="display text-5xl text-onyx-50 sm:text-7xl">Ciao, {user.name.split(' ')[0]}</h1>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-onyx-300">
              Socio dal {dateFmt.format(new Date(user.memberSince))} · Tessera{' '}
              <span className="tabular font-mono text-onyx-200">#{user.id.slice(-8).toUpperCase()}</span>
            </p>
            <button onClick={goToCheckout} className="btn-primary self-start">
              Acquista o rinnova
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 grid max-w-[1400px] gap-4 px-6 sm:px-10 lg:grid-cols-12">
        {/* Badge: the object members actually use at the door leads the page. */}
        <section className="surface-line flex flex-col items-center p-6 text-center sm:p-8 lg:col-span-4 lg:row-span-2">
          <h2 className="display-sm self-start text-xl text-onyx-50 sm:text-2xl">Badge d'ingresso</h2>
          <div className="mt-8">
            <QRCodeView seed={user.qrSeed} size={208} />
          </div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-onyx-400">
            Avvicina il badge al lettore all'ingresso. Accesso autonomo dalle 06:00 alle 24:00.
          </p>

          <button
            onClick={handleSimulateAccess}
            disabled={scanning || !access.ok}
            className="btn-primary mt-8 w-full"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Lettura badge…
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" /> Simula accesso
              </>
            )}
          </button>

          <div className="mt-4 min-h-[1.25rem] text-xs">
            {!access.ok && (
              <p className="text-amber-400">
                {access.reason === 'certificate'
                  ? 'Per entrare serve un certificato medico approvato.'
                  : 'Nessun accesso disponibile: acquista un ingresso singolo o un abbonamento.'}
              </p>
            )}
            {accessError && <p className="text-red-400">{accessError}</p>}
            {access.ok && access.viaCredit && (
              <p className="text-onyx-400">
                Ingressi singoli rimasti:{' '}
                <span className="tabular font-semibold text-onyx-100">{user.singleEntryCredits}</span>
              </p>
            )}
            <AnimatePresence>
              {scanSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" /> Accesso autorizzato. Buon allenamento.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Panel
          title="Abbonamento"
          className="lg:col-span-8"
          aside={
            subMeta && (
              <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${subMeta.cls}`}>
                <subMeta.Icon className="h-3.5 w-3.5" /> {subMeta.label}
              </span>
            )
          }
        >
          {sub ? (
            <>
              <dl className="grid gap-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-onyx-400">Piano</dt>
                  <dd className="display-sm mt-1 text-3xl text-onyx-50">{sub.planName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-onyx-400">Tariffa</dt>
                  <dd className="tabular mt-2 text-lg text-onyx-100">€{sub.price}/mese</dd>
                </div>
                <div>
                  <dt className="text-xs text-onyx-400">
                    {status === 'expired' ? 'Scaduto il' : status === 'cancelling' ? 'Attivo fino al' : 'Prossimo rinnovo'}
                  </dt>
                  <dd className="tabular mt-2 text-lg text-onyx-100">{dateFmt.format(new Date(sub.renewsAt))}</dd>
                </div>
              </dl>

              <p className="rule mt-6 pt-5 text-sm text-onyx-400">
                {status === 'active' &&
                  `Rinnovo automatico ${sub.billing === 'annual' ? 'annuale' : 'mensile'} attivo dal ${dateFmt.format(
                    new Date(sub.startedAt)
                  )}.`}
                {status === 'cancelling' && "Rinnovo automatico disattivato: l'accesso resta valido fino alla data indicata."}
                {status === 'expired' && "L'abbonamento è scaduto. Riattivalo per tornare ad allenarti."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {status === 'active' && (
                  <>
                    <button onClick={goToCheckout} className="btn-ghost px-5 py-2.5 text-xs">
                      Cambia piano
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-2 py-2.5 text-xs text-onyx-400 underline-offset-4 transition-colors hover:text-red-400 hover:underline"
                    >
                      Disattiva rinnovo automatico
                    </button>
                  </>
                )}
                {status === 'cancelling' && (
                  <>
                    <button onClick={handleReactivate} disabled={subActionLoading} className="btn-primary px-5 py-2.5 text-xs">
                      {subActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Riattiva rinnovo
                    </button>
                    <button onClick={goToCheckout} className="btn-ghost px-5 py-2.5 text-xs">
                      Cambia piano
                    </button>
                  </>
                )}
                {status === 'expired' && (
                  <button onClick={goToCheckout} className="btn-primary px-5 py-2.5 text-xs">
                    Riattiva abbonamento
                  </button>
                )}
              </div>
              {subActionError && <p className="mt-3 text-xs text-red-400">{subActionError}</p>}
            </>
          ) : (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-onyx-400">
                Nessun abbonamento attivo. Scegli un piano per entrare quando vuoi, dalle 06:00 alle 24:00.
              </p>
              <button onClick={goToCheckout} className="btn-primary shrink-0 px-5 py-2.5 text-xs">
                Vedi i piani
              </button>
            </div>
          )}
        </Panel>

        <Panel
          title="Certificato medico"
          className="lg:col-span-8"
          aside={<span className={`text-xs font-semibold uppercase tracking-wide ${certMeta.cls}`}>{certMeta.label}</span>}
        >
          {certStatus === 'none' && (
            <>
              <p className="max-w-lg text-sm leading-relaxed text-onyx-400">
                Obbligatorio per legge per allenarti. Caricalo qui: lo staff lo verifica di norma entro 24–48 ore.
              </p>
              <CertUploadButton onUpload={uploadCertificate} />
            </>
          )}
          {certStatus === 'pending' && (
            <p className="text-sm leading-relaxed text-onyx-400">
              <span className="text-onyx-100">{user.medicalCertificate.fileName}</span> è in revisione dallo staff.
              Riceverai l'esito in quest'area.
            </p>
          )}
          {certStatus === 'approved' && (
            <p className="text-sm text-onyx-400">
              Valido fino al{' '}
              <span className="tabular text-onyx-100">{dateFmt.format(new Date(user.medicalCertificate.expiresAt))}</span>.
            </p>
          )}
          {certStatus === 'rejected' && (
            <>
              <p className="text-sm text-red-400">Motivo del rifiuto: {user.medicalCertificate.rejectionReason}</p>
              <CertUploadButton onUpload={uploadCertificate} label="Carica un nuovo certificato" />
            </>
          )}
          {certStatus === 'expired' && (
            <>
              <p className="text-sm text-amber-400">Il certificato è scaduto: caricane uno aggiornato per continuare.</p>
              <CertUploadButton onUpload={uploadCertificate} label="Carica certificato aggiornato" />
            </>
          )}
        </Panel>

        <Panel title="Storico" className="lg:col-span-8">
          {user.history.length === 0 ? (
            <p className="text-sm text-onyx-400">Ancora nessun movimento. Il primo accesso o acquisto comparirà qui.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {user.history.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-onyx-100">{entry.label}</p>
                    <p className="mt-0.5 text-xs text-onyx-400">
                      <time className="tabular">{dateTimeFmt.format(new Date(entry.date))}</time> · {entry.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {entry.amount > 0 && <span className="tabular text-sm text-onyx-50">€{entry.amount}</span>}
                    <span className="text-onyx-400">{entry.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Profilo" className="lg:col-span-4">
          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-xs text-onyx-400">
                  Nome
                </label>
                <input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="mb-1.5 block text-xs text-onyx-400">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  className="field"
                />
              </div>
              {profileError && <p className="text-xs text-red-400">{profileError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={savingProfile} className="btn-primary flex-1 px-5 py-2.5 text-xs">
                  {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Salva
                </button>
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-ghost px-5 py-2.5 text-xs">
                  Annulla
                </button>
              </div>
            </form>
          ) : (
            <>
              <dl className="divide-y divide-white/10 text-sm">
                {[
                  ['Nome', user.name],
                  ['Email', user.email],
                  ['Pagamento', user.paymentMethod ? `Carta •••• ${user.paymentMethod.last4}` : 'Nessuna carta salvata'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3 first:pt-0">
                    <dt className="text-onyx-400">{k}</dt>
                    <dd className="truncate text-right text-onyx-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <button onClick={startEditProfile} className="btn-ghost mt-6 w-full px-5 py-2.5 text-xs">
                Modifica profilo
              </button>
            </>
          )}
        </Panel>
      </div>

      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
          >
            <div onClick={() => setShowCancelConfirm(false)} className="absolute inset-0 bg-onyx-950/85" />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm rounded-[14px] bg-onyx-900 p-7 shadow-lift"
            >
              <h3 id="cancel-title" className="display-sm text-2xl text-onyx-50">
                Disattivare il rinnovo?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-onyx-400">
                L'accesso resta valido fino al{' '}
                <span className="tabular text-onyx-100">{sub && dateFmt.format(new Date(sub.renewsAt))}</span>. Dopo
                quella data non verrà addebitato nulla e l'abbonamento scade.
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={subActionLoading}
                  className="btn-ghost flex-1 px-4 py-2.5 text-xs"
                >
                  Mantieni
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={subActionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-white transition-colors duration-300 hover:bg-red-400 disabled:opacity-50"
                >
                  {subActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Disattiva
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
