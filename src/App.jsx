import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AuthModal from './components/AuthModal.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Checkout from './pages/Checkout.jsx'
import Admin from './pages/Admin.jsx'
import { useUI } from './context/UIContext.jsx'
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  const { authModal, closeAuthModal } = useUI()
  const { initializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const handleAuthSuccess = ({ isAdmin } = {}) => {
    const target = authModal.redirectTo
    closeAuthModal()
    if (isAdmin) navigate('/admin')
    else if (target) navigate(target)
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-onyx-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-onyx-700 border-t-accent-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-onyx-950 text-onyx-50 selection:bg-accent-500 selection:text-onyx-950">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
