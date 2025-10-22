import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Edit, Trash2, Copy, Check, ExternalLink, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteShortLink, getAllLinks } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, formatDate, extractDomain } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { EditLinkDialog } from '@/components/EditLinkDialog'

/**
 * Dashboard Page Component
 * Displays all user's short links with management options
 */

export function DashboardPage() {
  const [links, setLinks] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">My Links</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your shortened URLs in one place
        </p>
      </motion.div>

      {links.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Link className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">No links yet</h3>
                <p className="text-muted-foreground mt-2">
                  Start creating short links from the home page
                </p>
              </div>
              <Button onClick={() => navigate('/')}>
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-2">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-xs">
                          {window.location.origin}/{link.shortCode}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(link.shortCode)}
                          className="h-7 w-7"
                        >
                          {copiedId === link.shortCode ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate max-w-md"
                        >
                          {link.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(link.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <EditLinkDialog
                        link={link}
                        onSuccess={fetchLinks}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs bg-transparent hover:bg-transparent"
                          >
                            <Edit className="h-3 w-3 mr-1 text-blue-400" />
                            <span className="text-foreground">Edit</span>
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(link.id)}
                        className="h-7 text-xs bg-transparent hover:bg-transparent"
                      >
                        <Trash2 className="h-3 w-3 mr-1 text-red-500" />
                        <span className="text-foreground">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
