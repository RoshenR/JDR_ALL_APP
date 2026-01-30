'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE' | 'NO_RESPONSE'

export async function updateAvailability(sessionId: string, status: AvailabilityStatus) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifie')

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { campaignId: true }
  })
  if (!session) throw new Error('Session non trouvee')

  const availability = await prisma.sessionAvailability.upsert({
    where: {
      sessionId_userId: {
        sessionId,
        userId: user.id
      }
    },
    update: { status },
    create: {
      sessionId,
      userId: user.id,
      status
    }
  })

  revalidatePath(`/campaigns/${session.campaignId}`)
  revalidatePath(`/campaigns/${session.campaignId}/sessions/${sessionId}`)
  return availability
}

export async function getSessionAvailabilities(sessionId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifie')

  const availabilities = await prisma.sessionAvailability.findMany({
    where: { sessionId },
    include: {
      user: {
        select: { id: true, name: true }
      }
    }
  })

  return availabilities
}

export async function getMyAvailability(sessionId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const availability = await prisma.sessionAvailability.findUnique({
    where: {
      sessionId_userId: {
        sessionId,
        userId: user.id
      }
    }
  })

  return availability
}

export async function getCampaignPlayersWithAvailability(campaignId: string, sessionId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifie')

  // Get all players who have characters in this campaign
  const campaignPlayers = await prisma.user.findMany({
    where: {
      characters: {
        some: { campaignId }
      }
    },
    select: {
      id: true,
      name: true,
      availabilities: {
        where: { sessionId }
      }
    }
  })

  return campaignPlayers.map(player => ({
    id: player.id,
    name: player.name,
    status: player.availabilities[0]?.status || 'NO_RESPONSE'
  }))
}

export async function getMyAvailabilitiesForSessions(sessionIds: string[]) {
  const user = await getCurrentUser()
  if (!user) return {}

  const availabilities = await prisma.sessionAvailability.findMany({
    where: {
      sessionId: { in: sessionIds },
      userId: user.id
    }
  })

  const result: Record<string, AvailabilityStatus> = {}
  for (const av of availabilities) {
    result[av.sessionId] = av.status as AvailabilityStatus
  }
  return result
}

export async function getAvailabilitySummaryForSessions(sessionIds: string[], campaignId: string) {
  // Get total player count for this campaign
  const playerCount = await prisma.user.count({
    where: {
      characters: {
        some: { campaignId }
      }
    }
  })

  // Get availability counts per session
  const availabilities = await prisma.sessionAvailability.groupBy({
    by: ['sessionId', 'status'],
    where: {
      sessionId: { in: sessionIds }
    },
    _count: true
  })

  const result: Record<string, { available: number; maybe: number; unavailable: number; total: number }> = {}

  for (const sessionId of sessionIds) {
    result[sessionId] = { available: 0, maybe: 0, unavailable: 0, total: playerCount }
  }

  for (const av of availabilities) {
    if (!result[av.sessionId]) continue
    if (av.status === 'AVAILABLE') result[av.sessionId].available = av._count
    else if (av.status === 'MAYBE') result[av.sessionId].maybe = av._count
    else if (av.status === 'UNAVAILABLE') result[av.sessionId].unavailable = av._count
  }

  return result
}
