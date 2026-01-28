'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import type {
  QuestStatus,
  QuestDifficulty,
  QuestType,
  QuestObjective,
  QuestRewards,
  QuestRecord
} from '@/lib/quest-utils'

async function requireMJ() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')
  if (user.role !== 'MJ') throw new Error('Réservé au MJ')
  return user
}

function parseQuest(q: {
  id: string
  title: string
  description: string
  objectives: string
  rewards: string
  difficulty: string
  status: string
  questType: string | null
  location: string | null
  npcGiver: string | null
  campaignId: string
  createdAt: Date
  updatedAt: Date
}): QuestRecord {
  return {
    ...q,
    objectives: JSON.parse(q.objectives) as QuestObjective[],
    rewards: JSON.parse(q.rewards) as QuestRewards,
    difficulty: q.difficulty as QuestDifficulty,
    status: q.status as QuestStatus,
    questType: q.questType as QuestType | null
  }
}

// Récupérer toutes les quêtes d'une campagne
export async function getCampaignQuests(
  campaignId: string,
  filters?: { status?: QuestStatus }
): Promise<QuestRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const where: Record<string, unknown> = { campaignId }

  // Les joueurs ne voient que les quêtes actives ou terminées
  if (user.role !== 'MJ') {
    where.status = { in: ['active', 'completed', 'failed'] }
  } else if (filters?.status) {
    where.status = filters.status
  }

  const quests = await prisma.quest.findMany({
    where,
    orderBy: [
      { status: 'asc' },
      { updatedAt: 'desc' }
    ]
  })

  return quests.map(parseQuest)
}

// Récupérer une quête
export async function getQuest(id: string): Promise<QuestRecord | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const quest = await prisma.quest.findUnique({
    where: { id }
  })

  if (!quest) return null

  // Les joueurs ne peuvent pas voir les brouillons
  if (user.role !== 'MJ' && quest.status === 'draft') {
    return null
  }

  return parseQuest(quest)
}

// Créer une quête
export async function createQuest(data: {
  title: string
  description: string
  objectives?: QuestObjective[]
  rewards?: QuestRewards
  difficulty?: QuestDifficulty
  questType?: QuestType
  location?: string
  npcGiver?: string
  campaignId: string
  status?: QuestStatus
}): Promise<QuestRecord> {
  await requireMJ()

  const quest = await prisma.quest.create({
    data: {
      title: data.title,
      description: data.description,
      objectives: JSON.stringify(data.objectives || []),
      rewards: JSON.stringify(data.rewards || {}),
      difficulty: data.difficulty || 'medium',
      status: data.status || 'draft',
      questType: data.questType || null,
      location: data.location || null,
      npcGiver: data.npcGiver || null,
      campaignId: data.campaignId
    }
  })

  revalidatePath(`/campaigns/${data.campaignId}/quests`)
  return parseQuest(quest)
}

// Mettre à jour une quête
export async function updateQuest(
  id: string,
  data: {
    title?: string
    description?: string
    objectives?: QuestObjective[]
    rewards?: QuestRewards
    difficulty?: QuestDifficulty
    status?: QuestStatus
    questType?: QuestType | null
    location?: string | null
    npcGiver?: string | null
  }
): Promise<QuestRecord> {
  await requireMJ()

  const updateData: Record<string, unknown> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.objectives !== undefined) updateData.objectives = JSON.stringify(data.objectives)
  if (data.rewards !== undefined) updateData.rewards = JSON.stringify(data.rewards)
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
  if (data.status !== undefined) updateData.status = data.status
  if (data.questType !== undefined) updateData.questType = data.questType
  if (data.location !== undefined) updateData.location = data.location
  if (data.npcGiver !== undefined) updateData.npcGiver = data.npcGiver

  const quest = await prisma.quest.update({
    where: { id },
    data: updateData
  })

  revalidatePath(`/campaigns/${quest.campaignId}/quests`)
  revalidatePath(`/campaigns/${quest.campaignId}/quests/${id}`)
  return parseQuest(quest)
}

// Supprimer une quête
export async function deleteQuest(id: string): Promise<void> {
  await requireMJ()

  const quest = await prisma.quest.findUnique({
    where: { id },
    select: { campaignId: true }
  })

  if (!quest) return

  await prisma.quest.delete({ where: { id } })
  revalidatePath(`/campaigns/${quest.campaignId}/quests`)
}

// Changer le statut d'une quête
export async function updateQuestStatus(
  id: string,
  status: QuestStatus
): Promise<QuestRecord> {
  await requireMJ()

  const quest = await prisma.quest.update({
    where: { id },
    data: { status }
  })

  revalidatePath(`/campaigns/${quest.campaignId}/quests`)
  return parseQuest(quest)
}

// Marquer un objectif comme complété/non complété
export async function toggleQuestObjective(
  questId: string,
  objectiveId: string,
  isCompleted: boolean
): Promise<QuestRecord> {
  await requireMJ()

  const quest = await prisma.quest.findUnique({
    where: { id: questId }
  })

  if (!quest) throw new Error('Quête non trouvée')

  const objectives = JSON.parse(quest.objectives) as QuestObjective[]
  const objectiveIndex = objectives.findIndex(o => o.id === objectiveId)

  if (objectiveIndex === -1) throw new Error('Objectif non trouvé')

  objectives[objectiveIndex].isCompleted = isCompleted

  const updated = await prisma.quest.update({
    where: { id: questId },
    data: { objectives: JSON.stringify(objectives) }
  })

  revalidatePath(`/campaigns/${quest.campaignId}/quests`)
  return parseQuest(updated)
}

