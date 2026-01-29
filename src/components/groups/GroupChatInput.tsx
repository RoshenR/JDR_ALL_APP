'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/components/chat/ColorPicker'
import { sendGroupMessage, type GroupMessageRecord } from '@/lib/actions/groups'
import { Send, Dices } from 'lucide-react'

interface GroupChatInputProps {
  groupId: string
  currentUserColor: string | null
  onMessageSent?: (message: GroupMessageRecord) => void
}

export function GroupChatInput({
  groupId,
  currentUserColor,
  onMessageSent
}: GroupChatInputProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPending) return

    const messageContent = content
    setContent('')

    startTransition(async () => {
      const result = await sendGroupMessage({
        groupId,
        content: messageContent
      })

      if (result.success) {
        onMessageSent?.(result.message)
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
      <div className="flex gap-2">
        <ColorPicker currentColor={currentUserColor} />

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
