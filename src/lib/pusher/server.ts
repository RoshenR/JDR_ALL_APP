import Pusher from 'pusher'

// Singleton pattern pour le client Pusher côté serveur
let pusherInstance: Pusher | null = null

export function getPusherServer(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true
    })
  }
  return pusherInstance
}

// Types d'événements Pusher
export type PusherEventType =
  | 'dice-roll'
  | 'combat-update'
  | 'chat-message'
  | 'quest-update'
  | 'loot-update'

// Fonction helper pour trigger des événements
export async function triggerPusherEvent(
  channel: string,
  event: PusherEventType,
  data: unknown
): Promise<void> {
  const pusher = getPusherServer()
  await pusher.trigger(channel, event, data)
}

// Canaux de campagne
export function getCampaignChannel(campaignId: string): string {
  return `campaign-${campaignId}`
}

// Canaux de combat
export function getCombatChannel(combatId: string): string {
  return `combat-${combatId}`
}

// Canaux privés pour les messages DM
export function getPrivateChannel(userId: string): string {
  return `private-user-${userId}`
}
