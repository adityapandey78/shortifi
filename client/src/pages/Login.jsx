import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { login, googleLogin } from '@/services/auth.service'
import { useStore } from '@/store/useStore'

/**
 * Login Page Component
 * Handles user authentication with email/password and Google OAuth
 */

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useStore()

  // Handle email/password login
  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await login(data)
      setUser({ email: data.email })
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    googleLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
      {/* Grid pattern background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(0 0 0 / 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(0 0 0 / 0.1) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      {/* Animated blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Catchy sarcastic text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-6 px-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Oh, You're Back Again?
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We missed you almost as much as you probably missed remembering your password. But hey, at least your links are still short and sweet.
          </p>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-sm">
              ✨ Your shortened links are waiting (they're very patient)
            </p>
            <p className="text-sm">
              ✨ Dashboard analytics that'll make you feel productive
            </p>
            <p className="text-sm">
              ✨ The same bugs features you left behind
            </p>
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-2 shadow-2xl">
            <CardHeader className="space-y-3 text-center pb-6">
              <CardTitle className="text-3xl font-bold">Log in to your account</CardTitle>
              <CardDescription className="text-base">
                Please enter your details to proceed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email/Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="h-11"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    className="h-11"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="terms">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms
                    </Link>
                    ,{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Data Policy
                    </Link>
                    , and{' '}
                    <Link to="/cookies" className="text-primary hover:underline">
                      Cookies Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-semibold">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
