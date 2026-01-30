'use client'

import { Check, X, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvailabilityCounts {
  available: number
  maybe: number
  unavailable: number
  total: number
}

interface AvailabilityBadgeProps {
  counts: AvailabilityCounts
  className?: string
}

export function AvailabilityBadge({ counts, className }: AvailabilityBadgeProps) {
  const { available, maybe, unavailable, total } = counts
  const responded = available + maybe + unavailable

  if (total === 0) return null

  return (
    <div className={cn('flex items-center gap-1 text-xs', className)}>
      <span className="inline-flex items-center gap-0.5 text-green-600">
        <Check className="h-3 w-3" />
        {available}
      </span>
      {maybe > 0 && (
        <span className="inline-flex items-center gap-0.5 text-yellow-600">
          <HelpCircle className="h-3 w-3" />
          {maybe}
        </span>
      )}
      {unavailable > 0 && (
        <span className="inline-flex items-center gap-0.5 text-red-600">
          <X className="h-3 w-3" />
          {unavailable}
        </span>
      )}
      <span className="text-muted-foreground">/{total}</span>
    </div>
  )
}
