import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import { HomePage } from '@/pages/Home'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { DashboardPage } from '@/pages/Dashboard'
import { ProfilePage } from '@/pages/Profile'
import { useStore } from '@/store/useStore'
import { getCurrentUser } from '@/services/auth.service'
import { useEffect } from 'react'

/**
 * Main App Component
 * Sets up routing and global layout
 */

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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
