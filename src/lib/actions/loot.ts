'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export interface ItemTemplate {
  id: string
  name: string
  description: string | null
  category: ItemCategory
  rarity: ItemRarity
  weight: number | null
  minValue: number
  maxValue: number
  properties: Record<string, unknown>
  tags: string[]
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface LootTable {
  id: string
  name: string
  description: string | null
  minRarity: ItemRarity
  maxRarity: ItemRarity
  campaignId: string | null
  entries: LootTableEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface LootTableEntry {
  id: string
  weight: number
  itemTemplateId: string
  itemTemplate?: ItemTemplate
}

export interface GeneratedLoot {
  template: ItemTemplate
  quantity: number
  value: number // Valeur générée entre min et max
}

// ============ HELPERS ============

async function requireMJ() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')
  if (user.role !== 'MJ') throw new Error('Réservé au MJ')
  return user
}

function parseTemplate(t: {
  id: string
  name: string
  description: string | null
  category: string
  rarity: string
  weight: number | null
  minValue: number
  maxValue: number
  properties: string
  tags: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}): ItemTemplate {
  return {
    ...t,
    category: t.category as ItemCategory,
    rarity: t.rarity as ItemRarity,
    properties: JSON.parse(t.properties),
    tags: JSON.parse(t.tags)
  }
}

function isRarityInRange(rarity: ItemRarity, min: ItemRarity, max: ItemRarity): boolean {
  const rarityIndex = RARITY_ORDER.indexOf(rarity)
  const minIndex = RARITY_ORDER.indexOf(min)
  const maxIndex = RARITY_ORDER.indexOf(max)
  return rarityIndex >= minIndex && rarityIndex <= maxIndex
}

// ============ ITEM TEMPLATES ============

export async function getItemTemplates(filters?: {
  category?: ItemCategory
  rarity?: ItemRarity
  search?: string
}): Promise<ItemTemplate[]> {
  await requireMJ()

  const where: Record<string, unknown> = {}
  if (filters?.category) where.category = filters.category
  if (filters?.rarity) where.rarity = filters.rarity
  if (filters?.search) {
    where.name = { contains: filters.search }
  }

  const templates = await prisma.itemTemplate.findMany({
    where,
    orderBy: [{ rarity: 'asc' }, { name: 'asc' }]
  })

  return templates.map(parseTemplate)
}

export async function getItemTemplate(id: string): Promise<ItemTemplate | null> {
  await requireMJ()

  const template = await prisma.itemTemplate.findUnique({ where: { id } })
  return template ? parseTemplate(template) : null
}

export async function createItemTemplate(data: {
  name: string
  description?: string
  category: ItemCategory
  rarity: ItemRarity
  weight?: number
  minValue?: number
  maxValue?: number
  properties?: Record<string, unknown>
  tags?: string[]
  imageUrl?: string
}): Promise<ItemTemplate> {
  await requireMJ()

  const template = await prisma.itemTemplate.create({
    data: {
      name: data.name,
      description: data.description || null,
      category: data.category,
      rarity: data.rarity,
      weight: data.weight ?? null,
      minValue: data.minValue ?? 0,
      maxValue: data.maxValue ?? data.minValue ?? 0,
      properties: JSON.stringify(data.properties || {}),
      tags: JSON.stringify(data.tags || []),
      imageUrl: data.imageUrl || null
    }
  })

  revalidatePath('/loot')
  return parseTemplate(template)
}

export async function updateItemTemplate(id: string, data: {
  name?: string
  description?: string | null
  category?: ItemCategory
  rarity?: ItemRarity
  weight?: number | null
  minValue?: number
  maxValue?: number
  properties?: Record<string, unknown>
  tags?: string[]
  imageUrl?: string | null
}): Promise<ItemTemplate> {
  await requireMJ()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.rarity !== undefined) updateData.rarity = data.rarity
  if (data.weight !== undefined) updateData.weight = data.weight
  if (data.minValue !== undefined) updateData.minValue = data.minValue
  if (data.maxValue !== undefined) updateData.maxValue = data.maxValue
  if (data.properties !== undefined) updateData.properties = JSON.stringify(data.properties)
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl

  const template = await prisma.itemTemplate.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/loot')
  return parseTemplate(template)
}

export async function deleteItemTemplate(id: string): Promise<void> {
  await requireMJ()
  await prisma.itemTemplate.delete({ where: { id } })
  revalidatePath('/loot')
}

// ============ LOOT TABLES ============

export async function getLootTables(): Promise<LootTable[]> {
  await requireMJ()

  const tables = await prisma.lootTable.findMany({
    include: {
      entries: {
        include: { itemTemplate: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return tables.map(t => ({
    ...t,
    minRarity: t.minRarity as ItemRarity,
    maxRarity: t.maxRarity as ItemRarity,
    entries: t.entries.map(e => ({
      ...e,
      itemTemplate: parseTemplate(e.itemTemplate)
    }))
  }))
}

export async function getLootTable(id: string): Promise<LootTable | null> {
  await requireMJ()

  const table = await prisma.lootTable.findUnique({
    where: { id },
    include: {
      entries: {
        include: { itemTemplate: true }
      }
    }
  })

  if (!table) return null

  return {
    ...table,
    minRarity: table.minRarity as ItemRarity,
    maxRarity: table.maxRarity as ItemRarity,
    entries: table.entries.map(e => ({
      ...e,
      itemTemplate: parseTemplate(e.itemTemplate)
    }))
  }
}

export async function createLootTable(data: {
  name: string
  description?: string
  minRarity?: ItemRarity
  maxRarity?: ItemRarity
  campaignId?: string
}): Promise<LootTable> {
  await requireMJ()

  const table = await prisma.lootTable.create({
    data: {
      name: data.name,
      description: data.description || null,
      minRarity: data.minRarity || 'common',
      maxRarity: data.maxRarity || 'legendary',
      campaignId: data.campaignId || null
    },
    include: { entries: true }
  })

  revalidatePath('/loot')
  return {
    ...table,
    minRarity: table.minRarity as ItemRarity,
    maxRarity: table.maxRarity as ItemRarity,
    entries: []
  }
}

export async function updateLootTable(id: string, data: {
  name?: string
  description?: string | null
  minRarity?: ItemRarity
  maxRarity?: ItemRarity
}): Promise<void> {
  await requireMJ()

  await prisma.lootTable.update({
    where: { id },
    data
  })

  revalidatePath('/loot')
}

export async function deleteLootTable(id: string): Promise<void> {
  await requireMJ()
  await prisma.lootTable.delete({ where: { id } })
  revalidatePath('/loot')
}

export async function addItemToLootTable(tableId: string, itemTemplateId: string, weight: number = 100): Promise<void> {
  await requireMJ()

  await prisma.lootTableEntry.create({
    data: {
      lootTableId: tableId,
      itemTemplateId,
      weight
    }
  })

  revalidatePath('/loot')
}

export async function removeItemFromLootTable(entryId: string): Promise<void> {
  await requireMJ()
  await prisma.lootTableEntry.delete({ where: { id: entryId } })
  revalidatePath('/loot')
}

export async function updateLootTableEntry(entryId: string, weight: number): Promise<void> {
  await requireMJ()
  await prisma.lootTableEntry.update({
    where: { id: entryId },
    data: { weight }
  })
  revalidatePath('/loot')
}

// ============ LOOT GENERATION ============

export interface GenerateLootOptions {
  tableId?: string // Utiliser une table spécifique
  count?: number // Nombre d'objets à générer (défaut: 1)
  minRarity?: ItemRarity
  maxRarity?: ItemRarity
  categories?: ItemCategory[] // Filtrer par catégories
  maxTotalValue?: number // Valeur totale maximum
  allowDuplicates?: boolean // Autoriser les doublons
}

export async function generateLoot(options: GenerateLootOptions = {}): Promise<GeneratedLoot[]> {
  await requireMJ()

  const {
    tableId,
    count = 1,
    minRarity = 'common',
    maxRarity = 'legendary',
    categories,
    maxTotalValue,
    allowDuplicates = true
  } = options

  let candidates: { template: ItemTemplate; weight: number }[] = []

  if (tableId) {
    // Utiliser une table de loot
    const table = await getLootTable(tableId)
    if (!table) throw new Error('Table de loot non trouvée')

    candidates = table.entries
      .filter(e => e.itemTemplate && isRarityInRange(e.itemTemplate.rarity, minRarity, maxRarity))
      .filter(e => !categories || categories.includes(e.itemTemplate!.category))
      .map(e => ({ template: e.itemTemplate!, weight: e.weight }))
  } else {
    // Utiliser tous les templates
    const templates = await getItemTemplates()
    candidates = templates
      .filter(t => isRarityInRange(t.rarity, minRarity, maxRarity))
      .filter(t => !categories || categories.includes(t.category))
      .map(t => ({
        template: t,
        // Poids basé sur la rareté (items communs plus fréquents)
        weight: Math.pow(2, RARITY_ORDER.length - RARITY_ORDER.indexOf(t.rarity))
      }))
  }

  if (candidates.length === 0) {
    return []
  }

  const results: GeneratedLoot[] = []
  const usedIds = new Set<string>()
  let totalValue = 0

  for (let i = 0; i < count; i++) {
    // Filtrer les candidats déjà utilisés si pas de doublons
    let availableCandidates = allowDuplicates
      ? candidates
      : candidates.filter(c => !usedIds.has(c.template.id))

    if (availableCandidates.length === 0) break

    // Sélection pondérée
    const totalWeight = availableCandidates.reduce((sum, c) => sum + c.weight, 0)
    let random = Math.random() * totalWeight
    let selected: typeof candidates[0] | null = null

    for (const candidate of availableCandidates) {
      random -= candidate.weight
      if (random <= 0) {
        selected = candidate
        break
      }
    }

    if (!selected) selected = availableCandidates[availableCandidates.length - 1]

    // Générer la valeur
    const value = selected.template.minValue === selected.template.maxValue
      ? selected.template.minValue
      : Math.floor(
          Math.random() * (selected.template.maxValue - selected.template.minValue + 1) +
          selected.template.minValue
        )

    // Vérifier la limite de valeur totale
    if (maxTotalValue && totalValue + value > maxTotalValue) {
      continue // Passer cet objet s'il dépasse le budget
    }

    results.push({
      template: selected.template,
      quantity: 1,
      value
    })

    usedIds.add(selected.template.id)
    totalValue += value
  }

  return results
}

// ============ LOOT SETTINGS ============

export interface LootSettings {
  id: string
  minRarity: ItemRarity
  maxRarity: ItemRarity
  maxItemValue: number
  maxTotalValue: number
  allowedCategories: ItemCategory[]
  bannedItemIds: string[]
  campaignId: string
}

export async function getLootSettings(campaignId: string): Promise<LootSettings | null> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'MJ') return null

  const settings = await prisma.lootGenerationSettings.findUnique({
    where: { campaignId }
  })

  if (!settings) return null

  return {
    ...settings,
    minRarity: settings.minRarity as ItemRarity,
    maxRarity: settings.maxRarity as ItemRarity,
    allowedCategories: JSON.parse(settings.allowedCategories) as ItemCategory[],
    bannedItemIds: JSON.parse(settings.bannedItemIds) as string[]
  }
}

export async function saveLootSettings(
  campaignId: string,
  data: Omit<LootSettings, 'id' | 'campaignId'>
): Promise<LootSettings> {
  await requireMJ()

  const settings = await prisma.lootGenerationSettings.upsert({
    where: { campaignId },
    create: {
      campaignId,
      minRarity: data.minRarity,
      maxRarity: data.maxRarity,
      maxItemValue: data.maxItemValue,
      maxTotalValue: data.maxTotalValue,
      allowedCategories: JSON.stringify(data.allowedCategories),
      bannedItemIds: JSON.stringify(data.bannedItemIds)
    },
    update: {
      minRarity: data.minRarity,
      maxRarity: data.maxRarity,
      maxItemValue: data.maxItemValue,
      maxTotalValue: data.maxTotalValue,
      allowedCategories: JSON.stringify(data.allowedCategories),
      bannedItemIds: JSON.stringify(data.bannedItemIds)
    }
  })

  revalidatePath(`/campaigns/${campaignId}/loot`)
  return {
    ...settings,
    minRarity: settings.minRarity as ItemRarity,
    maxRarity: settings.maxRarity as ItemRarity,
    allowedCategories: JSON.parse(settings.allowedCategories) as ItemCategory[],
    bannedItemIds: JSON.parse(settings.bannedItemIds) as string[]
  }
}

// ============ PENDING LOOT ============

export type PendingLootStatus = 'pending' | 'approved' | 'rejected' | 'distributed'

export interface PendingLootItem {
  templateId: string
  name: string
  description: string | null
  category: ItemCategory
  rarity: ItemRarity
  value: number
  quantity: number
}

export interface PendingLootRecord {
  id: string
  items: PendingLootItem[]
  source: string | null
  status: PendingLootStatus
  notes: string | null
  campaignId: string
  createdAt: Date
  updatedAt: Date
}

export async function createPendingLoot(data: {
  campaignId: string
  items: PendingLootItem[]
  source?: string
  notes?: string
}): Promise<PendingLootRecord> {
  await requireMJ()

  const pending = await prisma.pendingLoot.create({
    data: {
      campaignId: data.campaignId,
      items: JSON.stringify(data.items),
      source: data.source || null,
      notes: data.notes || null,
      status: 'pending'
    }
  })

  revalidatePath(`/campaigns/${data.campaignId}/loot`)
  return {
    ...pending,
    items: data.items,
    status: pending.status as PendingLootStatus
  }
}

export async function getPendingLoot(campaignId: string): Promise<PendingLootRecord[]> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'MJ') return []

  const pendingList = await prisma.pendingLoot.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' }
  })

  return pendingList.map(p => ({
    ...p,
    items: JSON.parse(p.items) as PendingLootItem[],
    status: p.status as PendingLootStatus
  }))
}

export async function updatePendingLootStatus(
  id: string,
  status: PendingLootStatus,
  notes?: string
): Promise<PendingLootRecord> {
  await requireMJ()

  const pending = await prisma.pendingLoot.update({
    where: { id },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined
    }
  })

  revalidatePath(`/campaigns/${pending.campaignId}/loot`)
  return {
    ...pending,
    items: JSON.parse(pending.items) as PendingLootItem[],
    status: pending.status as PendingLootStatus
  }
}

export async function deletePendingLoot(id: string): Promise<void> {
  await requireMJ()

  const pending = await prisma.pendingLoot.findUnique({
    where: { id },
    select: { campaignId: true }
  })

  if (!pending) return

  await prisma.pendingLoot.delete({ where: { id } })
  revalidatePath(`/campaigns/${pending.campaignId}/loot`)
}

// ============ GÉNÉRATION AVEC CONTRAINTES ============

export async function generateLootWithConstraints(
  campaignId: string,
  options: {
    count?: number
    source?: string
  } = {}
): Promise<PendingLootRecord> {
  await requireMJ()

  // Récupérer les settings de la campagne
  const settings = await getLootSettings(campaignId)

  // Options par défaut si pas de settings
  const generateOptions: GenerateLootOptions = {
    count: options.count || 3,
    minRarity: settings?.minRarity || 'common',
    maxRarity: settings?.maxRarity || 'rare',
    maxTotalValue: settings?.maxTotalValue || 5000,
    categories: settings?.allowedCategories.length
      ? settings.allowedCategories
      : undefined,
    allowDuplicates: false
  }

  // Générer le loot
  const generated = await generateLoot(generateOptions)

  // Filtrer les items bannis
  const filteredItems = settings?.bannedItemIds.length
    ? generated.filter(g => !settings.bannedItemIds.includes(g.template.id))
    : generated

  // Filtrer par valeur max d'item
  const finalItems = settings?.maxItemValue
    ? filteredItems.filter(g => g.value <= settings.maxItemValue)
    : filteredItems

  // Convertir en format PendingLootItem
  const pendingItems: PendingLootItem[] = finalItems.map(g => ({
    templateId: g.template.id,
    name: g.template.name,
    description: g.template.description,
    category: g.template.category,
    rarity: g.template.rarity,
    value: g.value,
    quantity: g.quantity
  }))

  // Créer le pending loot
  return createPendingLoot({
    campaignId,
    items: pendingItems,
    source: options.source
  })
}

// ============ DISTRIBUTION ============

export async function distributeLootToCharacter(
  pendingLootId: string,
  characterId: string,
  itemIndices: number[]
): Promise<void> {
  await requireMJ()

  const pending = await prisma.pendingLoot.findUnique({
    where: { id: pendingLootId }
  })

  if (!pending || pending.status !== 'approved') {
    throw new Error('Loot non approuvé ou non trouvé')
  }

  const items = JSON.parse(pending.items) as PendingLootItem[]

  // Distribuer les items sélectionnés
  for (const index of itemIndices) {
    const item = items[index]
    if (!item) continue

    await giveItemToCharacter(characterId, {
      name: item.name,
      description: item.description || undefined,
      category: item.category,
      rarity: item.rarity,
      value: item.value,
      quantity: item.quantity
    })
  }

  // Marquer les items comme distribués (on retire ceux distribués)
  const remainingItems = items.filter((_, i) => !itemIndices.includes(i))

  if (remainingItems.length === 0) {
    // Tout a été distribué
    await prisma.pendingLoot.update({
      where: { id: pendingLootId },
      data: { status: 'distributed', items: '[]' }
    })
  } else {
    // Il reste des items
    await prisma.pendingLoot.update({
      where: { id: pendingLootId },
      data: { items: JSON.stringify(remainingItems) }
    })
  }

  revalidatePath(`/campaigns/${pending.campaignId}/loot`)
  revalidatePath(`/characters/${characterId}`)
}

// ============ ATTRIBUTION ============

export async function giveItemToCharacter(
  characterId: string,
  item: {
    name: string
    description?: string
    category: ItemCategory
    rarity: ItemRarity
    weight?: number
    value: number
    quantity?: number
  }
): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')

  // Vérifier que le personnage existe
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { id: true, ownerId: true }
  })

  if (!character) throw new Error('Personnage non trouvé')

  // Seul le MJ ou le propriétaire peut donner des objets
  if (user.role !== 'MJ' && character.ownerId !== user.id) {
    throw new Error('Non autorisé')
  }

  await prisma.inventoryItem.create({
    data: {
      name: item.name,
      description: item.description || null,
      category: item.category,
      rarity: item.rarity,
      weight: item.weight ?? null,
      value: item.value,
      quantity: item.quantity ?? 1,
      characterId
    }
  })

  revalidatePath(`/characters/${characterId}`)
}
