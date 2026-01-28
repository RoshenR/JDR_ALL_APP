'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'
import { triggerPusherEvent, getCombatChannel } from '@/lib/pusher/server'

async function requireMJ() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')
  if (user.role !== 'MJ') throw new Error('Réservé au MJ')
  return user
}

// Helper pour broadcast Pusher (non bloquant)
async function broadcastCombatUpdate(
  combatId: string,
  type: 'participant_update' | 'turn_change' | 'round_change' | 'combat_end',
  data: unknown
) {
  try {
    await triggerPusherEvent(getCombatChannel(combatId), 'combat-update', {
      combatId,
      type,
      data
    })
  } catch (error) {
    console.error('Erreur Pusher broadcast:', error)
  }
}

export async function getCombats() {
  return prisma.combat.findMany({
    include: {
      participants: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getActiveCombats() {
  return prisma.combat.findMany({
    where: { isActive: true },
    include: {
      participants: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getCombat(id: string) {
  const combat = await prisma.combat.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: { order: 'asc' }
      }
    }
  })
  if (!combat) return null
  return {
    ...combat,
    participants: combat.participants.map(p => ({
      ...p,
      conditions: JSON.parse(p.conditions)
    }))
  }
}

export async function createCombat(data: {
  name: string
  description?: string
  campaignId?: string
}) {
  await requireMJ()

  const combat = await prisma.combat.create({
    data: {
      name: data.name,
      description: data.description || null,
      campaignId: data.campaignId || null
    }
  })
  revalidatePath('/combat')
  return combat
}

export async function updateCombat(id: string, data: {
  name?: string
  description?: string
  isActive?: boolean
  currentRound?: number
  currentTurn?: number
}) {
  await requireMJ()

  const combat = await prisma.combat.update({
    where: { id },
    data
  })

  // Broadcast si le combat est terminé
  if (data.isActive === false) {
    await broadcastCombatUpdate(id, 'combat_end', { combatId: id })
  }

  revalidatePath('/combat')
  revalidatePath(`/combat/${id}`)
  return combat
}

export async function deleteCombat(id: string) {
  await requireMJ()
  await prisma.combat.delete({ where: { id } })
  revalidatePath('/combat')
}

// Participants
export async function addParticipant(combatId: string, data: {
  name: string
  initiative?: number
  currentHp?: number
  maxHp?: number
  armorClass?: number
  isNpc?: boolean
  characterId?: string
  notes?: string
}) {
  await requireMJ()

  // Get the highest order number
  const lastParticipant = await prisma.combatParticipant.findFirst({
    where: { combatId },
    orderBy: { order: 'desc' }
  })
  const order = (lastParticipant?.order || 0) + 1

  const participant = await prisma.combatParticipant.create({
    data: {
      combatId,
      name: data.name,
      initiative: data.initiative || 0,
      currentHp: data.currentHp || 0,
      maxHp: data.maxHp || data.currentHp || 0,
      armorClass: data.armorClass || null,
      isNpc: data.isNpc || false,
      characterId: data.characterId || null,
      notes: data.notes || null,
      order
    }
  })
  revalidatePath(`/combat/${combatId}`)
  return participant
}

export async function updateParticipant(id: string, data: {
  name?: string
  initiative?: number
  currentHp?: number
  maxHp?: number
  armorClass?: number
  isActive?: boolean
  conditions?: string[]
  notes?: string
  order?: number
}) {
  await requireMJ()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.initiative !== undefined) updateData.initiative = data.initiative
  if (data.currentHp !== undefined) updateData.currentHp = data.currentHp
  if (data.maxHp !== undefined) updateData.maxHp = data.maxHp
  if (data.armorClass !== undefined) updateData.armorClass = data.armorClass
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.conditions !== undefined) updateData.conditions = JSON.stringify(data.conditions)
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.order !== undefined) updateData.order = data.order

  const participant = await prisma.combatParticipant.update({
    where: { id },
    data: updateData
  })

  // Broadcast la mise à jour en temps réel
  await broadcastCombatUpdate(participant.combatId, 'participant_update', {
    participantId: id,
    changes: data
  })

  revalidatePath(`/combat/${participant.combatId}`)
  return participant
}

export async function removeParticipant(id: string) {
  await requireMJ()
  const participant = await prisma.combatParticipant.delete({ where: { id } })
  revalidatePath(`/combat/${participant.combatId}`)
}

// Combat flow
export async function sortByInitiative(combatId: string) {
  await requireMJ()

  const participants = await prisma.combatParticipant.findMany({
    where: { combatId },
    orderBy: { initiative: 'desc' }
  })

  // Update order based on initiative
  for (let i = 0; i < participants.length; i++) {
    await prisma.combatParticipant.update({
      where: { id: participants[i].id },
      data: { order: i }
    })
  }

  // Reset to first turn
  await prisma.combat.update({
    where: { id: combatId },
    data: { currentTurn: 0 }
  })

  revalidatePath(`/combat/${combatId}`)
}

export async function nextTurn(combatId: string) {
  await requireMJ()

  const combat = await prisma.combat.findUnique({
    where: { id: combatId },
    include: {
      participants: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!combat || combat.participants.length === 0) return

  let newTurn = combat.currentTurn + 1
  let newRound = combat.currentRound

  if (newTurn >= combat.participants.length) {
    newTurn = 0
    newRound += 1
  }

  await prisma.combat.update({
    where: { id: combatId },
    data: {
      currentTurn: newTurn,
      currentRound: newRound
    }
  })

  // Broadcast le changement de tour
  await broadcastCombatUpdate(combatId, 'turn_change', {
    currentTurn: newTurn,
    currentRound: newRound
  })

  revalidatePath(`/combat/${combatId}`)
}

export async function previousTurn(combatId: string) {
  await requireMJ()

  const combat = await prisma.combat.findUnique({
    where: { id: combatId },
    include: {
      participants: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!combat || combat.participants.length === 0) return

  let prevTurn = combat.currentTurn - 1
  let prevRound = combat.currentRound

  if (prevTurn < 0) {
    if (prevRound > 1) {
      prevTurn = combat.participants.length - 1
      prevRound -= 1
    } else {
      prevTurn = 0
    }
  }

  await prisma.combat.update({
    where: { id: combatId },
    data: {
      currentTurn: prevTurn,
      currentRound: prevRound
    }
  })

  // Broadcast le changement de tour
  await broadcastCombatUpdate(combatId, 'turn_change', {
    currentTurn: prevTurn,
    currentRound: prevRound
  })

  revalidatePath(`/combat/${combatId}`)
}

export async function resetCombat(combatId: string) {
  await requireMJ()

  // Reset all participants to full HP and active
  await prisma.combatParticipant.updateMany({
    where: { combatId },
    data: {
      isActive: true,
      conditions: '[]'
    }
  })

  // Reset participants HP to max
  const participants = await prisma.combatParticipant.findMany({
    where: { combatId }
  })
  for (const p of participants) {
    await prisma.combatParticipant.update({
      where: { id: p.id },
      data: { currentHp: p.maxHp }
    })
  }

  // Reset round and turn
  await prisma.combat.update({
    where: { id: combatId },
    data: {
      currentRound: 1,
      currentTurn: 0
    }
  })

  revalidatePath(`/combat/${combatId}`)
}

// Import character as participant
export async function addCharacterToCombat(combatId: string, characterId: string, initiative: number = 0) {
  await requireMJ()

  const character = await prisma.character.findUnique({
    where: { id: characterId }
  })

  if (!character) return null

  const attributes = JSON.parse(character.attributes)
  const hp = attributes.PV || attributes.HP || attributes['Points de vie'] || 10
  const ac = attributes.CA || attributes.AC || attributes['Classe d\'armure'] || null

  return addParticipant(combatId, {
    name: character.name,
    characterId: character.id,
    currentHp: hp,
    maxHp: hp,
    armorClass: ac,
    initiative,
    isNpc: false
  })
}
