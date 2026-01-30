// Group types and constants - shared between client and server
import { REACTION_EMOJIS, type ReactionEmoji, type ReactionRecord, type ReplyInfo } from './chat-types'

export type MemberRole = 'admin' | 'member'

export interface GroupRecord {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  color: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
  memberCount?: number
  isAdmin?: boolean
}

export interface GroupMemberRecord {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: MemberRole
  joinedAt: Date
}

export interface GroupMessageRecord {
  id: string
  content: string
  messageType: 'text' | 'dice_roll' | 'system'
  metadata: Record<string, unknown>
  isDeleted: boolean
  groupId: string
  senderId: string
  senderName: string
  senderRole: 'MJ' | 'PLAYER'
  senderColor: string | null
  replyTo: ReplyInfo | null
  isPinned: boolean
  reactions: ReactionRecord[]
  createdAt: Date
}

// Re-export for convenience
export { REACTION_EMOJIS, type ReactionEmoji, type ReactionRecord, type ReplyInfo }
