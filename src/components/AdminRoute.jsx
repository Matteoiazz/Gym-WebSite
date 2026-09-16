import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'

export default function AdminRoute({ children }) {
  const { isAdmin, isAuthenticated } = useAuth()
  const { openAuthModal } = useUI()
  const location = useLocation()

  useEffect(() => {
    if (!isAdmin && !isAuthenticated) {
      openAuthModal('login', location.pathname)
    }
  }, [isAdmin, isAuthenticated])

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
