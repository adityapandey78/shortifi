import { useRef } from 'react'
import { QRCodeSVG } from 'react-qr-code'
import { Download, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useToast } from '@/hooks/use-toast'

export function QRCodeDialog({ shortUrl, open, onOpenChange }) {
  const qrRef = useRef(null)
  const { toast } = useToast()

  const downloadQR = async () => {
    try {
      const svg = qrRef.current?.querySelector('svg')
      if (!svg) {
        toast({
          title: 'Error',
          description: 'QR code not found',
          variant: 'destructive',
        })
        return
      }

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const svgString = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = `qr-${shortUrl.split('/').pop()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(downloadUrl)
            
            toast({
              title: 'Success',
              description: 'QR code downloaded',
            })
          }
        })
        URL.revokeObjectURL(url)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        toast({
          title: 'Error',
          description: 'Failed to process QR code',
          variant: 'destructive',
        })
      }

      img.src = url
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      })
    }
  }

  if (!shortUrl) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              QR Code
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Scan this QR code to access your short link
            </Dialog.Description>
          </div>

          <div className="space-y-4">
            <div 
              ref={qrRef}
              className="flex items-center justify-center p-6 bg-white rounded-lg border"
            >
              <QRCodeSVG
                value={shortUrl}
                size={256}
                level="H"
                includeMargin
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <code className="text-sm flex-1 truncate">{shortUrl}</code>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Close
              </button>
              <button
                type="button"
                onClick={downloadQR}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
