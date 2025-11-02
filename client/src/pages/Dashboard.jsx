import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Edit, Trash2, Copy, Check, ExternalLink, Calendar, QrCode, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteShortLink, getAllLinks, getLinkAnalytics } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, formatDate, extractDomain } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { EditLinkDialog } from '@/components/EditLinkDialog'
import { QRCodeDialog } from '@/components/QRCodeDialog'
import { LinkAnalytics } from '@/components/LinkAnalytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
    <div className="container px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
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
                <Link className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
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
        <div className="grid gap-2 sm:gap-3">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    {/* Short URL row with actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-xs break-all flex-1 min-w-0">
                        {link.shortUrl || `${import.meta.env.VITE_API_URL}/${link.shortCode}`}
                      </code>
                      <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(link.shortCode, link.shortUrl)}
                          className="h-7 text-xs px-2"
                        >
                          {copiedId === link.shortCode ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowQRCode(link)}
                          className="h-7 text-xs px-2"
                        >
                          <QrCode className="h-3.5 w-3.5 mr-1" />
                          QR Code
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowAnalytics(link)}
                          className="h-7 text-xs px-2"
                        >
                          <BarChart3 className="h-3.5 w-3.5 mr-1" />
                          Analytics
                        </Button>
                        <EditLinkDialog
                          link={link}
                          onSuccess={fetchLinks}
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                          className="h-7 text-xs px-2 text-orange-500 hover:text-orange-700"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Original URL */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {link.url}
                      </a>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      {formatDate(link.createdAt)}
                      {link.clickCount !== undefined && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="font-medium text-primary">{link.clickCount} clicks</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      {selectedLink && (
        <QRCodeDialog
          linkId={selectedLink.id}
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
  )
}
