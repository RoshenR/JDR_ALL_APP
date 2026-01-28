'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCombatChannel } from './usePusher'
import type { CombatUpdateEvent } from '@/lib/pusher/client'

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
  order: number
}

interface Combat {
  id: string
  name: string
  description: string | null
  isActive: boolean
  currentRound: number
  currentTurn: number
  participants: Participant[]
}

interface UseCombatSyncOptions {
  combatId: string
  initialData: Combat
  onUpdate?: (combat: Combat) => void
}

export function useCombatSync({ combatId, initialData, onUpdate }: UseCombatSyncOptions) {
  const router = useRouter()
  const [combat, setCombat] = useState<Combat>(initialData)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { bind } = useCombatChannel(combatId)

  // Gérer les mises à jour en temps réel
  const handleCombatUpdate = useCallback((event: CombatUpdateEvent) => {
    setLastUpdate(new Date())

    switch (event.type) {
      case 'participant_update': {
        const updateData = event.data as { participantId: string; changes: Partial<Participant> }
        setCombat(prev => ({
          ...prev,
          participants: prev.participants.map(p =>
            p.id === updateData.participantId
              ? { ...p, ...updateData.changes }
              : p
          )
        }))
        break
      }

      case 'turn_change': {
        const turnData = event.data as { currentTurn: number; currentRound: number }
        setCombat(prev => ({
          ...prev,
          currentTurn: turnData.currentTurn,
          currentRound: turnData.currentRound
        }))
        break
      }

      case 'round_change': {
        const roundData = event.data as { currentRound: number }
        setCombat(prev => ({
          ...prev,
          currentRound: roundData.currentRound
        }))
        break
      }

      case 'combat_end': {
        setCombat(prev => ({
          ...prev,
          isActive: false
        }))
        break
      }

      default:
        // Pour les mises à jour non gérées, rafraîchir la page
        router.refresh()
    }
  }, [router])

  // S'abonner aux événements
  useEffect(() => {
    const unbind = bind<CombatUpdateEvent>('combat-update', handleCombatUpdate)
    return unbind
  }, [bind, handleCombatUpdate])

  // Mettre à jour le state local quand initialData change
  useEffect(() => {
    setCombat(initialData)
  }, [initialData])

  // Notifier les changements
  useEffect(() => {
    onUpdate?.(combat)
  }, [combat, onUpdate])

  return {
    combat,
    lastUpdate,
    // Fonction pour forcer une mise à jour manuelle
    refresh: () => router.refresh()
  }
}

export default useCombatSync
