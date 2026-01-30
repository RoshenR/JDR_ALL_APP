'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/components/chat/ColorPicker'
import { ReplyPreview } from '@/components/chat/ReplyPreview'
import { sendGroupMessage, broadcastGroupTyping } from '@/lib/actions/groups'
import type { GroupMessageRecord, ReplyInfo } from '@/lib/group-types'
import { Send, Dices, X } from 'lucide-react'

interface GroupChatInputProps {
  groupId: string
  currentUserColor: string | null
  replyingTo: ReplyInfo | null
  onCancelReply: () => void
  onMessageSent?: (message: GroupMessageRecord) => void
}

export function GroupChatInput({
  groupId,
  currentUserColor,
  replyingTo,
  onCancelReply,
  onMessageSent
}: GroupChatInputProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Focus when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  // Typing indicator logic
  const sendTypingIndicator = useCallback((typing: boolean) => {
    if (isTypingRef.current !== typing) {
      isTypingRef.current = typing
      broadcastGroupTyping(groupId, typing)
    }
  }, [groupId])

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)

    if (e.target.value.trim()) {
      sendTypingIndicator(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false)
      }, 2000)
    } else {
      sendTypingIndicator(false)
    }
  }

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current) {
        broadcastGroupTyping(groupId, false)
      }
    }
  }, [groupId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPending) return

    const messageContent = content
    setContent('')
    sendTypingIndicator(false)

    startTransition(async () => {
      const result = await sendGroupMessage({
        groupId,
        content: messageContent,
        replyToId: replyingTo?.id
      })

      if (result.success) {
        onMessageSent?.(result.message)
        onCancelReply()
      }

      inputRef.current?.focus()
    })
  }

  const handleQuickDiceRoll = () => {
    if (content.trim()) {
      const trimmed = content.trim()
      if (/^\d*d\d+/.test(trimmed)) {
        setContent(`/roll ${trimmed}`)
      }
    } else {
      setContent('/roll 1d20')
    }
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 shrink-0">
      {/* Reply preview */}
      {replyingTo && (
        <ReplyPreview
          replyTo={replyingTo}
          onCancel={onCancelReply}
          className="mb-2"
        />
      )}

      <div className="flex gap-2">
        <ColorPicker currentColor={currentUserColor} />

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Message... (ou /roll 1d20)"
            disabled={isPending}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleQuickDiceRoll}
            disabled={isPending}
            title="Jet rapide"
          >
            <Dices className="h-4 w-4" />
          </Button>
        </div>

        <Button type="submit" disabled={!content.trim() || isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Commandes: <code className="px-1 bg-muted rounded">/roll 2d6+3</code> ou{' '}
        <code className="px-1 bg-muted rounded">/r 1d20</code> pour lancer des dés
      </p>
    </form>
  )
}

export default GroupChatInput
