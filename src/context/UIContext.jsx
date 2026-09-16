import React, { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', redirectTo: null })

  const openAuthModal = useCallback((mode = 'login', redirectTo = null) => {
    setAuthModal({ isOpen: true, mode, redirectTo })
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const value = { authModal, openAuthModal, closeAuthModal }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
