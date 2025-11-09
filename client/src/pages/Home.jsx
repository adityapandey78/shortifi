import { useState, useEffect, lazy, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Link2, Copy, Check, ExternalLink, Trash2, Edit, QrCode, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createShortLink, getAllLinks, deleteShortLink, getLinkAnalytics } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, truncate } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { EditLinkDialog } from '@/components/EditLinkDialog'
import { QRCodeDialog } from '@/components/QRCodeDialog'
import { LinkAnalytics } from '@/components/LinkAnalytics'
import { AuroraText } from '@/components/ui/aurora-text'
import { Highlighter } from '@/components/ui/highlighter'
import { SparklesText } from '@/components/ui/sparkles-text'
import { CoolMode } from '@/components/ui/cool-mode'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Footer } from '@/components/Footer'

// Lazy load Prism for better performance
const Prism = lazy(() => import('@/components/Prism'))

// Loading fallback
const PrismLoader = () => <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>

/**
 * Home Page Component
 * Main URL shortener interface with link creation and management
 */

export function HomePage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [links, setLinks] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [qrCodeOpen, setQrCodeOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
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
  const handleCopy = async (shortCode, shortUrl) => {
    // Use the shortUrl from backend if available, otherwise construct it
    const url = shortUrl || `${import.meta.env.VITE_API_URL}/${shortCode}`
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

  // Handle show analytics
  const handleShowAnalytics = async (link) => {
    setSelectedLink(link)
    setAnalyticsOpen(true)
    setAnalyticsLoading(true)
    
    try {
      const response = await getLinkAnalytics(link.id)
      if (response.success) {
        setAnalyticsData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Handle show QR code
  const handleShowQRCode = (link) => {
    setSelectedLink(link)
    setQrCodeOpen(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Prism Background - Blurred */}
      <div className="absolute inset-0 z-0 blur-sm opacity-80">
        <Suspense fallback={<PrismLoader />}>
          <Prism 
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        </Suspense>
      </div>

      <div className="flex-1 container px-2 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 relative z-10">
        {/* Hero Section with Form */}
        <div className="max-w-4xl mx-auto space-y-4 xs:space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-2 xs:space-y-3 sm:space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-7xl tracking-normal flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 font-serif">
                
                <span>Shorten your</span>
                <AuroraText className="text-bold">Loooonng</AuroraText>
                <span className="hidden sm:inline text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-6xl">URLs like never before!</span>
                <span className="sm:hidden">URLs!</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs xs:text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 xs:px-4"
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
            <Card className="backdrop-blur-md bg-black/40 border-2 border-white/10 shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                  Create Short Link
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-300">
                  Paste your long URL and get a shortened version instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="url" className="text-sm text-white">Enter your link</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/very/long/url"
                        className="pl-10 h-9 sm:h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-primary/50 focus:bg-white/20"
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
                      <p className="text-xs sm:text-sm text-red-400">{errors.url.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="shortCode" className="text-sm text-white">Custom short code (optional)</Label>
                    <Input
                      id="shortCode"
                      type="text"
                      placeholder="my-custom-code"
                      className="h-9 sm:h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-primary/50 focus:bg-white/20"
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
                      <p className="text-xs sm:text-sm text-red-400">{errors.shortCode.message}</p>
                    )}
                  </div>
                <CoolMode>
                  <Button
                    type="submit"
                    className="w-full gap-2 text-white h-8 text-sm bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Shorten Now'}
                  </Button>
                  </CoolMode>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* User's Recent Links Table */}
          {isAuthenticated && links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="backdrop-blur-md bg-black/40 border-2 border-white/10 shadow-2xl">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-white">Your Recent Links</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-300">
                    Manage and track your shortened URLs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/10">
                        <tr className="text-left">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">Short Link</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">Original URL</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">QR Code</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">Analytics</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {links.slice(0, 5).map((link) => (
                          <motion.tr
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <a
                                href={link.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5"
                              >
                                <span className="truncate max-w-[150px]">{link.shortUrl?.replace('http://', '').replace('https://', '')}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Link2 className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                <span className="text-xs text-gray-300 truncate">{truncate(link.url, 50)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShowQRCode(link)}
                                className="h-8 w-8 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 border border-blue-400/40 hover:border-blue-400/60"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShowAnalytics(link)}
                                className="h-8 w-8 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 border border-purple-400/40 hover:border-purple-400/60"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <EditLinkDialog
                                  link={link}
                                  onSuccess={fetchLinks}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 transition-opacity bg-transparent hover:bg-white/10"
                                    >
                                      <Edit className="h-3.5 w-3.5 text-blue-400" />
                                    </Button>
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(link.shortCode, link.shortUrl)}
                                  className="h-7 w-7 transition-opacity bg-transparent hover:bg-white/10"
                                >
                                  {copiedId === link.shortCode ? (
                                    <Check className="h-3.5 w-3.5 text-green-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 text-gray-300" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(link.id)}
                                  className="h-7 w-7 transition-opacity bg-transparent hover:bg-white/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {links.length > 5 && (
                    <div className="flex justify-center p-4 border-t border-white/10">
                      <Link to="/dashboard">
                        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs sm:text-sm bg-white/5 border-white/20 hover:bg-white/10 text-white">
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
              <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 backdrop-blur-md border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white">Ready to get started?</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create an account to manage your links and track their performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3 justify-center pb-6">
                  <Link to="/register">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      {selectedLink && (
        <QRCodeDialog
          shortUrl={selectedLink.shortUrl || `${import.meta.env.VITE_API_URL}/${selectedLink.shortCode}`}
          open={qrCodeOpen}
          onOpenChange={setQrCodeOpen}
        />
      )}

      {/* Analytics Dialog */}
      {selectedLink && (
        <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Analytics for {selectedLink.shortCode}</DialogTitle>
              <DialogDescription>
                Detailed analytics and statistics for this short link
              </DialogDescription>
            </DialogHeader>
            <LinkAnalytics analytics={analyticsData} loading={analyticsLoading} />
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
