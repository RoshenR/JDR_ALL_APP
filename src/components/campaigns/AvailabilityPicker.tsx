'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, HelpCircle } from 'lucide-react'
import { updateAvailability, type AvailabilityStatus } from '@/lib/actions/availability'
import { cn } from '@/lib/utils'

interface AvailabilityPickerProps {
  sessionId: string
  currentStatus?: AvailabilityStatus | null
  onUpdate?: (status: AvailabilityStatus) => void
}

export function AvailabilityPicker({ sessionId, currentStatus, onUpdate }: AvailabilityPickerProps) {
  const [status, setStatus] = useState<AvailabilityStatus | null>(currentStatus || null)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (newStatus: AvailabilityStatus) => {
    startTransition(async () => {
      try {
        await updateAvailability(sessionId, newStatus)
        setStatus(newStatus)
        onUpdate?.(newStatus)
      } catch (error) {
        console.error('Erreur lors de la mise a jour:', error)
      }
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Serez-vous present ?</p>
      <div className="flex gap-2">
        <Button
          variant={status === 'AVAILABLE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSelect('AVAILABLE')}
          disabled={isPending}
          className={cn(
            status === 'AVAILABLE' && 'bg-green-600 hover:bg-green-700'
          )}
        >
          <Check className="h-4 w-4 mr-1" />
          Oui
        </Button>
        <Button
          variant={status === 'MAYBE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSelect('MAYBE')}
          disabled={isPending}
          className={cn(
            status === 'MAYBE' && 'bg-yellow-600 hover:bg-yellow-700'
          )}
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Peut-etre
        </Button>
        <Button
          variant={status === 'UNAVAILABLE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSelect('UNAVAILABLE')}
          disabled={isPending}
          className={cn(
            status === 'UNAVAILABLE' && 'bg-red-600 hover:bg-red-700'
          )}
        >
          <X className="h-4 w-4 mr-1" />
          Non
        </Button>
      </div>
    </div>
  )
}
