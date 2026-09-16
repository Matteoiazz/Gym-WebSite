export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    memberSince: user.memberSince,
    qrSeed: user.qrSeed,
    singleEntryCredits: user.singleEntryCredits,
    paymentMethod: user.paymentLast4 ? { last4: user.paymentLast4 } : null,
    subscription: user.subscription
      ? {
          planId: user.subscription.planId,
          planName: user.subscription.planName,
          price: user.subscription.price,
          billing: user.subscription.billing,
          startedAt: user.subscription.startedAt,
          renewsAt: user.subscription.renewsAt,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        }
      : null,
    medicalCertificate: user.certificate
      ? {
          status: user.certificate.status,
          fileName: user.certificate.fileName,
          hasFile: !!user.certificate.filePath,
          uploadedAt: user.certificate.uploadedAt,
          reviewedAt: user.certificate.reviewedAt,
          reviewedBy: user.certificate.reviewedBy,
          expiresAt: user.certificate.expiresAt,
          rejectionReason: user.certificate.rejectionReason,
        }
      : { status: 'none', fileName: null, hasFile: false },
    history: (user.history || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((h) => ({
        id: h.id,
        date: h.date,
        label: h.label,
        amount: h.amount,
        method: h.method,
        status: h.status,
      })),
  }
}
