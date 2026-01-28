// Types et utilitaires pour les quêtes (non-server actions)

export type QuestStatus = 'draft' | 'active' | 'completed' | 'failed'
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'deadly'
export type QuestType = 'fetch' | 'escort' | 'kill' | 'explore' | 'mystery' | 'other'

export interface QuestObjective {
  id: string
  description: string
  isCompleted: boolean
  isOptional: boolean
}

export interface QuestRewards {
  gold?: number
  xp?: number
  items?: Array<{
    name: string
    quantity: number
  }>
  other?: string
}

export interface QuestRecord {
  id: string
  title: string
  description: string
  objectives: QuestObjective[]
  rewards: QuestRewards
  difficulty: QuestDifficulty
  status: QuestStatus
  questType: QuestType | null
  location: string | null
  npcGiver: string | null
  campaignId: string
  createdAt: Date
  updatedAt: Date
}

// Générer un ID unique pour les objectifs
export function generateObjectiveId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Templates de quêtes
export const QUEST_TEMPLATES: Array<{
  name: string
  type: QuestType
  description: string
  objectives: Omit<QuestObjective, 'id'>[]
}> = [
  {
    name: 'Mission de récupération',
    type: 'fetch',
    description: 'Récupérer un objet important et le ramener',
    objectives: [
      { description: 'Localiser l\'objet', isCompleted: false, isOptional: false },
      { description: 'Récupérer l\'objet', isCompleted: false, isOptional: false },
      { description: 'Ramener l\'objet au commanditaire', isCompleted: false, isOptional: false }
    ]
  },
  {
    name: 'Mission d\'escorte',
    type: 'escort',
    description: 'Escorter quelqu\'un en sécurité',
    objectives: [
      { description: 'Rencontrer le client', isCompleted: false, isOptional: false },
      { description: 'Escorter jusqu\'à destination', isCompleted: false, isOptional: false },
      { description: 'Assurer la sécurité pendant le trajet', isCompleted: false, isOptional: true }
    ]
  },
  {
    name: 'Mission d\'élimination',
    type: 'kill',
    description: 'Éliminer une menace',
    objectives: [
      { description: 'Localiser la cible', isCompleted: false, isOptional: false },
      { description: 'Éliminer la cible', isCompleted: false, isOptional: false },
      { description: 'Rapporter une preuve', isCompleted: false, isOptional: true }
    ]
  },
  {
    name: 'Mission d\'exploration',
    type: 'explore',
    description: 'Explorer un lieu inconnu',
    objectives: [
      { description: 'Trouver l\'entrée', isCompleted: false, isOptional: false },
      { description: 'Explorer les lieux', isCompleted: false, isOptional: false },
      { description: 'Cartographier la zone', isCompleted: false, isOptional: true },
      { description: 'Revenir faire son rapport', isCompleted: false, isOptional: false }
    ]
  },
  {
    name: 'Enquête mystérieuse',
    type: 'mystery',
    description: 'Résoudre un mystère',
    objectives: [
      { description: 'Rassembler les indices', isCompleted: false, isOptional: false },
      { description: 'Interroger les témoins', isCompleted: false, isOptional: true },
      { description: 'Identifier le coupable', isCompleted: false, isOptional: false },
      { description: 'Apporter des preuves', isCompleted: false, isOptional: false }
    ]
  }
]
