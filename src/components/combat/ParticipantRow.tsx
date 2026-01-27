'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Minus,
  Plus,
  Skull,
  Heart,
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMON_CONDITIONS = [
  'Aveuglé',
  'Charmé',
  'Assourdi',
  'Effrayé',
  'Agrippé',
  'Incapacité',
  'Invisible',
  'Paralysé',
  'Pétrifié',
  'Empoisonné',
  'À terre',
  'Entravé',
  'Étourdi',
  'Inconscient',
  'Concentré'
]

interface Participant {
  id: string
  name: string
  initiative: number
  currentHp: number
  maxHp: number
  armorClass: number | null
  isNpc: boolean
  isActive: boolean
  conditions: string[]
  notes: string | null
}

interface ParticipantRowProps {
  participant: Participant
  isCurrentTurn: boolean
  onUpdateHp: (id: string, delta: number) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onUpdateInitiative: (id: string, initiative: number) => void
  onRemove: (id: string) => void
  onUpdateConditions: (id: string, conditions: string[]) => void
  isMJ?: boolean
}

export function ParticipantRow({
  participant,
  isCurrentTurn,
  onUpdateHp,
  onToggleActive,
  onUpdateInitiative,
  onRemove,
  onUpdateConditions,
  isMJ = false
}: ParticipantRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [hpDelta, setHpDelta] = useState('')

  const hpPercentage = participant.maxHp > 0
    ? (participant.currentHp / participant.maxHp) * 100
    : 0

  const getHpColor = () => {
    if (hpPercentage <= 0) return 'bg-gray-500'
    if (hpPercentage <= 25) return 'bg-red-500'
    if (hpPercentage <= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleQuickHp = (delta: number) => {
    onUpdateHp(participant.id, delta)
  }

  const handleCustomHp = () => {
    const delta = parseInt(hpDelta)
    if (!isNaN(delta)) {
      onUpdateHp(participant.id, delta)
      setHpDelta('')
    }
  }

  const toggleCondition = (condition: string) => {
    const newConditions = participant.conditions.includes(condition)
      ? participant.conditions.filter(c => c !== condition)
      : [...participant.conditions, condition]
    onUpdateConditions(participant.id, newConditions)
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        isCurrentTurn && 'ring-2 ring-primary border-primary bg-primary/5',
        !participant.isActive && 'opacity-50 bg-muted'
      )}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Initiative */}
        <div className="flex flex-col items-center w-12">
          <span className="text-xs text-muted-foreground">Init</span>
          {isMJ ? (
            <Input
              type="number"
              value={participant.initiative}
              onChange={(e) => onUpdateInitiative(participant.id, parseInt(e.target.value) || 0)}
              className="w-12 h-8 text-center p-1"
            />
          ) : (
            <span className="font-mono text-lg">{participant.initiative}</span>
          )}
        </div>

        {/* Icon */}
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          participant.isNpc ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
        )}>
          {participant.isNpc ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>

        {/* Name & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('font-medium truncate', !participant.isActive && 'line-through')}>
              {participant.name}
            </span>
            {isCurrentTurn && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                Tour actuel
              </span>
            )}
          </div>

          {/* HP Bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
              <div
                className={cn('h-full transition-all', getHpColor())}
                style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
              />
            </div>
            <span className="text-sm font-mono">
              {participant.currentHp}/{participant.maxHp}
            </span>
          </div>

          {/* Conditions */}
          {participant.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {participant.conditions.map(condition => (
                <span
                  key={condition}
                  className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded"
                >
                  {condition}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AC */}
        {participant.armorClass && (
          <div className="flex items-center gap-1 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{participant.armorClass}</span>
          </div>
        )}

        {isMJ && (
          <>
            {/* Quick HP buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuickHp(-1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuickHp(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Toggle dead/alive */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleActive(participant.id, !participant.isActive)}
            >
              {participant.isActive ? (
                <Skull className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              ) : (
                <Heart className="h-4 w-4 text-muted-foreground hover:text-green-500" />
              )}
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>

      {/* Expanded Section (MJ only) */}
      {isMJ && expanded && (
        <div className="border-t p-3 space-y-3">
          {/* Custom HP adjustment */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Modifier PV:</span>
            <Input
              type="number"
              placeholder="-5 ou +3"
              value={hpDelta}
              onChange={(e) => setHpDelta(e.target.value)}
              className="w-24 h-8"
            />
            <Button size="sm" variant="outline" onClick={handleCustomHp}>
              Appliquer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateHp(participant.id, participant.maxHp - participant.currentHp)}
            >
              Soigner tout
            </Button>
          </div>

          {/* Conditions */}
          <div>
            <span className="text-sm text-muted-foreground">Conditions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {COMMON_CONDITIONS.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={cn(
                    'text-xs px-2 py-1 rounded border transition-colors',
                    participant.conditions.includes(condition)
                      ? 'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-muted border-transparent hover:border-border'
                  )}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Remove button */}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(participant.id)}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Retirer du combat
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
