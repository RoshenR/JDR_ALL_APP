'use client'

import { useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { ChatMessageRecord } from '@/lib/actions/chat'
import { ChevronUp } from 'lucide-react'

interface MessageListProps {
  messages: ChatMessageRecord[]
  currentUserId: string
  currentUserRole: string
  onLoadMore?: () => void
}

export function MessageList({
  messages,
  currentUserId,
  currentUserRole,
  onLoadMore
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  const isMJ = currentUserRole === 'MJ'

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4" ref={scrollRef}>
        {onLoadMore && messages.length >= 50 && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="text-xs"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Charger plus
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Aucun message</p>
              <p className="text-sm">Commencez la conversation !</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                showPrivateIndicator={isMJ && !!message.recipientId}
                isMJ={isMJ}
              />
            ))
          )}
        </div>

        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  )
}

export default MessageList
