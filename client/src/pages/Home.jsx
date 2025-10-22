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
import { EditLinkDialog } from '@/components/EditLinkDialog'
import { AuroraText } from '@/components/ui/aurora-text'
import { Highlighter } from '@/components/ui/highlighter'
import { SparklesText } from '@/components/ui/sparkles-text'
import { CoolMode } from '@/components/ui/cool-mode'

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
      console.error('Failed to delete link:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete link',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container py-8">
        {/* Hero Section with Form - Single Page Layout */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-x-3">
                <SparklesText className="inline-block">Shorten</SparklesText>
                <span>your</span>
                <AuroraText>Loooonng</AuroraText>
                <span>URLs like never before!</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
                The Shortifi is an{" "}
                <Highlighter action="underline" color="#FF9800" strokeWidth={3} padding={3}>
                  efficient
                </Highlighter>{" "}
                and easy-to-use{" "}
                <Highlighter action="highlight" color="#87CEFA" strokeWidth={3} padding={3} className="!text-white">
                    <span className="text-white"> URL shortening </span>
                </Highlighter>{" "}
                service that streamlines your online experience.
            </motion.p>
          </motion.div>

          {/* URL Shortener Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  Create Short Link
                </CardTitle>
                <CardDescription>
                  Paste your long URL and get a shortened version instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
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
                      placeholder="my-custom-code (leave empty for random)"
                      {...register('shortCode', {
                        minLength: {
                          value: 3,
                          message: 'Short code must be at least 3 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Short code cannot exceed 50 characters'
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9-_]+$/,
                          message: 'Only letters, numbers, hyphens, and underscores allowed'
                        }
                      })}
                    />
                    {errors.shortCode && (
                      <p className="text-sm text-destructive">{errors.shortCode.message}</p>
                    )}
                    {/* <p className="text-xs text-muted-foreground">
                      Leave empty to generate a random short code automatically
                    </p> */}
                  </div>
                <CoolMode>
                  <Button
                    type="submit"
                    className="w-full gap-2 group text-white"
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? 'Creating...' : 'Shorten Now!'}
                  </Button>
                  </CoolMode>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* User's Recent Links - Below the form */}
          {isAuthenticated && links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Recent Links</CardTitle>
                  <CardDescription>
                    Manage your shortened URLs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {links.slice(0, 3).map((link) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            {link.shortUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {truncate(link.url, 60)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <EditLinkDialog
                          link={link}
                          onSuccess={fetchLinks}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent"
                            >
                              <Edit className="h-3 w-3 text-blue-400" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(link.shortCode)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent"
                        >
                          {copiedId === link.shortCode ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(link.id)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {links.length > 3 && (
                    <div className="flex justify-center pt-2">
                      <Link to="/dashboard">
                        <Button variant="outline" size="sm" className="gap-2">
                          View All {links.length} Links
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CTA for non-authenticated users */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Ready to get started?</CardTitle>
                  <CardDescription>
                    Create an account to manage your links and track their performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3 justify-center pb-6">
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
    </div>
  )
}
