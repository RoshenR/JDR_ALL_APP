'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  description: string | null
  category: ItemCategory | null
  rarity: ItemRarity | null
  weight: number | null
  value: number | null
  characterId: string
  createdAt: Date
  updatedAt: Date
}

async function canAccessCharacter(characterId: string): Promise<{ canRead: boolean; canWrite: boolean }> {
  const user = await getCurrentUser()
  if (!user) return { canRead: false, canWrite: false }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true }
  })

  if (!character) return { canRead: false, canWrite: false }

  const isOwner = character.ownerId === user.id
  const isMJ = user.role === 'MJ'

  return {
    canRead: isOwner || isMJ,
    canWrite: isOwner
  }
}

async function canAccessItem(itemId: string): Promise<{ canRead: boolean; canWrite: boolean; characterId: string | null }> {
  const user = await getCurrentUser()
  if (!user) return { canRead: false, canWrite: false, characterId: null }

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: { character: { select: { ownerId: true } } }
  })

  if (!item) return { canRead: false, canWrite: false, characterId: null }

  const isOwner = item.character.ownerId === user.id
  const isMJ = user.role === 'MJ'

  return {
    canRead: isOwner || isMJ,
    canWrite: isOwner,
    characterId: item.characterId
  }
}

export async function getInventory(characterId: string): Promise<InventoryItem[]> {
  const access = await canAccessCharacter(characterId)
  if (!access.canRead) {
    throw new Error('Non autorisé')
  }

  const items = await prisma.inventoryItem.findMany({
    where: { characterId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  })

  return items as InventoryItem[]
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const access = await canAccessItem(id)
  if (!access.canRead) {
    throw new Error('Non autorisé')
  }

  const item = await prisma.inventoryItem.findUnique({
    where: { id }
  })

  return item as InventoryItem | null
}

export async function createInventoryItem(
  characterId: string,
  data: {
    name: string
    quantity?: number
    description?: string
    category?: ItemCategory
    rarity?: ItemRarity
    weight?: number
    value?: number
  }
): Promise<InventoryItem> {
  const access = await canAccessCharacter(characterId)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const item = await prisma.inventoryItem.create({
    data: {
      name: data.name,
      quantity: data.quantity ?? 1,
      description: data.description || null,
      category: data.category || null,
      rarity: data.rarity || null,
      weight: data.weight ?? null,
      value: data.value ?? null,
      characterId
    }
  })

  revalidatePath(`/characters/${characterId}`)
  return item as InventoryItem
}

export async function updateInventoryItem(
  id: string,
  data: {
    name?: string
    quantity?: number
    description?: string | null
    category?: ItemCategory | null
    rarity?: ItemRarity | null
    weight?: number | null
    value?: number | null
  }
): Promise<InventoryItem> {
  const access = await canAccessItem(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.quantity !== undefined) updateData.quantity = data.quantity
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.rarity !== undefined) updateData.rarity = data.rarity
  if (data.weight !== undefined) updateData.weight = data.weight
  if (data.value !== undefined) updateData.value = data.value

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: updateData
  })

  revalidatePath(`/characters/${access.characterId}`)
  return item as InventoryItem
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const access = await canAccessItem(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  await prisma.inventoryItem.delete({ where: { id } })
  revalidatePath(`/characters/${access.characterId}`)
}

export async function updateItemQuantity(id: string, delta: number): Promise<InventoryItem> {
  const access = await canAccessItem(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id } })
  if (!item) throw new Error('Objet non trouvé')

  const newQuantity = Math.max(0, item.quantity + delta)

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: newQuantity }
  })

  revalidatePath(`/characters/${access.characterId}`)
  return updated as InventoryItem
}
