'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrivateMessageSelect } from './PrivateMessageSelect'
import { ColorPicker } from './ColorPicker'
import { ReplyPreview } from './ReplyPreview'
import { CharacterSelect } from './CharacterSelect'
import { sendMessage, broadcastTyping, type ChatMessageRecord, type ReplyInfo, type CharacterInfo } from '@/lib/actions/chat'
import { Send, Dices, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'

interface ChatInputProps {
  campaignId: string
  participants: Array<{ id: string; name: string; role: string }>
  currentUserId: string
  currentUserRole: string
  currentUserColor: string | null
  replyingTo: ReplyInfo | null
  onCancelReply: () => void
  onMessageSent?: (message: ChatMessageRecord) => void
}

export function ChatInput({
  campaignId,
  participants,
  currentUserId,
  currentUserRole,
  currentUserColor,
  replyingTo,
  onCancelReply,
  onMessageSent
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterInfo | null>(null)
  const [isSecret, setIsSecret] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  const isMJ = currentUserRole === 'MJ'

  // Focus sur l'input au montage
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Focus when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  const selectedRecipient = participants.find(p => p.id === recipientId)

  // Typing indicator logic
  const sendTypingIndicator = useCallback((typing: boolean) => {
    if (isTypingRef.current !== typing) {
      isTypingRef.current = typing
      broadcastTyping(campaignId, typing)
    }
  }, [campaignId])

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)

    // Send typing indicator
    if (e.target.value.trim()) {
      sendTypingIndicator(true)

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to stop typing indicator
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
        broadcastTyping(campaignId, false)
      }
    }
  }, [campaignId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPending) return

    const messageContent = content
    setContent('')
    sendTypingIndicator(false)

    startTransition(async () => {
      const result = await sendMessage({
        campaignId,
        content: messageContent,
        recipientId: recipientId || undefined,
        replyToId: replyingTo?.id,
        characterId: selectedCharacter?.id,
        isSecret: isSecret && isMJ
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

  const clearRecipient = () => {
    setRecipientId(null)
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

      {/* Character IC indicator */}
      {selectedCharacter && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-violet-500/10 rounded text-sm">
          <span className="text-violet-600">Parlant en tant que :</span>
          <span className="font-medium">{selectedCharacter.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-auto"
            onClick={() => setSelectedCharacter(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Secret message indicator */}
      {isSecret && isMJ && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-slate-700/20 rounded text-sm">
          <Eye className="h-4 w-4 text-slate-600" />
          <span className="text-slate-600">Message secret (MJ uniquement)</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-auto"
            onClick={() => setIsSecret(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        {/* Couleur du chat */}
        <ColorPicker currentColor={currentUserColor} />

        {/* Character select (IC mode) */}
        <CharacterSelect
          campaignId={campaignId}
          selectedCharacter={selectedCharacter}
          onSelect={setSelectedCharacter}
        />

        {/* Secret toggle (MJ only) */}
        {isMJ && (
          <Toggle
            pressed={isSecret}
            onPressedChange={setIsSecret}
            size="sm"
            className={cn(
              'shrink-0',
              isSecret && 'bg-slate-700 text-white data-[state=on]:bg-slate-700'
            )}
            title="Message secret"
          >
            <Eye className="h-4 w-4" />
          </Toggle>
        )}

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
            onChange={handleContentChange}
            placeholder={
              isSecret
                ? 'Message secret...'
                : recipientId
                  ? 'Message privé... (ou /roll 1d20)'
                  : 'Message... (ou /roll 1d20)'
            }
            disabled={isPending}
            className={cn(
              'pr-10',
              recipientId && 'border-amber-500/50',
              isSecret && 'border-slate-500/50 bg-slate-50 dark:bg-slate-900/50'
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
