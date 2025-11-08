import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Edit, Trash2, Copy, Check, ExternalLink, Calendar, QrCode, BarChart3, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteShortLink, getAllLinks, getLinkAnalytics } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, formatDate, truncate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { EditLinkDialog } from '@/components/EditLinkDialog'
import { QRCodeDialog } from '@/components/QRCodeDialog'
import { LinkAnalytics } from '@/components/LinkAnalytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Footer } from '@/components/Footer'

/**
 * Dashboard Page Component
 * Displays all user's short links with management options
 */

export function DashboardPage() {
  const [links, setLinks] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrCodeOpen, setQrCodeOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchLinks()
  }, [isAuthenticated, navigate])

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
      const response = await getAllLinks()
      if (response.success && response.links) {
        setLinks(response.links)
      } else {
        setLinks([])
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to load links',
        variant: 'destructive',
      })
      setLinks([])
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleDelete = async (id) => {
    try {
      await deleteShortLink(id)
      toast({
        title: 'Deleted',
        description: 'Short link has been deleted',
      })
      fetchLinks() // Refetch the updated list
    } catch (error) {
      console.error('Failed to delete link:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete link',
        variant: 'destructive',
      })
    }
  }

  const handleShowQRCode = (link) => {
    setSelectedLink(link)
    setQrCodeOpen(true)
  }

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
        description: 'Failed to load analytics',
        variant: 'destructive',
      })
    } finally {
      setAnalyticsLoading(false)
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
      <div className="flex-1 container px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">My Links</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage all your shortened URLs in one place
          </p>
        </motion.div>

        {links.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-8 sm:py-12">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <LinkIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold">No links yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                    Start creating short links from the home page
                  </p>
                </div>
                <Button onClick={() => navigate('/')} size="default" className="h-9 sm:h-10 text-sm sm:text-base">
                  Create Your First Link
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">All Your Links</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {links.length} {links.length === 1 ? 'link' : 'links'} created
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Link</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Original URL</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center hidden lg:table-cell">Date</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">QR Code</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Analytics</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {links.map((link, index) => (
                        <motion.tr
                          key={link.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <a
                                href={link.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5"
                              >
                                <span className="truncate max-w-[150px]">{link.shortUrl?.replace('http://', '').replace('https://', '')}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                              {link.clickCount !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {link.clickCount} {link.clickCount === 1 ? 'click' : 'clicks'}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Link2 className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                              <span className="text-xs text-foreground truncate">{truncate(link.url, 50)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{formatDate(link.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShowQRCode(link)}
                              className="h-8 w-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-400/40 hover:border-blue-400/60"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShowAnalytics(link)}
                              className="h-8 w-8 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 border border-purple-400/40 hover:border-purple-400/60"
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
                                    className="h-7 w-7 transition-opacity bg-transparent hover:bg-muted"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(link.shortCode, link.shortUrl)}
                                className="h-7 w-7 transition-opacity bg-transparent hover:bg-muted"
                              >
                                {copiedId === link.shortCode ? (
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(link.id)}
                                className="h-7 w-7 transition-opacity bg-transparent hover:bg-muted"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
