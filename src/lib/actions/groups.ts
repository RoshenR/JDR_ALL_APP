'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import { triggerPusherEvent, getGroupChannel } from '@/lib/pusher/server'
import { rollFormula, isValidDiceFormula } from '@/lib/dice-parser'

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
  createdAt: Date
}

// Créer un groupe
export async function createGroup(data: {
  name: string
  description?: string
  iconUrl?: string
  color?: string
}): Promise<{ success: true; group: GroupRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!data.name.trim()) {
    return { success: false, error: 'Le nom est requis' }
  }

  const group = await prisma.chatGroup.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      iconUrl: data.iconUrl || null,
      color: data.color || null,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'admin'
        }
      }
    }
  })

  revalidatePath('/groups')
  return {
    success: true,
    group: {
      ...group,
      memberCount: 1,
      isAdmin: true
    }
  }
}

// Liste des groupes de l'utilisateur
export async function getUserGroups(): Promise<GroupRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const memberships = await prisma.chatGroupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          _count: {
            select: { members: true }
          }
        }
      }
    },
    orderBy: { group: { updatedAt: 'desc' } }
  })

  return memberships.map(m => ({
    id: m.group.id,
    name: m.group.name,
    description: m.group.description,
    iconUrl: m.group.iconUrl,
    color: m.group.color,
    createdById: m.group.createdById,
    createdAt: m.group.createdAt,
    updatedAt: m.group.updatedAt,
    memberCount: m.group._count.members,
    isAdmin: m.role === 'admin'
  }))
}

// Détails d'un groupe
export async function getGroup(groupId: string): Promise<GroupRecord | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    },
    include: {
      group: {
        include: {
          _count: {
            select: { members: true }
          }
        }
      }
    }
  })

  if (!membership) return null

  return {
    id: membership.group.id,
    name: membership.group.name,
    description: membership.group.description,
    iconUrl: membership.group.iconUrl,
    color: membership.group.color,
    createdById: membership.group.createdById,
    createdAt: membership.group.createdAt,
    updatedAt: membership.group.updatedAt,
    memberCount: membership.group._count.members,
    isAdmin: membership.role === 'admin'
  }
}

// Modifier un groupe (admin only)
export async function updateGroup(
  groupId: string,
  data: {
    name?: string
    description?: string
    iconUrl?: string
    color?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!membership || membership.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  await prisma.chatGroup.update({
    where: { id: groupId },
    data: {
      name: data.name?.trim(),
      description: data.description?.trim(),
      iconUrl: data.iconUrl,
      color: data.color
    }
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return { success: true }
}

// Supprimer un groupe (admin only)
export async function deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!membership || membership.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  await prisma.chatGroup.delete({
    where: { id: groupId }
  })

  revalidatePath('/groups')
  return { success: true }
}

// Liste des membres d'un groupe
export async function getGroupMembers(groupId: string): Promise<GroupMemberRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  // Vérifier que l'utilisateur est membre
  const isMember = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!isMember) return []

  const members = await prisma.chatGroupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }]
  })

  return members.map(m => ({
    id: m.id,
    userId: m.user.id,
    userName: m.user.name,
    userEmail: m.user.email,
    role: m.role as MemberRole,
    joinedAt: m.joinedAt
  }))
}

// Ajouter un membre (admin only)
export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!membership || membership.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  // Vérifier que l'utilisateur à ajouter existe
  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!targetUser) {
    return { success: false, error: 'Utilisateur non trouvé' }
  }

  // Vérifier qu'il n'est pas déjà membre
  const existingMembership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId }
    }
  })

  if (existingMembership) {
    return { success: false, error: 'Déjà membre du groupe' }
  }

  await prisma.chatGroupMember.create({
    data: {
      groupId,
      userId,
      role: 'member'
    }
  })

  // Notifier via Pusher
  try {
    await triggerPusherEvent(getGroupChannel(groupId), 'member-added', {
      userId,
      userName: targetUser.name
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath(`/groups/${groupId}/settings`)
  return { success: true }
}

// Retirer un membre (admin ou soi-même)
export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const myMembership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!myMembership) {
    return { success: false, error: 'Non membre du groupe' }
  }

  // On peut se retirer soi-même ou être admin pour retirer quelqu'un
  if (userId !== user.id && myMembership.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  // Vérifier qu'on ne retire pas le dernier admin
  if (myMembership.role === 'admin') {
    const adminCount = await prisma.chatGroupMember.count({
      where: { groupId, role: 'admin' }
    })

    if (adminCount === 1 && userId === user.id) {
      return { success: false, error: 'Impossible de quitter: vous êtes le seul admin. Promouvez quelqu\'un d\'abord.' }
    }
  }

  const removedMember = await prisma.chatGroupMember.delete({
    where: {
      groupId_userId: { groupId, userId }
    },
    include: {
      user: { select: { name: true } }
    }
  })

  // Notifier via Pusher
  try {
    await triggerPusherEvent(getGroupChannel(groupId), 'member-removed', {
      userId,
      userName: removedMember.user.name
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath(`/groups/${groupId}/settings`)
  revalidatePath('/groups')
  return { success: true }
}

// Promouvoir/rétrograder un membre (admin only)
export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: MemberRole
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const myMembership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!myMembership || myMembership.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  // Vérifier qu'on ne rétrograde pas le dernier admin
  if (newRole === 'member') {
    const adminCount = await prisma.chatGroupMember.count({
      where: { groupId, role: 'admin' }
    })

    const targetMembership = await prisma.chatGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    })

    if (adminCount === 1 && targetMembership?.role === 'admin') {
      return { success: false, error: 'Impossible: il doit rester au moins un admin' }
    }
  }

  await prisma.chatGroupMember.update({
    where: {
      groupId_userId: { groupId, userId }
    },
    data: { role: newRole }
  })

  revalidatePath(`/groups/${groupId}/settings`)
  return { success: true }
}

// Recherche d'utilisateurs pour ajouter au groupe
export async function searchUsers(query: string, groupId?: string): Promise<Array<{
  id: string
  name: string
  email: string
}>> {
  const user = await getCurrentUser()
  if (!user) return []

  if (!query.trim() || query.length < 2) return []

  // Récupérer les IDs des membres existants du groupe
  let excludeIds: string[] = [user.id]
  if (groupId) {
    const existingMembers = await prisma.chatGroupMember.findMany({
      where: { groupId },
      select: { userId: true }
    })
    excludeIds = [...excludeIds, ...existingMembers.map(m => m.userId)]
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { notIn: excludeIds } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    select: { id: true, name: true, email: true },
    take: 10
  })

  return users
}

// Envoyer un message dans un groupe
export async function sendGroupMessage(data: {
  groupId: string
  content: string
}): Promise<{ success: true; message: GroupMessageRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  if (!data.content.trim()) {
    return { success: false, error: 'Message vide' }
  }

  // Vérifier que l'utilisateur est membre
  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId: data.groupId, userId: user.id }
    }
  })

  if (!membership) {
    return { success: false, error: 'Non membre du groupe' }
  }

  // Vérifier si c'est une commande /roll
  if (data.content.startsWith('/roll ') || data.content.startsWith('/r ')) {
    const formula = data.content.replace(/^\/(roll|r)\s+/, '').trim()
    return sendGroupDiceRollMessage({
      groupId: data.groupId,
      formula
    })
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: data.content,
      messageType: 'text',
      groupId: data.groupId,
      senderId: user.id
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } }
    }
  })

  const messageRecord: GroupMessageRecord = {
    id: message.id,
    content: message.content,
    messageType: message.messageType as 'text' | 'dice_roll' | 'system',
    metadata: JSON.parse(message.metadata),
    isDeleted: message.isDeleted,
    groupId: data.groupId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    createdAt: message.createdAt
  }

  // Broadcast via Pusher
  try {
    await triggerPusherEvent(getGroupChannel(data.groupId), 'chat-message', {
      ...messageRecord,
      createdAt: messageRecord.createdAt.toISOString()
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  // Update group updatedAt
  await prisma.chatGroup.update({
    where: { id: data.groupId },
    data: { updatedAt: new Date() }
  })

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true, message: messageRecord }
}

// Envoyer un message de jet de dés dans un groupe
async function sendGroupDiceRollMessage(data: {
  groupId: string
  formula: string
}): Promise<{ success: true; message: GroupMessageRecord } | { success: false; error: string }> {
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
      groupId: data.groupId,
      senderId: user.id
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } }
    }
  })

  const messageRecord: GroupMessageRecord = {
    id: message.id,
    content: message.content,
    messageType: message.messageType as 'text' | 'dice_roll' | 'system',
    metadata,
    isDeleted: message.isDeleted,
    groupId: data.groupId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    createdAt: message.createdAt
  }

  // Broadcast via Pusher
  try {
    await triggerPusherEvent(getGroupChannel(data.groupId), 'chat-message', {
      ...messageRecord,
      createdAt: messageRecord.createdAt.toISOString()
    })
  } catch {
    console.error('Erreur Pusher (non bloquante)')
  }

  // Update group updatedAt
  await prisma.chatGroup.update({
    where: { id: data.groupId },
    data: { updatedAt: new Date() }
  })

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true, message: messageRecord }
}

// Récupérer les messages d'un groupe
export async function getGroupMessages(
  groupId: string,
  options?: { limit?: number; before?: string }
): Promise<GroupMessageRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  // Vérifier que l'utilisateur est membre
  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: user.id }
    }
  })

  if (!membership) return []

  const limit = options?.limit || 100

  const messages = await prisma.chatMessage.findMany({
    where: {
      groupId,
      isDeleted: false,
      ...(options?.before ? { id: { lt: options.before } } : {})
    },
    include: {
      sender: { select: { name: true, role: true, chatColor: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return messages.reverse().map(message => ({
    id: message.id,
    content: message.content,
    messageType: message.messageType as 'text' | 'dice_roll' | 'system',
    metadata: JSON.parse(message.metadata),
    isDeleted: message.isDeleted,
    groupId: groupId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderRole: message.sender.role as 'MJ' | 'PLAYER',
    senderColor: message.sender.chatColor,
    createdAt: message.createdAt
  }))
}

// Supprimer un message de groupe
export async function deleteGroupMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { group: true }
  })

  if (!message || !message.groupId) {
    return { success: false, error: 'Message non trouvé' }
  }

  // Vérifier que l'utilisateur est l'auteur ou admin du groupe
  const membership = await prisma.chatGroupMember.findUnique({
    where: {
      groupId_userId: { groupId: message.groupId, userId: user.id }
    }
  })

  if (message.senderId !== user.id && membership?.role !== 'admin') {
    return { success: false, error: 'Non autorisé' }
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true }
  })

  revalidatePath(`/groups/${message.groupId}`)
  return { success: true }
}
