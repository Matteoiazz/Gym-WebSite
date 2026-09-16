import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setToken, getToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      setInitializing(false)
      return
    }
    api
      .get('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setInitializing(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    setLoading(true)
    try {
      const { token, user } = await api.post('/auth/login', { email, password })
      setToken(token)
      setUser(user)
      return { isAdmin: user.role === 'admin' }
    } catch (err) {
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setAuthError(null)
    setLoading(true)
    try {
      const { token, user } = await api.post('/auth/register', { name, email, password })
      setToken(token)
      setUser(user)
      return user
    } catch (err) {
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const subscribeToPlan = useCallback(async (plan, card) => {
    const { user, total } = await api.post('/subscriptions/checkout', { planId: plan.id, card })
    setUser(user)
    return total
  }, [])

  const cancelSubscription = useCallback(async () => {
    const { user } = await api.post('/subscriptions/cancel')
    setUser(user)
  }, [])

  const reactivateSubscription = useCallback(async () => {
    const { user } = await api.post('/subscriptions/reactivate')
    setUser(user)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const { user } = await api.patch('/users/me', updates)
    setUser(user)
  }, [])

  const uploadCertificate = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('certificate', file)
    const { user } = await api.upload('/certificates/upload', formData)
    setUser(user)
  }, [])

  const logGymAccess = useCallback(async () => {
    const { user } = await api.post('/access/simulate')
    setUser(user)
  }, [])

  const approveCertificate = useCallback(async (userId) => {
    await api.post(`/admin/certificates/${userId}/approve`)
  }, [])

  const rejectCertificate = useCallback(async (userId, reason) => {
    await api.post(`/admin/certificates/${userId}/reject`, { reason })
  }, [])

  const value = {
    user,
    isAuthenticated: !!user && user.role === 'member',
    isAdmin: user?.role === 'admin',
    initializing,
    loading,
    authError,
    login,
    register,
    logout,
    subscribeToPlan,
    cancelSubscription,
    reactivateSubscription,
    updateProfile,
    uploadCertificate,
    logGymAccess,
    approveCertificate,
    rejectCertificate,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
