import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Loader2, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { getSubStatus, getCertStatus } from '../utils/status.js'
import Avatar from '../components/Avatar.jsx'
import AdminUserDetailModal from '../components/AdminUserDetailModal.jsx'

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

const TONES = {
  neutral: 'bg-onyx-500',
  good: 'bg-emerald-400',
  warn: 'bg-amber-400',
  bad: 'bg-red-400',
}

const SUB_META = {
  none: { label: 'Nessuno', tone: 'neutral' },
  active: { label: 'Attivo', tone: 'good' },
  cancelling: { label: 'In scadenza', tone: 'warn' },
  expired: { label: 'Scaduto', tone: 'bad' },
}

const CERT_META = {
  none: { label: 'Non caricato', tone: 'neutral' },
  pending: { label: 'Da revisionare', tone: 'warn' },
  approved: { label: 'Approvato', tone: 'good' },
  rejected: { label: 'Rifiutato', tone: 'bad' },
  expired: { label: 'Scaduto', tone: 'bad' },
}

function Status({ meta }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-onyx-200">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONES[meta.tone]}`} />
      {meta.label}
    </span>
  )
}

export default function Admin() {
  const { user, logout, approveCertificate, rejectCertificate } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('users')
  const [selectedId, setSelectedId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const navigate = useNavigate()

  const load = useCallback(async (searchTerm = '') => {
    setLoading(true)
    setLoadError('')
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/admin/users${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`),
        api.get('/admin/stats'),
      ])
      setUsers(usersRes.users)
      setStats(statsRes)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300)
    return () => clearTimeout(timeout)
  }, [search, load])

  const pendingUsers = useMemo(
    () => users.filter((u) => getCertStatus(u.medicalCertificate) === 'pending'),
    [users]
  )

  const selectedUser = selectedId ? users.find((u) => u.id === selectedId) : null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleApprove = async (id) => {
    try {
      await approveCertificate(id)
      load(search)
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const handleQuickReject = async (id) => {
    if (!rejectReason.trim()) return
    try {
      await rejectCertificate(id, rejectReason.trim())
      setRejectingId(null)
      setRejectReason('')
      load(search)
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const figures = [
    { label: 'Soci', value: stats?.total },
    { label: 'Abbonamenti attivi', value: stats?.activeSubs },
    { label: 'Certificati da revisionare', value: stats?.pendingCerts, warn: (stats?.pendingCerts ?? 0) > 0 },
    { label: 'Ingressi registrati', value: stats?.totalAccesses },
  ]

  return (
    <div className="min-h-screen bg-onyx-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-onyx-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div className="flex items-baseline gap-3">
            <Link to="/" className="display-sm text-lg text-onyx-50">
              Muscle <span className="font-medium text-accent-400">&amp;</span> Fitness
            </Link>
            <span className="hidden text-xs text-onyx-400 sm:inline">Pannello staff</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-onyx-400 md:inline">{user?.name}</span>
            <Link to="/" className="flex items-center gap-1.5 text-onyx-300 transition-colors hover:text-onyx-50">
              <ExternalLink className="h-3.5 w-3.5" /> Sito
            </Link>
            <button onClick={handleLogout} className="text-onyx-300 transition-colors hover:text-red-400">
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
        <h1 className="display text-5xl text-onyx-50 sm:text-6xl">Soci</h1>

        {loadError && (
          <p role="alert" className="mt-6 rounded-[10px] bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        )}

        <dl className="mt-8 grid grid-cols-2 gap-px border-y border-white/10 bg-white/10 lg:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label} className="bg-onyx-950 px-1 py-5 sm:px-5 lg:first:pl-0">
              <dt className="text-xs text-onyx-400">{f.label}</dt>
              <dd className={`display tabular mt-2 text-4xl ${f.warn ? 'text-amber-400' : 'text-onyx-50'}`}>
                {f.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>

        <div role="tablist" className="mt-10 flex gap-8 border-b border-white/10">
          {[
            { id: 'users', label: 'Tutti i soci' },
            { id: 'pending', label: 'Certificati', count: stats?.pendingCerts },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-300 ${
                tab === t.id
                  ? 'border-accent-500 text-onyx-50'
                  : 'border-transparent text-onyx-400 hover:text-onyx-100'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="tabular rounded-full bg-amber-400 px-1.5 text-[11px] font-semibold text-onyx-950">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="mt-6">
            <div className="relative max-w-sm">
              <label htmlFor="admin-search" className="sr-only">
                Cerca socio
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-onyx-400" />
              <input
                id="admin-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per nome o email"
                className="field pl-10"
              />
            </div>

            <div className="mt-6">
              <div className="hidden grid-cols-12 gap-4 border-b border-white/10 pb-3 text-xs text-onyx-400 sm:grid">
                <span className="col-span-4">Socio</span>
                <span className="col-span-2">Iscritto</span>
                <span className="col-span-3">Abbonamento</span>
                <span className="col-span-2">Certificato</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20" role="status">
                  <Loader2 className="h-5 w-5 animate-spin text-onyx-400" />
                  <span className="sr-only">Caricamento soci</span>
                </div>
              ) : users.length === 0 ? (
                <p className="py-16 text-sm text-onyx-400">
                  {search ? `Nessun socio corrisponde a "${search}".` : 'Nessun socio registrato.'}
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {users.map((u) => {
                    const subStatus = getSubStatus(u.subscription)
                    const certStatus = getCertStatus(u.medicalCertificate)
                    return (
                      <li key={u.id}>
                        <button
                          onClick={() => setSelectedId(u.id)}
                          className="group grid w-full grid-cols-12 items-center gap-4 py-4 text-left transition-colors duration-200 hover:bg-white/[0.025]"
                        >
                          <div className="col-span-10 flex min-w-0 items-center gap-3 sm:col-span-4">
                            <Avatar seed={u.email} name={u.name} size={34} />
                            <div className="min-w-0">
                              <p className="truncate text-sm text-onyx-50">{u.name}</p>
                              <p className="truncate text-xs text-onyx-400">{u.email}</p>
                            </div>
                          </div>
                          <time className="tabular col-span-2 hidden text-xs text-onyx-400 sm:block">
                            {dateFmt.format(new Date(u.memberSince))}
                          </time>
                          <div className="col-span-3 hidden sm:block">
                            <Status meta={SUB_META[subStatus]} />
                            {u.subscription && <p className="mt-0.5 pl-3.5 text-xs text-onyx-400">{u.subscription.planName}</p>}
                          </div>
                          <div className="col-span-2 hidden sm:block">
                            <Status meta={CERT_META[certStatus]} />
                          </div>
                          <ChevronRight className="col-span-2 h-4 w-4 justify-self-end text-onyx-400 transition-colors group-hover:text-onyx-200 sm:col-span-1" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'pending' && (
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20" role="status">
                <Loader2 className="h-5 w-5 animate-spin text-onyx-400" />
              </div>
            ) : pendingUsers.length === 0 ? (
              <p className="py-16 text-sm text-onyx-400">Nessun certificato in attesa. Tutto revisionato.</p>
            ) : (
              <ul className="divide-y divide-white/10 border-b border-white/10">
                {pendingUsers.map((u) => (
                  <li key={u.id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <button onClick={() => setSelectedId(u.id)} className="flex min-w-0 items-center gap-3 text-left">
                      <Avatar seed={u.email} name={u.name} size={38} />
                      <div className="min-w-0">
                        <p className="text-sm text-onyx-50">{u.name}</p>
                        <p className="truncate text-xs text-onyx-400">
                          {u.medicalCertificate.fileName} · caricato il{' '}
                          <time className="tabular">{dateFmt.format(new Date(u.medicalCertificate.uploadedAt))}</time>
                        </p>
                      </div>
                    </button>

                    {rejectingId === u.id ? (
                      <div className="flex w-full flex-col gap-2 lg:w-96">
                        <label htmlFor={`reject-${u.id}`} className="sr-only">
                          Motivo del rifiuto
                        </label>
                        <textarea
                          id={`reject-${u.id}`}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Motivo del rifiuto, sarà mostrato al socio"
                          rows={2}
                          className="field resize-none text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickReject(u.id)}
                            disabled={!rejectReason.trim()}
                            className="inline-flex flex-1 items-center justify-center rounded-full bg-red-500 px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-400 disabled:opacity-40"
                          >
                            Rifiuta certificato
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null)
                              setRejectReason('')
                            }}
                            className="btn-ghost px-4 py-2 text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {u.medicalCertificate.hasFile && (
                          <a
                            href={api.fileUrl(`/certificates/${u.id}/file`)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost px-4 py-2 text-xs"
                          >
                            Apri file
                          </a>
                        )}
                        <button onClick={() => handleApprove(u.id)} className="btn-primary px-4 py-2 text-xs">
                          Approva
                        </button>
                        <button
                          onClick={() => setRejectingId(u.id)}
                          className="px-3 py-2 text-xs text-onyx-400 transition-colors hover:text-red-400"
                        >
                          Rifiuta
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <AdminUserDetailModal user={selectedUser} onClose={() => setSelectedId(null)} onChanged={() => load(search)} />
      )}
    </div>
  )
}
