import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyEmail } from '@/services/auth.service'
import { useStore } from '@/store/useStore'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error, pending
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { user } = useStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    // If no token/email params, show "check your email" message
    if (!token || !email) {
      setStatus('pending')
      setMessage('We sent a verification link to your email')
      return
    }

    // Otherwise, verify the token
    const verify = async () => {
      try {
        const response = await verifyEmail(token, email)
        if (response.success) {
          setStatus('success')
          setMessage(response.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(response.message || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-gray-900">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <div className="flex justify-center mb-3 sm:mb-4">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 animate-spin" />
              )}
              {status === 'pending' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
                </motion.div>
              )}
            </div>
            
            <CardTitle className="text-xl sm:text-2xl">
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'pending' && 'Check Your Email 📧'}
              {status === 'success' && 'Email Verified! 🎉'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            
            <CardDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm">
              {status === 'pending' && user?.email && (
                <>
                  {message}
                  <br />
                  <span className="font-medium">{user.email}</span>
                  <br />
                  <span className="text-xs mt-2 block">Don't forget to check your spam folder!</span>
                </>
              )}
              {status !== 'pending' && message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2 sm:space-y-3">
            {status === 'pending' && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Click the verification link in the email to activate your account.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  Back to Homepage
                </Button>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/')}
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  Go to Homepage
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  Resend Verification
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  Go to Homepage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
