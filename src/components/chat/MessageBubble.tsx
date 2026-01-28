'use client'

import { cn } from '@/lib/utils'
import type { ChatMessageRecord } from '@/lib/actions/chat'
import { Dices, Lock, AlertCircle, Crown } from 'lucide-react'

interface MessageBubbleProps {
  message: ChatMessageRecord
  isOwn: boolean
  showPrivateIndicator?: boolean
  isMJ?: boolean
}

// Palette de couleurs pour les différents utilisateurs
const USER_COLORS: Record<string, { bg: string; text: string; light: string; border: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  emerald: { bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700' },
  violet: { bg: 'bg-violet-500', text: 'text-white', light: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-300 dark:border-violet-700' },
  rose: { bg: 'bg-rose-500', text: 'text-white', light: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-300 dark:border-rose-700' },
  cyan: { bg: 'bg-cyan-500', text: 'text-white', light: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-300 dark:border-cyan-700' },
  orange: { bg: 'bg-orange-500', text: 'text-white', light: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700' },
  pink: { bg: 'bg-pink-500', text: 'text-white', light: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700' },
  teal: { bg: 'bg-teal-500', text: 'text-white', light: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700' },
}

const COLOR_LIST = Object.values(USER_COLORS)

// Couleur spéciale pour le MJ
const MJ_COLOR = { bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' }

// Génère une couleur consistante basée sur le senderId ou utilise la couleur choisie
function getUserColor(senderId: string, senderIsMJ: boolean = false, senderColor: string | null = null) {
  if (senderIsMJ) return MJ_COLOR

  // Si l'utilisateur a choisi une couleur, l'utiliser
  if (senderColor && USER_COLORS[senderColor]) {
    return USER_COLORS[senderColor]
  }

  // Sinon, hash simple du senderId pour obtenir un index de couleur consistant
  let hash = 0
  for (let i = 0; i < senderId.length; i++) {
    hash = ((hash << 5) - hash) + senderId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  const index = Math.abs(hash) % COLOR_LIST.length
  return COLOR_LIST[index]
}

// Obtient les initiales du nom
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MessageBubble({ message, isOwn, showPrivateIndicator, isMJ }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Déterminer si l'expéditeur est MJ
  const senderIsMJ = (message as { senderRole?: string }).senderRole === 'MJ'

  const userColor = getUserColor(message.senderId, senderIsMJ, message.senderColor)
  const isPrivate = !!message.recipientId

  // Rendu pour les messages de jet de dés
  if (message.messageType === 'dice_roll') {
    const metadata = message.metadata as {
      formula: string
      results: number[]
      total: number
    }

    return (
      <div className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}>
        {/* Avatar pour les autres utilisateurs */}
        {!isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            userColor.bg,
            userColor.text
          )}>
            {senderIsMJ ? <Crown className="h-4 w-4" /> : getInitials(message.senderName)}
          </div>
        )}

        <div className={cn(
          'max-w-[75%] rounded-lg p-3 border',
          userColor.light,
          userColor.border
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Dices className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-sm">{message.senderName}</span>
            {senderIsMJ && <Crown className="h-3 w-3 text-amber-500" />}
            {isPrivate && <Lock className="h-3 w-3 text-amber-600" />}
          </div>
          <div className="font-mono text-sm">
            <span className="text-muted-foreground">{metadata.formula}: </span>
            <span className="font-medium">[{metadata.results.join(', ')}]</span>
            <span className="text-muted-foreground"> = </span>
            <span className="font-bold text-lg text-primary">{metadata.total}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatTime(message.createdAt)}
          </div>
        </div>

        {/* Avatar pour ses propres messages */}
        {isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            userColor.bg,
            userColor.text
          )}>
            {isMJ ? <Crown className="h-4 w-4" /> : getInitials(message.senderName)}
          </div>
        )}
      </div>
    )
  }

  // Rendu pour les messages système
  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs">
          <AlertCircle className="h-3 w-3" />
          {message.content}
        </div>
      </div>
    )
  }

  // Rendu pour les messages texte
  return (
    <div className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar pour les autres utilisateurs */}
      {!isOwn && (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
          userColor.bg,
          userColor.text
        )}>
          {senderIsMJ ? <Crown className="h-4 w-4" /> : getInitials(message.senderName)}
        </div>
      )}

      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-2',
        isOwn
          ? cn(userColor.bg, userColor.text)
          : cn(userColor.light, 'border', userColor.border),
        isPrivate && 'ring-2 ring-amber-500/50'
      )}>
        {/* En-tête du message (pour les autres utilisateurs) */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {message.senderName}
            </span>
            {senderIsMJ && <Crown className="h-3 w-3 text-amber-500" />}
            {isPrivate && showPrivateIndicator && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Lock className="h-3 w-3" />
                vers {message.recipientName}
              </span>
            )}
          </div>
        )}

        {/* Contenu */}
        <p className={cn(
          'text-sm whitespace-pre-wrap break-words',
          isOwn ? userColor.text : 'text-foreground'
        )}>
          {message.content}
        </p>

        {/* Pied du message */}
        <div className={cn(
          'flex items-center gap-2 mt-1 text-xs',
          isOwn ? 'text-white/70' : 'text-muted-foreground'
        )}>
          {isPrivate && isOwn && (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              vers {message.recipientName}
            </span>
          )}
          <span className="ml-auto">{formatTime(message.createdAt)}</span>
        </div>
      </div>

      {/* Avatar pour ses propres messages */}
      {isOwn && (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
          userColor.bg,
          userColor.text
        )}>
          {isMJ ? <Crown className="h-4 w-4" /> : getInitials(message.senderName)}
        </div>
      )}
    </div>
  )
}

export default MessageBubble
