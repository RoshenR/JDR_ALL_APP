'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SmilePlus } from 'lucide-react'
import { REACTION_EMOJIS, type ReactionEmoji } from '@/lib/chat-types'
import { cn } from '@/lib/utils'

interface EmojiReactionPickerProps {
  onSelect: (emoji: ReactionEmoji) => void
  existingReactions?: ReactionEmoji[]
  disabled?: boolean
  className?: string
}

export function EmojiReactionPicker({
  onSelect,
  existingReactions = [],
  disabled,
  className
}: EmojiReactionPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: ReactionEmoji) => {
    onSelect(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7', className)}
          disabled={disabled}
        >
          <SmilePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {(Object.keys(REACTION_EMOJIS) as ReactionEmoji[]).map((key) => {
            const isSelected = existingReactions.includes(key)
            return (
              <Button
                key={key}
                variant={isSelected ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  'h-8 w-8 text-lg',
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => handleSelect(key)}
              >
                {REACTION_EMOJIS[key]}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default EmojiReactionPicker
