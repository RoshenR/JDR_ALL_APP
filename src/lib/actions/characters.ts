'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

export async function getCharacters() {
  const characters = await prisma.character.findMany({
    include: { campaign: true, owner: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'desc' }
  })
  return characters.map(c => ({
    ...c,
    attributes: JSON.parse(c.attributes),
    skills: c.skills ? JSON.parse(c.skills) : null
  }))
}

export async function getCharacter(id: string) {
  const character = await prisma.character.findUnique({
    where: { id },
    include: { campaign: true, owner: { select: { id: true, name: true } } }
  })
  if (!character) return null
  return {
    ...character,
    attributes: JSON.parse(character.attributes),
    skills: character.skills ? JSON.parse(character.skills) : null
  }
}

export async function createCharacter(data: {
  name: string
  description?: string
  imageUrl?: string
  attributes?: Record<string, unknown>
  skills?: Record<string, unknown>
  notes?: string
  campaignId?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  const character = await prisma.character.create({
    data: {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      attributes: JSON.stringify(data.attributes || {}),
      skills: data.skills ? JSON.stringify(data.skills) : null,
      notes: data.notes || null,
      campaignId: data.campaignId || null,
      ownerId: user.id
    }
  })
  revalidatePath('/characters')
  return character
}

export async function updateCharacter(id: string, data: {
  name?: string
  description?: string
  imageUrl?: string
  attributes?: Record<string, unknown>
  skills?: Record<string, unknown>
  notes?: string
  campaignId?: string | null
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  // Check ownership (MJ can edit all)
  const character = await prisma.character.findUnique({ where: { id } })
  if (!character) throw new Error('Personnage non trouvé')
  if (user.role !== 'MJ' && character.ownerId !== user.id) {
    throw new Error('Non autorisé')
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (data.attributes !== undefined) updateData.attributes = JSON.stringify(data.attributes)
  if (data.skills !== undefined) updateData.skills = data.skills ? JSON.stringify(data.skills) : null
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.campaignId !== undefined) updateData.campaignId = data.campaignId

  const updated = await prisma.character.update({
    where: { id },
    data: updateData
  })
  revalidatePath('/characters')
  revalidatePath(`/characters/${id}`)
  return updated
}

export async function deleteCharacter(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  // Check ownership (MJ can delete all)
  const character = await prisma.character.findUnique({ where: { id } })
  if (!character) throw new Error('Personnage non trouvé')
  if (user.role !== 'MJ' && character.ownerId !== user.id) {
    throw new Error('Non autorisé')
  }

  await prisma.character.delete({ where: { id } })
  revalidatePath('/characters')
}

export async function canEditCharacter(characterId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.role === 'MJ') return true

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true }
  })
  return character?.ownerId === user.id
}
