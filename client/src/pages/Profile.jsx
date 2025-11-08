import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, resendVerification } from '@/services/auth.service'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Footer } from '@/components/Footer'

/**
 * Profile Page Component
 * Displays user information and account details
 */

export function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user } = useStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [isAuthenticated, navigate])

  const fetchProfile = async () => {
    try {
      const response = await getCurrentUser()
      if (response.success && response.user) {
        setProfile({
          name: response.user.name,
          email: response.user.email,
          isEmailValid: response.user.isEmailValid || false,
          createdAt: response.user.createdAt,
          linksCount: 0, // Will be populated when we add link count API
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Fallback to store data if API fails
      setProfile({
        name: user?.name || 'User',
        email: user?.email || '',
        isEmailValid: user?.isEmailValid || false,
        createdAt: new Date().toISOString(),
        linksCount: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      await resendVerification()
      toast({
        title: 'Verification email sent! 📧',
        description: 'Please check your inbox and spam folder for the verification email.',
      })
    } catch (error) {
      console.error('Failed to resend verification:', error)
      toast({
        title: 'Failed to send',
        description: error.response?.data?.message || error.message || 'Failed to send verification email',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">{profile?.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Email Verification Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center gap-2 sm:gap-3">
                {profile?.isEmailValid ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm sm:text-base font-medium">Email Verification</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {profile?.isEmailValid
                      ? 'Your email is verified'
                      : 'Your email is not verified'}
                  </p>
                </div>
              </div>
              {!profile?.isEmailValid && (
                <Button onClick={handleResendVerification} size="sm" className="w-full sm:w-auto h-8 text-xs sm:text-sm">
                  Resend Email
                </Button>
              )}
            </div>

            {/* Account Info */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Email</span>
                </div>
                <p className="text-sm sm:text-base font-medium truncate">{profile?.email}</p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Member Since</span>
                </div>
                <p className="text-sm sm:text-base font-medium">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Account Type</span>
                </div>
                <p className="text-sm sm:text-base font-medium">Free</p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Total Links</span>
                </div>
                <p className="text-sm sm:text-base font-medium">{profile?.linksCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your account and links</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
            <Button onClick={() => navigate('/dashboard')} size="default" className="w-full sm:w-auto h-9 sm:h-10 text-sm">
              View My Links
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Create New Link
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
