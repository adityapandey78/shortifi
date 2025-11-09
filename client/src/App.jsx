import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import { LandingPage } from '@/pages/LandingPage'
import { HomePage } from '@/pages/Home'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { DashboardPage } from '@/pages/Dashboard'
import { ProfilePage } from '@/pages/Profile'
import { VerifyEmailPage } from '@/pages/VerifyEmail'
import { useStore } from '@/store/useStore'
import { getCurrentUser } from '@/services/auth.service'
import { useEffect } from 'react'

/**
 * Main App Component
 * Sets up routing and global layout
 */

// Protected Route wrapper for authenticated pages
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore()
  return isAuthenticated ? children : <Navigate to="/landing" replace />
}

// Public Route wrapper (redirect to home if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useStore()
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function App() {
  const { theme, setUser, setAuthenticated } = useStore()

  // Apply theme class to document root
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser()
        if (response.success && response.user) {
          setUser(response.user)
          setAuthenticated(true)
        }
      } catch (error) {
        // User not authenticated, that's fine
        console.log('Not authenticated')
      }
    }
    
    checkAuth()
  }, [])

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Routes>
            {/* Root path - shows HomePage if authenticated, otherwise redirects to landing */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
              } />
            
            {/* Landing page for non-authenticated users */}
            <Route 
              path="/landing" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            
            {/* Auth routes - redirect to home if already logged in */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Email verification route */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
