'use client'

import PusherClient from 'pusher-js'

// Singleton pattern pour le client Pusher côté client
let pusherClientInstance: PusherClient | null = null

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true
      }
    )
  }
  return pusherClientInstance
}

// Types pour les événements reçus
export interface DiceRollEvent {
  id: string
  formula: string
  results: number[]
  total: number
  label?: string
  userId: string
  userName: string
  isPrivate: boolean
  createdAt: string
}

export interface CombatUpdateEvent {
  combatId: string
  type: 'participant_update' | 'turn_change' | 'round_change' | 'combat_end'
  data: unknown
}

export interface ChatMessageEvent {
  id: string
  content: string
  messageType: 'text' | 'dice_roll' | 'system'
  metadata: Record<string, unknown>
  senderId: string
  senderName: string
  recipientId?: string
  createdAt: string
}

export interface QuestUpdateEvent {
  questId: string
  type: 'created' | 'updated' | 'status_changed'
  data: unknown
}

export interface LootUpdateEvent {
  type: 'generated' | 'approved' | 'rejected' | 'distributed'
  data: unknown
}
