'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Channel } from 'pusher-js'
import { getPusherClient } from '@/lib/pusher/client'

type EventCallback<T = unknown> = (data: T) => void

interface UsePusherOptions {
  channelName: string
  enabled?: boolean
}

export function usePusher({ channelName, enabled = true }: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const pusher = getPusherClient()
    channelRef.current = pusher.subscribe(channelName)

    return () => {
      if (channelRef.current) {
        pusher.unsubscribe(channelName)
        channelRef.current = null
      }
    }
  }, [channelName, enabled])

  const bind = useCallback(<T>(eventName: string, callback: EventCallback<T>) => {
    if (!channelRef.current) return () => {}

    channelRef.current.bind(eventName, callback)

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind(eventName, callback)
      }
    }
  }, [])

  return { bind, channel: channelRef.current }
}

// Hook spécialisé pour les campagnes
export function useCampaignChannel(campaignId: string | undefined, enabled = true) {
  return usePusher({
    channelName: campaignId ? `campaign-${campaignId}` : '',
    enabled: enabled && !!campaignId
  })
}

// Hook spécialisé pour les combats
export function useCombatChannel(combatId: string | undefined, enabled = true) {
  return usePusher({
    channelName: combatId ? `combat-${combatId}` : '',
    enabled: enabled && !!combatId
  })
}

// Hook spécialisé pour les groupes
export function useGroupChannel(groupId: string | undefined, enabled = true) {
  return usePusher({
    channelName: groupId ? `group-${groupId}` : '',
    enabled: enabled && !!groupId
  })
}

// Hook pour écouter un événement spécifique
export function usePusherEvent<T>(
  channelName: string,
  eventName: string,
  callback: EventCallback<T>,
  enabled = true
) {
  const { bind } = usePusher({ channelName, enabled })

  useEffect(() => {
    if (!enabled) return
    return bind(eventName, callback)
  }, [bind, eventName, callback, enabled])
}
