'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrivateMessageSelect } from './PrivateMessageSelect'
import { ColorPicker } from './ColorPicker'
import { sendMessage, type ChatMessageRecord } from '@/lib/actions/chat'
import { Send, Dices, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  campaignId: string
  participants: Array<{ id: string; name: string; role: string }>
  currentUserId: string
  currentUserColor: string | null
  onMessageSent?: (message: ChatMessageRecord) => void
}

export function ChatInput({
  campaignId,
  participants,
  currentUserId,
  currentUserColor,
  onMessageSent
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus sur l'input au montage
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const selectedRecipient = participants.find(p => p.id === recipientId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPending) return

    const messageContent = content
    setContent('')

    startTransition(async () => {
      const result = await sendMessage({
        campaignId,
        content: messageContent,
        recipientId: recipientId || undefined
      })

      if (result.success) {
        onMessageSent?.(result.message)
      }

      inputRef.current?.focus()
    })
  }

  const handleQuickDiceRoll = () => {
    if (content.trim()) {
      // Si le contenu ressemble à une formule de dés, la préfixer avec /roll
      const trimmed = content.trim()
      if (/^\d*d\d+/.test(trimmed)) {
        setContent(`/roll ${trimmed}`)
      }
    } else {
      setContent('/roll 1d20')
    }
    inputRef.current?.focus()
  }

  const clearRecipient = () => {
    setRecipientId(null)
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 shrink-0">
      {/* Indicateur de message privé */}
      {selectedRecipient && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-amber-500/10 rounded text-sm">
          <span className="text-amber-600">Message privé vers :</span>
          <span className="font-medium">{selectedRecipient.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-auto"
            onClick={clearRecipient}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        {/* Couleur du chat */}
        <ColorPicker currentColor={currentUserColor} />

        {/* Sélection destinataire */}
        <PrivateMessageSelect
          participants={participants}
          selectedId={recipientId}
          onSelect={setRecipientId}
        />

        {/* Input de message */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              recipientId
                ? 'Message privé... (ou /roll 1d20)'
                : 'Message... (ou /roll 1d20)'
            }
            disabled={isPending}
            className={cn(
              'pr-10',
              recipientId && 'border-amber-500/50'
            )}
          />
          {/* Bouton roll rapide */}
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

        {/* Bouton envoyer */}
        <Button type="submit" disabled={!content.trim() || isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Aide commandes */}
      <p className="text-xs text-muted-foreground mt-2">
        Commandes: <code className="px-1 bg-muted rounded">/roll 2d6+3</code> ou{' '}
        <code className="px-1 bg-muted rounded">/r 1d20</code> pour lancer des dés
      </p>
    </form>
  )
}

export default ChatInput
