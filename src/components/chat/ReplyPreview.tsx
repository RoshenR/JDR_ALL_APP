'use client'

import { X, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReplyPreviewProps {
  replyTo: {
    id: string
    content: string
    senderName: string
  }
  onCancel: () => void
  className?: string
}

export function ReplyPreview({ replyTo, onCancel, className }: ReplyPreviewProps) {
  // Truncate content if too long
  const truncatedContent = replyTo.content.length > 100
    ? replyTo.content.slice(0, 100) + '...'
    : replyTo.content

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border-l-4 border-primary',
      className
    )}>
      <Reply className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">
          Réponse à {replyTo.senderName}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {truncatedContent}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ReplyPreview
