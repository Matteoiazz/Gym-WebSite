export function getSubStatus(sub) {
  if (!sub) return 'none'
  if (sub.cancelAtPeriodEnd) {
    return new Date() > new Date(sub.renewsAt) ? 'expired' : 'cancelling'
  }
  return 'active'
}

export function getCertStatus(cert) {
  if (!cert || !cert.status || cert.status === 'none') return 'none'
  if (cert.status === 'approved') {
    if (cert.expiresAt && new Date() > new Date(cert.expiresAt)) return 'expired'
    return 'approved'
  }
  return cert.status
}

export function canAccessGym(user) {
  const certStatus = getCertStatus(user.certificate)
  if (certStatus !== 'approved') {
    return { ok: false, reason: 'certificate' }
  }
  const subStatus = getSubStatus(user.subscription)
  if (subStatus === 'active' || subStatus === 'cancelling') {
    return { ok: true, viaCredit: false }
  }
  if ((user.singleEntryCredits || 0) > 0) {
    return { ok: true, viaCredit: true }
  }
  return { ok: false, reason: 'no-access' }
}
