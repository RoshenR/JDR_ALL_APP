'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Pin, ChevronDown, ChevronUp, X } from 'lucide-react'
import { type ChatMessageRecord } from '@/lib/actions/chat'
import { cn } from '@/lib/utils'

interface PinnedMessagesBarProps {
  messages: ChatMessageRecord[]
  onUnpin?: (messageId: string) => void
  onJumpToMessage?: (messageId: string) => void
  isMJ?: boolean
  className?: string
}

export function PinnedMessagesBar({
  messages,
  onUnpin,
  onJumpToMessage,
  isMJ,
  className
}: PinnedMessagesBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (messages.length === 0) return null

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        'border-b bg-amber-50/50 dark:bg-amber-950/20',
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-2 h-auto rounded-none hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
        >
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">
              {messages.length} message{messages.length > 1 ? 's' : ''} épinglé{messages.length > 1 ? 's' : ''}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="max-h-48 overflow-y-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className="flex items-start gap-2 px-4 py-2 border-t border-amber-200/50 dark:border-amber-800/50 hover:bg-amber-100/30 dark:hover:bg-amber-900/20"
            >
              <Pin className="h-3 w-3 text-amber-600 mt-1 shrink-0" />
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onJumpToMessage?.(message.id)}
              >
                <p className="text-xs text-muted-foreground">
                  {message.senderName} • {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm truncate">
                  {message.content}
                </p>
              </div>
              {isMJ && onUnpin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onUnpin(message.id)}
                  title="Désépingler"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default PinnedMessagesBar
