'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, HelpCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AvailabilityStatus } from '@/lib/actions/availability'

interface PlayerAvailability {
  id: string
  name: string
  status: AvailabilityStatus | string
}

interface AvailabilitySummaryProps {
  players: PlayerAvailability[]
  className?: string
}

const statusConfig = {
  AVAILABLE: {
    label: 'Disponible',
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30'
  },
  MAYBE: {
    label: 'Peut-etre',
    icon: HelpCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  UNAVAILABLE: {
    label: 'Indisponible',
    icon: X,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30'
  },
  NO_RESPONSE: {
    label: 'En attente',
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-muted'
  }
}

export function AvailabilitySummary({ players, className }: AvailabilitySummaryProps) {
  const available = players.filter(p => p.status === 'AVAILABLE')
  const maybe = players.filter(p => p.status === 'MAYBE')
  const unavailable = players.filter(p => p.status === 'UNAVAILABLE')
  const noResponse = players.filter(p => p.status === 'NO_RESPONSE')

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Disponibilites ({available.length}/{players.length} confirmes)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <Check className="h-3 w-3" /> {available.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            <HelpCircle className="h-3 w-3" /> {maybe.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <X className="h-3 w-3" /> {unavailable.length}
          </span>
          {noResponse.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Clock className="h-3 w-3" /> {noResponse.length}
            </span>
          )}
        </div>

        {/* Player list */}
        <div className="space-y-1">
          {players.map((player) => {
            const config = statusConfig[player.status as keyof typeof statusConfig] || statusConfig.NO_RESPONSE
            const Icon = config.icon
            return (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                  config.bg
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
                <span className="flex-1">{player.name}</span>
                <span className={cn('text-xs', config.color)}>{config.label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
