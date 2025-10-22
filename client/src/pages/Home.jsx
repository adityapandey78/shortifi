import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Link2, Copy, Check, Sparkles, ExternalLink, Trash2, Edit, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createShortLink, getAllLinks, deleteShortLink } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, extractDomain, truncate } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Home Page Component
 * Main URL shortener interface with link creation and management
 */

export function HomePage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [links, setLinks] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const { toast } = useToast()
  const { isAuthenticated } = useStore()
  const navigate = useNavigate()

  // Fetch user's links on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks()
    }
  }, [isAuthenticated])

  const fetchLinks = async () => {
    try {
      const response = await getAllLinks()
      if (response.success && response.links) {
        setLinks(response.links)
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
      setLinks([])
    }
  }

  // Handle URL shortening
  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please login to create short links',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      await createShortLink(data)
      toast({
        title: 'Success!',
        description: 'Your short link has been created',
      })
      reset()
      fetchLinks()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create short link',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle copy to clipboard
  const handleCopy = async (shortCode) => {
    const url = `${window.location.origin}/${shortCode}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedId(shortCode)
      toast({
        title: 'Copied!',
        description: 'Short link copied to clipboard',
      })
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Handle delete link
  const handleDelete = async (id) => {
    try {
      await deleteShortLink(id)
      toast({
        title: 'Deleted',
        description: 'Short link has been deleted',
      })
      fetchLinks()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete link',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container py-12 space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Shorten Your{' '}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Loooooooong URLs
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground"
          >
            Shortifi is an efficient and easy-to-use URL shortening service that streamlines your online experience
          </motion.p>
        </motion.div>

        {/* URL Shortener Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="backdrop-blur-sm bg-card/80 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Create Short Link
              </CardTitle>
              <CardDescription>
                Paste your long URL and get a shortened version instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Enter your link</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      className="pl-10"
                      {...register('url', { 
                        required: 'URL is required',
                        pattern: {
                          value: /^https?:\/\/.+/i,
                          message: 'Please enter a valid URL'
                        }
                      })}
                    />
                  </div>
                  {errors.url && (
                    <p className="text-sm text-destructive">{errors.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortCode">Custom short code (optional)</Label>
                  <Input
                    id="shortCode"
                    type="text"
                    placeholder="my-custom-code"
                    {...register('shortCode', {
                      pattern: {
                        value: /^[a-zA-Z0-9-_]+$/,
                        message: 'Only letters, numbers, hyphens, and underscores allowed'
                      }
                    })}
                  />
                  {errors.shortCode && (
                    <p className="text-sm text-destructive">{errors.shortCode.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 group"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Creating...' : 'Shorten Now!'}
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Cards */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Create short links in milliseconds with our optimized infrastructure',
              },
              {
                icon: Link2,
                title: 'Custom Links',
                description: 'Personalize your short URLs with custom codes for better branding',
              },
              {
                icon: Sparkles,
                title: 'Easy to Use',
                description: 'Clean, modern interface that makes URL shortening a breeze',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* User's Recent Links */}
        {isAuthenticated && links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Links</CardTitle>
                <CardDescription>
                  Manage your shortened URLs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {links.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-mono font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          {link.shortUrl}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                        <Link2 className="h-3 w-3" />
                        {truncate(link.url, 60)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(link.shortCode)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === link.shortCode ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                
                <div className="flex justify-center pt-4">
                  <Link to="/dashboard">
                    <Button variant="outline" className="gap-2">
                      View All Links
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to get started?</CardTitle>
                <CardDescription className="text-base">
                  Create an account to manage your links and track their performance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
