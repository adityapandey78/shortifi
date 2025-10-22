import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Edit, Trash2, Copy, Check, ExternalLink, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteShortLink } from '@/services/shortener.service'
import { useStore } from '@/store/useStore'
import { copyToClipboard, formatDate, extractDomain } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

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
    // In a real implementation, fetch links from API
    // For now, showing placeholder data
    setTimeout(() => {
      setLinks([
        // Placeholder data - replace with actual API call
      ])
      setIsLoading(false)
    }, 500)
  }, [isAuthenticated, navigate])

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
      setLinks(links.filter(link => link.id !== id))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete link',
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
        <div className="grid gap-4">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-primary/10 text-primary rounded-md font-mono text-sm">
                          {window.location.origin}/{link.shortCode}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(link.shortCode)}
                        >
                          {copiedId === link.shortCode ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                        Created {formatDate(link.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/edit/${link.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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
