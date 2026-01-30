// Chat types and constants - shared between client and server

export type MessageType = 'text' | 'dice_roll' | 'system'

// Emoji types for reactions
export const REACTION_EMOJIS = {
  thumbs_up: '👍',
  laugh: '😂',
  skull: '💀',
  sword: '⚔️',
  fire: '🔥',
  heart: '❤️'
} as const

export type ReactionEmoji = keyof typeof REACTION_EMOJIS

export interface ReactionRecord {
  id: string
  emoji: ReactionEmoji
  userId: string
  userName: string
}

export interface ReplyInfo {
  id: string
  content: string
  senderName: string
}

export interface CharacterInfo {
  id: string
  name: string
  imageUrl: string | null
}

export interface ChatMessageRecord {
  id: string
  content: string
  messageType: MessageType
  metadata: Record<string, unknown>
  isDeleted: boolean
  campaignId: string
  senderId: string
  senderName: string
  senderRole: 'MJ' | 'PLAYER'
  senderColor: string | null
  recipientId: string | null
  recipientName: string | null
  replyTo: ReplyInfo | null
  character: CharacterInfo | null
  isSecret: boolean
  isPinned: boolean
  reactions: ReactionRecord[]
  createdAt: Date
}
