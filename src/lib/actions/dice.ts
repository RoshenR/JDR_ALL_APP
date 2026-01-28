'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import { rollFormula, isValidDiceFormula, DiceResult } from '@/lib/dice-parser'
import { triggerPusherEvent, getCampaignChannel } from '@/lib/pusher/server'

export interface DiceRollRecord {
  id: string
  formula: string
  results: number[]
  total: number
  label: string | null
  isPrivate: boolean
  userId: string
  userName: string
  campaignId: string | null
  createdAt: Date
}

// Effectuer un jet de dés
export async function rollDice(data: {
  formula: string
  label?: string
  isPrivate?: boolean
  campaignId?: string
}): Promise<{ success: true; roll: DiceRollRecord } | { success: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Valider la formule
  if (!isValidDiceFormula(data.formula)) {
    return { success: false, error: 'Formule de dés invalide' }
  }

  // Effectuer le jet
  const result = rollFormula(data.formula)

  // Collecter tous les résultats individuels
  const allResults = result.rolls.flatMap(roll => roll.results)

  // Enregistrer en base de données
  const diceRoll = await prisma.diceRoll.create({
    data: {
      formula: data.formula,
      results: JSON.stringify(allResults),
      total: result.total,
      label: data.label || null,
      isPrivate: data.isPrivate || false,
      userId: user.id,
      campaignId: data.campaignId || null
    }
  })

  const rollRecord: DiceRollRecord = {
    id: diceRoll.id,
    formula: diceRoll.formula,
    results: allResults,
    total: diceRoll.total,
    label: diceRoll.label,
    isPrivate: diceRoll.isPrivate,
    userId: diceRoll.userId,
    userName: user.name,
    campaignId: diceRoll.campaignId,
    createdAt: diceRoll.createdAt
  }

  // Broadcast via Pusher si dans une campagne et pas privé
  if (data.campaignId && !data.isPrivate) {
    try {
      await triggerPusherEvent(
        getCampaignChannel(data.campaignId),
        'dice-roll',
        {
          ...rollRecord,
          createdAt: rollRecord.createdAt.toISOString()
        }
      )
    } catch {
      console.error('Erreur Pusher (non bloquante)')
    }
  }

  if (data.campaignId) {
    revalidatePath(`/campaigns/${data.campaignId}`)
  }

  return { success: true, roll: rollRecord }
}

// Récupérer l'historique des jets pour une campagne
export async function getCampaignDiceRolls(
  campaignId: string,
  options?: { limit?: number; includePrivate?: boolean }
): Promise<DiceRollRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const limit = options?.limit || 50
  const isMJ = user.role === 'MJ'

  const rolls = await prisma.diceRoll.findMany({
    where: {
      campaignId,
      // Si pas MJ, ne voir que ses jets privés ou les jets publics
      ...(isMJ || options?.includePrivate
        ? {}
        : {
            OR: [
              { isPrivate: false },
              { userId: user.id }
            ]
          })
    },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return rolls.map(roll => ({
    id: roll.id,
    formula: roll.formula,
    results: JSON.parse(roll.results),
    total: roll.total,
    label: roll.label,
    isPrivate: roll.isPrivate,
    userId: roll.userId,
    userName: roll.user.name,
    campaignId: roll.campaignId,
    createdAt: roll.createdAt
  }))
}

// Récupérer l'historique des jets de l'utilisateur courant
export async function getMyDiceRolls(limit: number = 20): Promise<DiceRollRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const rolls = await prisma.diceRoll.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return rolls.map(roll => ({
    id: roll.id,
    formula: roll.formula,
    results: JSON.parse(roll.results),
    total: roll.total,
    label: roll.label,
    isPrivate: roll.isPrivate,
    userId: roll.userId,
    userName: roll.user.name,
    campaignId: roll.campaignId,
    createdAt: roll.createdAt
  }))
}

// Supprimer un jet de dés
export async function deleteDiceRoll(rollId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const roll = await prisma.diceRoll.findUnique({
    where: { id: rollId }
  })

  if (!roll) {
    return { success: false, error: 'Jet non trouvé' }
  }

  // Seul le propriétaire ou le MJ peut supprimer
  if (roll.userId !== user.id && user.role !== 'MJ') {
    return { success: false, error: 'Non autorisé' }
  }

  await prisma.diceRoll.delete({
    where: { id: rollId }
  })

  if (roll.campaignId) {
    revalidatePath(`/campaigns/${roll.campaignId}`)
  }

  return { success: true }
}

