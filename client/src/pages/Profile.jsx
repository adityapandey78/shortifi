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
        title: 'Email sent',
        description: 'Verification email has been sent to your inbox',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
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
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile?.name}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Verification Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {profile?.isEmailValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.isEmailValid
                      ? 'Your email is verified'
                      : 'Your email is not verified'}
                  </p>
                </div>
              </div>
              {!profile?.isEmailValid && (
                <Button onClick={handleResendVerification} size="sm">
                  Resend Email
                </Button>
              )}
            </div>

            {/* Account Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="font-medium">{profile?.email}</p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p className="font-medium">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Account Type</span>
                </div>
                <p className="font-medium">Free</p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Total Links</span>
                </div>
                <p className="font-medium">{profile?.linksCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and links</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/dashboard')}>
              View My Links
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Create New Link
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
