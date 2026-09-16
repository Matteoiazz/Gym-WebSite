import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useUI()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login', location.pathname)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
