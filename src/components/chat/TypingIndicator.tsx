'use client'

import { cn } from '@/lib/utils'

interface TypingUser {
  userId: string
  userName: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
  className?: string
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} est en train d'écrire`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} et ${typingUsers[1].userName} sont en train d'écrire`
    } else {
      return `${typingUsers.length} personnes sont en train d'écrire`
    }
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-1 text-sm text-muted-foreground',
      className
    )}>
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
      </div>
      <span>{getText()}</span>
    </div>
  )
}

export default TypingIndicator
