import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { resendVerification } from '@/services/auth.service'
import { motion, AnimatePresence } from 'framer-motion'

export function VerifyEmailPrompt({ email, onClose }) {
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendVerification()
      toast({
        title: 'Email sent! 📧',
        description: 'Please check your inbox and spam folder.',
      })
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-yellow-500/50 shadow-2xl">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">📧</span>
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-xl">Verify Your Email</CardTitle>
                    <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm">
                      Please verify your email to access all features
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex-shrink-0"
                  onClick={onClose}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                We sent a verification link to{' '}
                <span className="font-medium text-foreground break-all">{email}</span>
              </p>
              
              <p className="text-xs sm:text-sm text-muted-foreground">
                Check your inbox and spam folder for the verification email.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1 sm:pt-2">
                <Button
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex-1 h-9 sm:h-10 text-sm"
                  variant="default"
                >
                  {isResending ? 'Sending...' : 'Resend Email'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-9 sm:h-10 text-sm"
                >
                  Verify Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
