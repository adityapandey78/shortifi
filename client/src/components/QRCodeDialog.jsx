import { useRef } from 'react'
import { QRCodeSVG } from 'react-qr-code'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

/**
 * QR Code Dialog Component
 * Displays and allows download of QR code for a short link
 */

export function QRCodeDialog({ linkId, shortUrl, open, onOpenChange }) {
  const qrCodeRef = useRef(null)
  const { toast } = useToast()

  const handleDownload = () => {
    try {
      // Get the SVG element
      const svg = qrCodeRef.current?.querySelector('svg')
      if (!svg) {
        throw new Error('QR code not found')
      }

      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        // Download the canvas as PNG
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `qrcode-${shortUrl.split('/').pop()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          toast({
            title: 'Downloaded',
            description: 'QR code saved successfully',
          })
        })
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    } catch (error) {
      console.error('Failed to download QR code:', error)
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      })
    }
  }

  if (!shortUrl) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to access your short link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div ref={qrCodeRef} className="flex items-center justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              value={shortUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Short URL Display */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <code className="text-sm flex-1 truncate">{shortUrl}</code>
          </div>

          {/* Download Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
