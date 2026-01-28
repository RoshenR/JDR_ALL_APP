'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import { triggerPusherEvent, getCampaignChannel, getPrivateChannel } from '@/lib/pusher/server'
import { rollFormula, isValidDiceFormula } from '@/lib/dice-parser'

export type MessageType = 'text' | 'dice_roll' | 'system'

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
  createdAt: Date
}

// Envoyer un message
export async function sendMessage(data: {
  campaignId: string
  content: string
  recipientId?: string // null = message groupe
}): Promise<{ success: true; message: ChatMessageRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!data.content.trim()) {
    return { success: false, error: 'Message vide' }
  }

  // Vérifier si c'est une commande /roll
  if (data.content.startsWith('/roll ') || data.content.startsWith('/r ')) {
    const formula = data.content.replace(/^\/(roll|r)\s+/, '').trim()
    return sendDiceRollMessage({
      campaignId: data.campaignId,
      formula,
      recipientId: data.recipientId
    })
  }

  // Récupérer le destinataire si message privé
  let recipient = null
  if (data.recipientId) {
    recipient = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { id: true, name: true }
    })
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: data.content,
      messageType: 'text',
      campaignId: data.campaignId,
      senderId: user.id,
      recipientId: data.recipientId || null
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } }
    }
  })

  const messageRecord: ChatMessageRecord = {
    id: message.id,
    content: message.content,
    messageType: message.messageType as MessageType,
    metadata: JSON.parse(message.metadata),
    isDeleted: message.isDeleted,
    campaignId: message.campaignId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    recipientId: message.recipientId,
    recipientName: message.recipient?.name || null,
    createdAt: message.createdAt
  }

  // Broadcast via Pusher
  try {
    if (data.recipientId) {
      // Message privé - envoyer au canal de la campagne (MJ verra)
      // et au canal privé du destinataire
      await Promise.all([
        triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', {
          ...messageRecord,
          createdAt: messageRecord.createdAt.toISOString()
        }),
        triggerPusherEvent(getPrivateChannel(data.recipientId), 'chat-message', {
          ...messageRecord,
          createdAt: messageRecord.createdAt.toISOString()
        })
      ])
    } else {
      // Message groupe
      await triggerPusherEvent(getCampaignChannel(data.campaignId), 'chat-message', {
        ...messageRecord,
        createdAt: messageRecord.createdAt.toISOString()
      })
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
      recipientId: data.recipientId || null
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } }
    }
  })

  const messageRecord: ChatMessageRecord = {
    id: message.id,
    content: message.content,
    messageType: message.messageType as MessageType,
    metadata,
    isDeleted: message.isDeleted,
    campaignId: message.campaignId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    recipientId: message.recipientId,
    recipientName: message.recipient?.name || null,
    createdAt: message.createdAt
  }

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
  // Les messages système utilisent un userId système ou le premier MJ
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
      createdAt: new Date().toISOString()
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
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
      // Si pas MJ, ne voir que les messages de groupe ou ceux où on est impliqué
      ...(isMJ
        ? {}
        : {
            OR: [
              { recipientId: null }, // Messages groupe
              { senderId: user.id }, // Messages qu'on a envoyés
              { recipientId: user.id } // Messages qu'on a reçus
            ]
          }),
      ...(options?.before ? { id: { lt: options.before } } : {})
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } },
      recipient: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return messages.reverse().map(message => ({
    id: message.id,
    content: message.content,
    messageType: message.messageType as MessageType,
    metadata: JSON.parse(message.metadata),
    isDeleted: message.isDeleted,
    campaignId: message.campaignId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    recipientId: message.recipientId,
    recipientName: message.recipient?.name || null,
    createdAt: message.createdAt
  }))
}

// Supprimer un message (soft delete)
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

  // Seul l'auteur ou le MJ peut supprimer
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

// Mettre à jour la couleur du chat de l'utilisateur
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

// Récupérer les participants d'une campagne pour les messages privés
export async function getCampaignParticipants(campaignId: string): Promise<Array<{
  id: string
  name: string
  role: string
}>> {
  const user = await getCurrentUser()
  if (!user) return []

  // Récupérer tous les utilisateurs qui ont des personnages dans cette campagne
  // ou qui sont MJ
  const characters = await prisma.character.findMany({
    where: { campaignId },
    include: {
      owner: {
        select: { id: true, name: true, role: true }
      }
    }
  })

  const participants = new Map<string, { id: string; name: string; role: string }>()

  // Ajouter les propriétaires de personnages
  for (const char of characters) {
    if (char.owner && char.owner.id !== user.id) {
      participants.set(char.owner.id, {
        id: char.owner.id,
        name: char.owner.name,
        role: char.owner.role
      })
    }
  }

  // Ajouter tous les MJ
  const mjs = await prisma.user.findMany({
    where: { role: 'MJ', id: { not: user.id } },
    select: { id: true, name: true, role: true }
  })

  for (const mj of mjs) {
    participants.set(mj.id, mj)
  }

  return Array.from(participants.values())
}
