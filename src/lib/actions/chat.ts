'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import { triggerPusherEvent, getCampaignChannel, getPrivateChannel } from '@/lib/pusher/server'
import { rollFormula, isValidDiceFormula } from '@/lib/dice-parser'

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

// Envoyer un message avec nouvelles options
export async function sendMessage(data: {
  campaignId: string
  content: string
  recipientId?: string
  replyToId?: string
  characterId?: string
  isSecret?: boolean
}): Promise<{ success: true; message: ChatMessageRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!data.content.trim()) {
    return { success: false, error: 'Message vide' }
  }

  // Only MJ can send secret messages
  if (data.isSecret && user.role !== 'MJ') {
    return { success: false, error: 'Seul le MJ peut envoyer des messages secrets' }
  }

  // Vérifier si c'est une commande /roll
  if (data.content.startsWith('/roll ') || data.content.startsWith('/r ')) {
    const formula = data.content.replace(/^\/(roll|r)\s+/, '').trim()
    return sendDiceRollMessage({
      campaignId: data.campaignId,
      formula,
      recipientId: data.recipientId,
      characterId: data.characterId
    })
  }

  // Validate character belongs to user if provided
  if (data.characterId) {
    const character = await prisma.character.findFirst({
      where: {
        id: data.characterId,
        ownerId: user.id,
        campaignId: data.campaignId
      }
    })
    if (!character) {
      return { success: false, error: 'Personnage invalide' }
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: data.content,
      messageType: 'text',
      campaignId: data.campaignId,
      senderId: user.id,
      recipientId: data.recipientId || null,
      replyToId: data.replyToId || null,
      characterId: data.characterId || null,
      isSecret: data.isSecret || false
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } },
      replyTo: {
        select: {
          id: true,
          content: true,
          sender: { select: { name: true } }
        }
      },
      character: { select: { id: true, name: true, imageUrl: true } },
      reactions: {
        include: { user: { select: { name: true } } }
      },
      pinnedMessage: true
    }
  })

  const messageRecord = formatMessageRecord(message, data.campaignId)

  // Broadcast via Pusher
  try {
    const pusherData = {
      ...messageRecord,
      createdAt: messageRecord.createdAt.toISOString()
    }

    if (data.recipientId || data.isSecret) {
      // Private or secret message
      await Promise.all([
        triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', pusherData),
        ...(data.recipientId
          ? [triggerPusherEvent(getPrivateChannel(data.recipientId), 'chat-message', pusherData)]
          : [])
      ])
    } else {
      await triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', pusherData)
    }
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  revalidatePath(`/campaigns/${data.campaignId}/chat`)
  return { success: true, message: messageRecord }
}

// Envoyer un message de jet de dés via le chat
export async function sendDiceRollMessage(data: {
  campaignId: string
  formula: string
  recipientId?: string
  characterId?: string
}): Promise<{ success: true; message: ChatMessageRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!isValidDiceFormula(data.formula)) {
    return { success: false, error: 'Formule de dés invalide' }
  }

  const result = rollFormula(data.formula)
  const allResults = result.rolls.flatMap(roll => roll.results)

  const metadata = {
    formula: data.formula,
    results: allResults,
    total: result.total,
    modifier: result.modifier
  }

  const content = `lance ${data.formula}: [${allResults.join(', ')}] = ${result.total}`

  const message = await prisma.chatMessage.create({
    data: {
      content,
      messageType: 'dice_roll',
      metadata: JSON.stringify(metadata),
      campaignId: data.campaignId,
      senderId: user.id,
      recipientId: data.recipientId || null,
      characterId: data.characterId || null
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } },
      replyTo: {
        select: {
          id: true,
          content: true,
          sender: { select: { name: true } }
        }
      },
      character: { select: { id: true, name: true, imageUrl: true } },
      reactions: {
        include: { user: { select: { name: true } } }
      },
      pinnedMessage: true
    }
  })

  const messageRecord = formatMessageRecord(message, data.campaignId)

  // Broadcast via Pusher
  try {
    await triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', {
      ...messageRecord,
      createdAt: messageRecord.createdAt.toISOString()
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  revalidatePath(`/campaigns/${data.campaignId}/chat`)
  return { success: true, message: messageRecord }
}

// Envoyer un message système (automatique)
export async function sendSystemMessage(data: {
  campaignId: string
  content: string
}): Promise<void> {
  const mj = await prisma.user.findFirst({
    where: { role: 'MJ' }
  })

  if (!mj) return

  await prisma.chatMessage.create({
    data: {
      content: data.content,
      messageType: 'system',
      campaignId: data.campaignId,
      senderId: mj.id
    }
  })

  try {
    await triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', {
      id: 'system-' + Date.now(),
      content: data.content,
      messageType: 'system',
      metadata: {},
      campaignId: data.campaignId,
      senderId: 'system',
      senderName: 'Système',
      senderRole: 'MJ',
      senderColor: null,
      recipientId: null,
      recipientName: null,
      replyTo: null,
      character: null,
      isSecret: false,
      isPinned: false,
      reactions: [],
      createdAt: new Date().toISOString()
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }
}

// Helper to format message record
function formatMessageRecord(message: {
  id: string
  content: string
  messageType: string
  metadata: string
  isDeleted: boolean
  campaignId: string | null
  senderId: string
  recipientId: string | null
  isSecret: boolean
  createdAt: Date
  sender: { name: string; role: string; chatColor: string | null }
  recipient: { name: string } | null
  replyTo: { id: string; content: string; sender: { name: string } } | null
  character: { id: string; name: string; imageUrl: string | null } | null
  reactions: Array<{ id: string; emoji: string; userId: string; user: { name: string } }>
  pinnedMessage: { id: string } | null
}, defaultCampaignId: string): ChatMessageRecord {
  return {
    id: message.id,
    content: message.content,
    messageType: message.messageType as MessageType,
    metadata: JSON.parse(message.metadata),
    isDeleted: message.isDeleted,
    campaignId: message.campaignId ?? defaultCampaignId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    recipientId: message.recipientId,
    recipientName: message.recipient?.name || null,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          senderName: message.replyTo.sender.name
        }
      : null,
    character: message.character
      ? {
          id: message.character.id,
          name: message.character.name,
          imageUrl: message.character.imageUrl
        }
      : null,
    isSecret: message.isSecret,
    isPinned: !!message.pinnedMessage,
    reactions: message.reactions.map(r => ({
      id: r.id,
      emoji: r.emoji as ReactionEmoji,
      userId: r.userId,
      userName: r.user.name
    })),
    createdAt: message.createdAt
  }
}

// Récupérer les messages d'une campagne
export async function getCampaignMessages(
  campaignId: string,
  options?: { limit?: number; before?: string }
): Promise<ChatMessageRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const limit = options?.limit || 100
  const isMJ = user.role === 'MJ'

  const messages = await prisma.chatMessage.findMany({
    where: {
      campaignId,
      isDeleted: false,
      ...(isMJ
        ? {}
        : {
            OR: [
              { recipientId: null, isSecret: false },
              { senderId: user.id },
              { recipientId: user.id }
            ]
          }),
      ...(options?.before ? { id: { lt: options.before } } : {})
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } },
      replyTo: {
        select: {
          id: true,
          content: true,
          sender: { select: { name: true } }
        }
      },
      character: { select: { id: true, name: true, imageUrl: true } },
      reactions: {
        include: { user: { select: { name: true } } }
      },
      pinnedMessage: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return messages.reverse().map(m => formatMessageRecord(m, campaignId))
}

// ============ REACTIONS ============

export async function addReaction(
  messageId: string,
  emoji: ReactionEmoji
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!REACTION_EMOJIS[emoji]) {
    return { success: false, error: 'Emoji invalide' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { campaignId: true }
  })

  if (!message) {
    return { success: false, error: 'Message non trouvé' }
  }

  try {
    const reaction = await prisma.messageReaction.create({
      data: {
        emoji,
        messageId,
        userId: user.id
      },
      include: {
        user: { select: { name: true } }
      }
    })

    // Broadcast via Pusher
    if (message.campaignId) {
      await triggerPusherEvent(getCampaignChannel(message.campaignId), 'reaction-added', {
        messageId,
        reaction: {
          id: reaction.id,
          emoji,
          userId: user.id,
          userName: reaction.user.name
        }
      })
    }

    return { success: true }
  } catch {
    // Likely duplicate - user already reacted with this emoji
    return { success: false, error: 'Réaction déjà existante' }
  }
}

export async function removeReaction(
  messageId: string,
  emoji: ReactionEmoji
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { campaignId: true }
  })

  if (!message) {
    return { success: false, error: 'Message non trouvé' }
  }

  await prisma.messageReaction.deleteMany({
    where: {
      messageId,
      userId: user.id,
      emoji
    }
  })

  // Broadcast via Pusher
  if (message.campaignId) {
    await triggerPusherEvent(getCampaignChannel(message.campaignId), 'reaction-removed', {
      messageId,
      emoji,
      userId: user.id
    })
  }

  return { success: true }
}

// ============ PINNED MESSAGES ============

export async function pinMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (user.role !== 'MJ') {
    return { success: false, error: 'Seul le MJ peut épingler des messages' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { pinnedMessage: true }
  })

  if (!message) {
    return { success: false, error: 'Message non trouvé' }
  }

  if (message.pinnedMessage) {
    return { success: false, error: 'Message déjà épinglé' }
  }

  await prisma.pinnedMessage.create({
    data: {
      messageId,
      pinnedById: user.id,
      campaignId: message.campaignId
    }
  })

  // Broadcast via Pusher
  if (message.campaignId) {
    await triggerPusherEvent(getCampaignChannel(message.campaignId), 'message-pinned', {
      messageId
    })
  }

  return { success: true }
}

export async function unpinMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (user.role !== 'MJ') {
    return { success: false, error: 'Seul le MJ peut désépingler des messages' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { campaignId: true }
  })

  if (!message) {
    return { success: false, error: 'Message non trouvé' }
  }

  await prisma.pinnedMessage.deleteMany({
    where: { messageId }
  })

  // Broadcast via Pusher
  if (message.campaignId) {
    await triggerPusherEvent(getCampaignChannel(message.campaignId), 'message-unpinned', {
      messageId
    })
  }

  return { success: true }
}

export async function getPinnedMessages(campaignId: string): Promise<ChatMessageRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const pinnedMessages = await prisma.pinnedMessage.findMany({
    where: { campaignId },
    include: {
      message: {
        include: {
          sender: { select: { name: true, role: true, chatColor: true } },
          recipient: { select: { name: true } },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: { select: { name: true } }
            }
          },
          character: { select: { id: true, name: true, imageUrl: true } },
          reactions: {
            include: { user: { select: { name: true } } }
          },
          pinnedMessage: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return pinnedMessages.map(pm => formatMessageRecord(pm.message, campaignId))
}

// ============ SEARCH ============

export async function searchMessages(
  campaignId: string,
  query: string
): Promise<ChatMessageRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  if (!query.trim()) return []

  const isMJ = user.role === 'MJ'

  const messages = await prisma.chatMessage.findMany({
    where: {
      campaignId,
      isDeleted: false,
      content: {
        contains: query,
        mode: 'insensitive'
      },
      ...(isMJ
        ? {}
        : {
            OR: [
              { recipientId: null, isSecret: false },
              { senderId: user.id },
              { recipientId: user.id }
            ]
          })
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } },
      replyTo: {
        select: {
          id: true,
          content: true,
          sender: { select: { name: true } }
        }
      },
      character: { select: { id: true, name: true, imageUrl: true } },
      reactions: {
        include: { user: { select: { name: true } } }
      },
      pinnedMessage: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return messages.map(m => formatMessageRecord(m, campaignId))
}

// ============ TYPING INDICATOR ============

export async function broadcastTyping(
  campaignId: string,
  isTyping: boolean
): Promise<{ success: boolean }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false }
  }

  try {
    await triggerPusherEvent(getCampaignChannel(campaignId), 'typing-indicator', {
      userId: user.id,
      userName: user.name,
      isTyping
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}

// ============ USER CHARACTERS FOR CHAT ============

export async function getUserCharactersForChat(campaignId: string): Promise<Array<{
  id: string
  name: string
  imageUrl: string | null
}>> {
  const user = await getCurrentUser()
  if (!user) return []

  const characters = await prisma.character.findMany({
    where: {
      campaignId,
      ownerId: user.id
    },
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  })

  return characters
}

// ============ EXISTING FUNCTIONS ============

export async function deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId }
  })

  if (!message) {
    return { success: false, error: 'Message non trouvé' }
  }

  if (message.senderId !== user.id && user.role !== 'MJ') {
    return { success: false, error: 'Non autorisé' }
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true }
  })

  revalidatePath(`/campaigns/${message.campaignId}/chat`)
  return { success: true }
}

export async function updateChatColor(color: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const validColors = ['blue', 'emerald', 'violet', 'rose', 'cyan', 'orange', 'pink', 'teal', null]
  if (color !== null && !validColors.includes(color)) {
    return { success: false, error: 'Couleur invalide' }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { chatColor: color }
  })

  return { success: true }
}

export async function getCampaignParticipants(campaignId: string): Promise<Array<{
  id: string
  name: string
  role: string
}>> {
  const user = await getCurrentUser()
  if (!user) return []

  const characters = await prisma.character.findMany({
    where: { campaignId },
    include: {
      owner: {
        select: { id: true, name: true, role: true }
      }
    }
  })

  const participants = new Map<string, { id: string; name: string; role: string }>()

  for (const char of characters) {
    if (char.owner && char.owner.id !== user.id) {
      participants.set(char.owner.id, {
        id: char.owner.id,
        name: char.owner.name,
        role: char.owner.role
      })
    }
  }

  const mjs = await prisma.user.findMany({
    where: { role: 'MJ', id: { not: user.id } },
    select: { id: true, name: true, role: true }
  })

  for (const mj of mjs) {
    participants.set(mj.id, mj)
  }

  return Array.from(participants.values())
}
