'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessageRecord, ReactionEmoji } from '@/lib/chat-types'
import { EmojiReactionPicker } from './EmojiReactionPicker'
import { ReactionDisplay } from './ReactionDisplay'
import { Dices, Lock, AlertCircle, Crown, Pin, Reply, MoreHorizontal, Eye, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageBubbleProps {
  message: ChatMessageRecord
  isOwn: boolean
  showPrivateIndicator?: boolean
  isMJ?: boolean
  currentUserId: string
  onReply?: (message: ChatMessageRecord) => void
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: ReactionEmoji, remove: boolean) => void
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

// Couleur spéciale pour les messages IC
const IC_COLOR = { bg: 'bg-violet-600', text: 'text-white', light: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-400 dark:border-violet-600' }

// Génère une couleur consistante basée sur le senderId ou utilise la couleur choisie
function getUserColor(senderId: string, senderIsMJ: boolean = false, senderColor: string | null = null, isIC: boolean = false) {
  if (isIC) return IC_COLOR
  if (senderIsMJ) return MJ_COLOR

  if (senderColor && USER_COLORS[senderColor]) {
    return USER_COLORS[senderColor]
  }

  let hash = 0
  for (let i = 0; i < senderId.length; i++) {
    hash = ((hash << 5) - hash) + senderId.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % COLOR_LIST.length
  return COLOR_LIST[index]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MessageBubble({
  message,
  isOwn,
  showPrivateIndicator,
  isMJ,
  currentUserId,
  onReply,
  onPin,
  onUnpin,
  onReaction
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMouseLeave = () => {
    if (!menuOpen) {
      setShowActions(false)
    }
  }

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open)
    if (!open) {
      setShowActions(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const senderIsMJ = message.senderRole === 'MJ'
  const isIC = !!message.character
  const userColor = getUserColor(message.senderId, senderIsMJ, message.senderColor, isIC)
  const isPrivate = !!message.recipientId
  const isSecret = message.isSecret

  // Display name - use character name if IC
  const displayName = isIC ? message.character!.name : message.senderName
  const displayAvatar = isIC ? message.character!.imageUrl : null

  // Get user's existing reactions
  const userReactions = message.reactions
    .filter(r => r.userId === currentUserId)
    .map(r => r.emoji)

  const handleReaction = (emoji: ReactionEmoji) => {
    const hasReaction = userReactions.includes(emoji)
    onReaction?.(message.id, emoji, hasReaction)
  }

  // Rendu pour les messages de jet de dés
  if (message.messageType === 'dice_roll') {
    const metadata = message.metadata as {
      formula: string
      results: number[]
      total: number
    }

    return (
      <div
        className={cn('flex gap-2 group', isOwn ? 'justify-end' : 'justify-start')}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={handleMouseLeave}
      >
        {!isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            userColor.bg,
            userColor.text
          )}>
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
            ) : senderIsMJ ? (
              <Crown className="h-4 w-4" />
            ) : isIC ? (
              <UserCircle className="h-4 w-4" />
            ) : (
              getInitials(displayName)
            )}
          </div>
        )}

        <div className="flex flex-col max-w-[75%]">
          <div className={cn(
            'rounded-lg p-3 border',
            userColor.light,
            userColor.border
          )}>
            <div className="flex items-center gap-2 mb-1">
              <Dices className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-sm">{displayName}</span>
              {isIC && <span className="text-xs text-violet-600">(IC)</span>}
              {senderIsMJ && <Crown className="h-3 w-3 text-amber-500" />}
              {isPrivate && <Lock className="h-3 w-3 text-amber-600" />}
              {message.isPinned && <Pin className="h-3 w-3 text-amber-600" />}
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

          <ReactionDisplay
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggleReaction={handleReaction}
          />
        </div>

        {/* Actions */}
        {showActions && (
          <MessageActions
            message={message}
            isMJ={isMJ}
            userReactions={userReactions}
            onReply={onReply}
            onPin={onPin}
            onUnpin={onUnpin}
            onReaction={handleReaction}
            onOpenChange={handleMenuOpenChange}
          />
        )}

        {isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            userColor.bg,
            userColor.text
          )}>
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
            ) : isMJ ? (
              <Crown className="h-4 w-4" />
            ) : isIC ? (
              <UserCircle className="h-4 w-4" />
            ) : (
              getInitials(displayName)
            )}
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

  // Rendu pour les messages secrets
  if (isSecret) {
    return (
      <div
        className={cn('flex gap-2 group', isOwn ? 'justify-end' : 'justify-start')}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={handleMouseLeave}
      >
        {!isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
            'bg-slate-700 text-white'
          )}>
            <Eye className="h-4 w-4" />
          </div>
        )}

        <div className="flex flex-col max-w-[75%]">
          {/* Reply preview if this is a reply */}
          {message.replyTo && (
            <div className="flex items-center gap-1 mb-1 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400 border-l-2 border-slate-600">
              <Reply className="h-3 w-3" />
              <span className="font-medium">{message.replyTo.senderName}:</span>
              <span className="truncate">{message.replyTo.content.slice(0, 50)}</span>
            </div>
          )}

          <div className={cn(
            'rounded-2xl px-4 py-2',
            'bg-slate-800 text-slate-100 border border-slate-700',
            'ring-2 ring-slate-600'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-3 w-3 text-slate-400" />
              <span className="font-semibold text-sm text-slate-300">
                Message secret du MJ
              </span>
              {message.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
            </div>

            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="ml-auto">{formatTime(message.createdAt)}</span>
            </div>
          </div>

          <ReactionDisplay
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggleReaction={handleReaction}
          />
        </div>

        {showActions && (
          <MessageActions
            message={message}
            isMJ={isMJ}
            userReactions={userReactions}
            onReply={onReply}
            onPin={onPin}
            onUnpin={onUnpin}
            onReaction={handleReaction}
            onOpenChange={handleMenuOpenChange}
          />
        )}

        {isOwn && (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
            'bg-slate-700 text-white'
          )}>
            <Eye className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }

  // Rendu pour les messages texte standard
  return (
    <div
      className={cn('flex gap-2 group', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={handleMouseLeave}
    >
      {!isOwn && (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
          userColor.bg,
          userColor.text
        )}>
          {displayAvatar ? (
            <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : senderIsMJ ? (
            <Crown className="h-4 w-4" />
          ) : isIC ? (
            <UserCircle className="h-4 w-4" />
          ) : (
            getInitials(displayName)
          )}
        </div>
      )}

      <div className="flex flex-col max-w-[75%]">
        {/* Reply preview if this is a reply */}
        {message.replyTo && (
          <div className={cn(
            'flex items-center gap-1 mb-1 px-2 py-1 rounded text-xs border-l-2',
            isOwn
              ? 'bg-white/10 text-white/70 border-white/50'
              : 'bg-muted/50 text-muted-foreground border-primary/50'
          )}>
            <Reply className="h-3 w-3" />
            <span className="font-medium">{message.replyTo.senderName}:</span>
            <span className="truncate">{message.replyTo.content.slice(0, 50)}</span>
          </div>
        )}

        <div className={cn(
          'rounded-2xl px-4 py-2',
          isOwn
            ? cn(userColor.bg, userColor.text)
            : cn(userColor.light, 'border', userColor.border),
          isPrivate && 'ring-2 ring-amber-500/50'
        )}>
          {/* En-tête du message (pour les autres utilisateurs) */}
          {!isOwn && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {displayName}
              </span>
              {isIC && <span className="text-xs text-violet-600">(IC)</span>}
              {senderIsMJ && <Crown className="h-3 w-3 text-amber-500" />}
              {message.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
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
            {isOwn && message.isPinned && <Pin className="h-3 w-3 text-amber-300" />}
            {isPrivate && isOwn && (
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                vers {message.recipientName}
              </span>
            )}
            <span className="ml-auto">{formatTime(message.createdAt)}</span>
          </div>
        </div>

        <ReactionDisplay
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggleReaction={handleReaction}
        />
      </div>

      {/* Actions */}
      {showActions && (
        <MessageActions
          message={message}
          isMJ={isMJ}
          userReactions={userReactions}
          onReply={onReply}
          onPin={onPin}
          onUnpin={onUnpin}
          onReaction={handleReaction}
          onOpenChange={handleMenuOpenChange}
        />
      )}

      {isOwn && (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1',
          userColor.bg,
          userColor.text
        )}>
          {displayAvatar ? (
            <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : isMJ ? (
            <Crown className="h-4 w-4" />
          ) : isIC ? (
            <UserCircle className="h-4 w-4" />
          ) : (
            getInitials(displayName)
          )}
        </div>
      )}
    </div>
  )
}

// Message actions component
function MessageActions({
  message,
  isMJ,
  userReactions,
  onReply,
  onPin,
  onUnpin,
  onReaction,
  onOpenChange
}: {
  message: ChatMessageRecord
  isMJ?: boolean
  userReactions: ReactionEmoji[]
  onReply?: (message: ChatMessageRecord) => void
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onReaction?: (emoji: ReactionEmoji) => void
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {onReaction && (
        <EmojiReactionPicker
          onSelect={onReaction}
          existingReactions={userReactions}
        />
      )}

      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onReply && (
            <DropdownMenuItem onClick={() => onReply(message)}>
              <Reply className="h-4 w-4 mr-2" />
              Répondre
            </DropdownMenuItem>
          )}
          {isMJ && (
            message.isPinned ? (
              onUnpin && (
                <DropdownMenuItem onClick={() => onUnpin(message.id)}>
                  <Pin className="h-4 w-4 mr-2" />
                  Désépingler
                </DropdownMenuItem>
              )
            ) : (
              onPin && (
                <DropdownMenuItem onClick={() => onPin(message.id)}>
                  <Pin className="h-4 w-4 mr-2" />
                  Épingler
                </DropdownMenuItem>
              )
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default MessageBubble
