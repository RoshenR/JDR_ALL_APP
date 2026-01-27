'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

async function requireMJ() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')
  if (user.role !== 'MJ') throw new Error('Réservé au MJ')
  return user
}

export async function getCampaigns() {
  return prisma.campaign.findMany({
    include: {
      characters: true,
      sessions: { orderBy: { number: 'desc' }, take: 1 }
    },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      characters: true,
      sessions: { orderBy: { number: 'asc' } }
    }
  })
}

export async function createCampaign(data: {
  name: string
  description?: string
  imageUrl?: string
  system?: string
}) {
  await requireMJ()

  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      system: data.system || null
    }
  })
  revalidatePath('/campaigns')
  return campaign
}

export async function updateCampaign(id: string, data: {
  name?: string
  description?: string
  imageUrl?: string
  system?: string
}) {
  await requireMJ()

  const campaign = await prisma.campaign.update({
    where: { id },
    data
  })
  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  return campaign
}

export async function deleteCampaign(id: string) {
  await requireMJ()
  await prisma.campaign.delete({ where: { id } })
  revalidatePath('/campaigns')
}

// Sessions
export async function getSession(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: { campaign: true }
  })
}

export async function createSession(data: {
  campaignId: string
  title: string
  date?: string
  summary?: string
  notes?: string
}) {
  await requireMJ()

  const lastSession = await prisma.session.findFirst({
    where: { campaignId: data.campaignId },
    orderBy: { number: 'desc' }
  })
  const number = (lastSession?.number || 0) + 1

  const session = await prisma.session.create({
    data: {
      campaignId: data.campaignId,
      number,
      title: data.title,
      date: data.date ? new Date(data.date) : null,
      summary: data.summary || null,
      notes: data.notes || null
    }
  })
  revalidatePath(`/campaigns/${data.campaignId}`)
  return session
}

export async function updateSession(id: string, data: {
  title?: string
  date?: string | null
  summary?: string
  notes?: string
}) {
  await requireMJ()

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null
  if (data.summary !== undefined) updateData.summary = data.summary
  if (data.notes !== undefined) updateData.notes = data.notes

  const session = await prisma.session.update({
    where: { id },
    data: updateData,
    include: { campaign: true }
  })
  revalidatePath(`/campaigns/${session.campaignId}`)
  revalidatePath(`/campaigns/${session.campaignId}/sessions/${id}`)
  return session
}

export async function deleteSession(id: string) {
  await requireMJ()
  const session = await prisma.session.delete({ where: { id } })
  revalidatePath(`/campaigns/${session.campaignId}`)
}
