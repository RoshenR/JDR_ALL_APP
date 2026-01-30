'use client'

import { useRef, useEffect } from 'react'
import { GroupMessageBubble } from './GroupMessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { GroupMessageRecord, ReactionEmoji } from '@/lib/group-types'
import { ChevronUp } from 'lucide-react'

interface TypingUser {
  userId: string
  userName: string
}

interface GroupMessageListProps {
  messages: GroupMessageRecord[]
  currentUserId: string
  isAdmin?: boolean
  typingUsers?: TypingUser[]
  onLoadMore?: () => void
  onReply?: (message: GroupMessageRecord) => void
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: ReactionEmoji, remove: boolean) => void
  highlightedMessageId?: string
}

export function GroupMessageList({
  messages,
  currentUserId,
  isAdmin,
  typingUsers = [],
  onLoadMore,
  onReply,
  onPin,
  onUnpin,
  onReaction,
  highlightedMessageId
}: GroupMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId) {
      const element = messageRefs.current.get(highlightedMessageId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('animate-pulse', 'bg-primary/10')
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'bg-primary/10')
        }, 2000)
      }
    }
  }, [highlightedMessageId])

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
              <div
                key={message.id}
                ref={(el) => {
                  if (el) {
                    messageRefs.current.set(message.id, el)
                  }
                }}
                className="transition-colors rounded-lg"
              >
                <GroupMessageBubble
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  onReaction={onReaction}
                />
              </div>
            ))
          )}
        </div>

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} className="mt-2" />

        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  )
}

export default GroupMessageList
