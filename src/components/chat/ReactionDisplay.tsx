'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { REACTION_EMOJIS, type ReactionEmoji, type ReactionRecord } from '@/lib/actions/chat'
import { cn } from '@/lib/utils'

interface ReactionDisplayProps {
  reactions: ReactionRecord[]
  currentUserId: string
  onToggleReaction: (emoji: ReactionEmoji) => void
  className?: string
}

// Group reactions by emoji
function groupReactions(reactions: ReactionRecord[]) {
  const grouped = new Map<ReactionEmoji, ReactionRecord[]>()

  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji) || []
    existing.push(reaction)
    grouped.set(reaction.emoji, existing)
  }

  return grouped
}

export function ReactionDisplay({
  reactions,
  currentUserId,
  onToggleReaction,
  className
}: ReactionDisplayProps) {
  if (reactions.length === 0) return null

  const grouped = groupReactions(reactions)

  return (
    <div className={cn('flex flex-wrap gap-1 mt-1', className)}>
      <TooltipProvider>
        {Array.from(grouped.entries()).map(([emoji, emojiReactions]) => {
          const userReacted = emojiReactions.some(r => r.userId === currentUserId)
          const names = emojiReactions.map(r => r.userName).join(', ')

          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 px-2 py-0 text-xs gap-1',
                    userReacted && 'bg-primary/10 ring-1 ring-primary'
                  )}
                  onClick={() => onToggleReaction(emoji)}
                >
                  <span>{REACTION_EMOJIS[emoji]}</span>
                  <span>{emojiReactions.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{names}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </div>
  )
}

export default ReactionDisplay
