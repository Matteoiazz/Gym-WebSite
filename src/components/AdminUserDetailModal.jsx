import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { getSubStatus, getCertStatus } from '../utils/status.js'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import Avatar from './Avatar.jsx'

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const SUB_META = {
  none: { label: 'Nessun abbonamento', cls: 'text-onyx-400' },
  active: { label: 'Attivo', cls: 'text-emerald-400' },
  cancelling: { label: 'In scadenza', cls: 'text-amber-400' },
  expired: { label: 'Scaduto', cls: 'text-red-400' },
}

const CERT_META = {
  none: { label: 'Non caricato', cls: 'text-onyx-400' },
  pending: { label: 'Da revisionare', cls: 'text-amber-400' },
  approved: { label: 'Approvato', cls: 'text-emerald-400' },
  rejected: { label: 'Rifiutato', cls: 'text-red-400' },
  expired: { label: 'Scaduto', cls: 'text-red-400' },
}

function Block({ title, aside, children }) {
  return (
    <section className="border-t border-white/10 px-6 py-6 sm:px-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="display-sm text-lg text-onyx-50">{title}</h3>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Rows({ rows }) {
  return (
    <dl className="divide-y divide-white/5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5">
          <dt className="text-onyx-400">{k}</dt>
          <dd className="tabular text-right text-onyx-100">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function AdminUserDetailModal({ user, onClose, onChanged }) {
  const { approveCertificate, rejectCertificate } = useAuth()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!user) return null

  const subStatus = getSubStatus(user.subscription)
  const certStatus = getCertStatus(user.medicalCertificate)
  const subMeta = SUB_META[subStatus]
  const certMeta = CERT_META[certStatus]
  const cert = user.medicalCertificate

  const handleApprove = async () => {
    setActionLoading(true)
    setActionError('')
    try {
      await approveCertificate(user.id)
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) return
    setActionLoading(true)
    setActionError('')
    try {
      await rejectCertificate(user.id, reason.trim())
      setRejecting(false)
      setReason('')
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const certRows = cert?.fileName
    ? [
        ['File', cert.fileName],
        ['Caricato', dateTimeFmt.format(new Date(cert.uploadedAt))],
        ...(cert.reviewedAt ? [['Revisionato', dateTimeFmt.format(new Date(cert.reviewedAt))]] : []),
        ...(cert.expiresAt ? [['Valido fino al', dateFmt.format(new Date(cert.expiresAt))]] : []),
      ]
    : []

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="member-name">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-onyx-950/70"
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 bg-onyx-900"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-6 pt-7 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar seed={user.email} name={user.name} size={48} />
            <div className="min-w-0">
              <h2 id="member-name" className="display-sm truncate text-2xl text-onyx-50">
                {user.name}
              </h2>
              <p className="truncate text-sm text-onyx-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi dettaglio socio"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-onyx-300 transition-colors duration-300 hover:border-white/40 hover:text-onyx-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Block title="Socio">
          <Rows
            rows={[
              ['Iscritto il', dateFmt.format(new Date(user.memberSince))],
              ['Tessera', `#${user.id.slice(-8).toUpperCase()}`],
              ['Ingressi singoli', String(user.singleEntryCredits || 0)],
              ['Carta', user.paymentMethod ? `•••• ${user.paymentMethod.last4}` : 'Nessuna'],
            ]}
          />
        </Block>

        <Block
          title="Abbonamento"
          aside={<span className={`text-xs font-semibold uppercase tracking-wide ${subMeta.cls}`}>{subMeta.label}</span>}
        >
          {user.subscription ? (
            <Rows
              rows={[
                ['Piano', user.subscription.planName],
                ['Tariffa', `€${user.subscription.price}/mese`],
                [subStatus === 'expired' ? 'Scaduto il' : 'Rinnovo', dateFmt.format(new Date(user.subscription.renewsAt))],
              ]}
            />
          ) : (
            <p className="text-sm text-onyx-400">Nessun piano ricorrente attivo.</p>
          )}
        </Block>

        <Block
          title="Certificato medico"
          aside={<span className={`text-xs font-semibold uppercase tracking-wide ${certMeta.cls}`}>{certMeta.label}</span>}
        >
          {cert?.fileName ? (
            <>
              <Rows rows={certRows} />
              {cert.rejectionReason && (
                <p className="mt-3 text-sm text-red-400">Motivo del rifiuto: {cert.rejectionReason}</p>
              )}
              {cert.hasFile && (
                <a
                  href={api.fileUrl(`/certificates/${user.id}/file`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost mt-5 px-5 py-2.5 text-xs"
                >
                  Apri il documento
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-onyx-400">Il socio non ha ancora caricato il certificato.</p>
          )}

          {certStatus === 'pending' && (
            <div className="mt-6 border-t border-white/10 pt-6">
              {rejecting ? (
                <div className="space-y-3">
                  <label htmlFor="reject-reason" className="block text-xs text-onyx-400">
                    Motivo del rifiuto, sarà mostrato al socio
                  </label>
                  <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Es. documento illeggibile, data di scadenza superata"
                    rows={3}
                    className="field resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={!reason.trim() || actionLoading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-400 disabled:opacity-40"
                    >
                      {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Rifiuta certificato
                    </button>
                    <button onClick={() => setRejecting(false)} disabled={actionLoading} className="btn-ghost px-5 py-2.5 text-xs">
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleApprove} disabled={actionLoading} className="btn-primary flex-1 px-5 py-2.5 text-xs">
                    {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Approva certificato
                  </button>
                  <button onClick={() => setRejecting(true)} disabled={actionLoading} className="btn-ghost px-5 py-2.5 text-xs">
                    Rifiuta
                  </button>
                </div>
              )}
              {actionError && <p className="mt-3 text-xs text-red-400">{actionError}</p>}
            </div>
          )}
        </Block>

        <Block title="Storico completo">
          {user.history.length === 0 ? (
            <p className="text-sm text-onyx-400">Nessuna attività registrata.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.history.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-onyx-100">{entry.label}</p>
                    <time className="tabular text-xs text-onyx-400">{dateTimeFmt.format(new Date(entry.date))}</time>
                  </div>
                  {entry.amount > 0 && <span className="tabular shrink-0 text-sm text-onyx-50">€{entry.amount}</span>}
                </li>
              ))}
            </ul>
          )}
        </Block>
      </motion.aside>
    </div>
  )
}
