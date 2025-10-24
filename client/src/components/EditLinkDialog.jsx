import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Edit, Link2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateShortLink } from '@/services/shortener.service'

/**
 * Edit Link Dialog Component
 * Modal dialog for editing existing short links
 */

export function EditLinkDialog({ link, onSuccess, trigger }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { toast } = useToast()

  // Reset form when dialog opens
  useEffect(() => {
    if (open && link) {
      reset({
        url: link.url,
        shortCode: link.shortCode,
      })
    }
  }, [open, link, reset])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await updateShortLink(link.id, {
        url: data.url,
        shortCode: data.shortCode,
      })

      toast({
        title: 'Success!',
        description: response.message || 'Short link updated successfully',
      })

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Failed to update link:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update short link',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Short Link</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update the URL or short code for this link
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="edit-url" className="text-sm">Destination URL</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-url"
                type="url"
                placeholder="https://example.com"
                className="pl-10 h-9 sm:h-10 text-sm"
                {...register('url', {
                  required: 'URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: 'Please enter a valid URL',
                  },
                })}
              />
            </div>
            {errors.url && (
              <p className="text-xs sm:text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="edit-shortCode" className="text-sm">Short Code</Label>
            <Input
              id="edit-shortCode"
              type="text"
              placeholder="my-custom-code"
              className="h-9 sm:h-10 text-sm"
              {...register('shortCode', {
                required: 'Short code is required',
                minLength: {
                  value: 3,
                  message: 'Short code must be at least 3 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Short code cannot exceed 50 characters',
                },
                pattern: {
                  value: /^[a-zA-Z0-9-_]+$/,
                  message: 'Only letters, numbers, hyphens, and underscores allowed',
                },
              })}
            />
            {errors.shortCode && (
              <p className="text-xs sm:text-sm text-destructive">{errors.shortCode.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Warning: Changing the short code will break existing links
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} size="sm" className="h-9 text-sm">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
