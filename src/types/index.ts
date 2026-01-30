export interface CharacterAttributes {
  [key: string]: number | string
}

export interface CharacterSkills {
  [key: string]: number | string
}

export interface Character {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  attributes: CharacterAttributes
  skills: CharacterSkills | null
  notes: string | null
  campaignId: string | null
  campaign?: Campaign | null
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  system: string | null
  characters?: Character[]
  sessions?: Session[]
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  number: number
  title: string
  date: Date | null
  summary: string | null
  notes: string | null
  campaignId: string
  campaign?: Campaign
  availabilities?: SessionAvailability[]
  createdAt: Date
  updatedAt: Date
}

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE' | 'NO_RESPONSE'

export interface SessionAvailability {
  id: string
  status: AvailabilityStatus
  sessionId: string
  userId: string
  user?: { id: string; name: string }
  createdAt: Date
  updatedAt: Date
}

export type WikiCategory = 'locations' | 'npcs' | 'items' | 'lore'

export interface WikiArticle {
  id: string
  title: string
  slug: string
  content: string
  category: WikiCategory
  imageUrl: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export const WIKI_CATEGORIES: Record<WikiCategory, { label: string; description: string }> = {
  locations: { label: 'Lieux', description: 'Villes, donjons, régions...' },
  npcs: { label: 'PNJ', description: 'Personnages non-joueurs' },
  items: { label: 'Objets', description: 'Artefacts, équipements...' },
  lore: { label: 'Lore', description: 'Histoire, mythologie...' }
}
