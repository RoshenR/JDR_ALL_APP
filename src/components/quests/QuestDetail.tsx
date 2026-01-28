'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  updateQuestStatus,
  toggleQuestObjective,
  deleteQuest
} from '@/lib/actions/quests'
import type { QuestRecord } from '@/lib/quest-utils'
import {
  MapPin,
  User,
  CheckCircle2,
  Circle,
  Star,
  Skull,
  Swords,
  Map,
  Search,
  Package,
  Users,
  Coins,
  Sparkles,
  Trash2,
  Play,
  Pause,
  Check,
  X,
  Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuestDetailProps {
  quest: QuestRecord
  campaignId: string
  isMJ?: boolean
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-500', icon: Circle },
  active: { label: 'Active', color: 'bg-green-500', icon: Star },
  completed: { label: 'Terminée', color: 'bg-blue-500', icon: CheckCircle2 },
  failed: { label: 'Échouée', color: 'bg-red-500', icon: Skull }
}

const difficultyConfig = {
  easy: { label: 'Facile', color: 'text-green-600 bg-green-500/10' },
  medium: { label: 'Moyen', color: 'text-amber-600 bg-amber-500/10' },
  hard: { label: 'Difficile', color: 'text-orange-600 bg-orange-500/10' },
  deadly: { label: 'Mortel', color: 'text-red-600 bg-red-500/10' }
}

const typeConfig: Record<string, { label: string; icon: typeof Swords }> = {
  fetch: { label: 'Récupération', icon: Package },
  escort: { label: 'Escorte', icon: Users },
  kill: { label: 'Élimination', icon: Swords },
  explore: { label: 'Exploration', icon: Map },
  mystery: { label: 'Enquête', icon: Search }
}

export function QuestDetail({ quest, campaignId, isMJ = false }: QuestDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [localQuest, setLocalQuest] = useState(quest)

  const status = statusConfig[localQuest.status]
  const difficulty = difficultyConfig[localQuest.difficulty]
  const typeInfo = localQuest.questType ? typeConfig[localQuest.questType] : null
  const TypeIcon = typeInfo?.icon || Star

  const completedObjectives = localQuest.objectives.filter(o => o.isCompleted).length
  const totalObjectives = localQuest.objectives.length
  const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'completed' | 'failed') => {
    startTransition(async () => {
      const updated = await updateQuestStatus(quest.id, newStatus)
      setLocalQuest(updated)
    })
  }

  const handleToggleObjective = (objectiveId: string, isCompleted: boolean) => {
    startTransition(async () => {
      const updated = await toggleQuestObjective(quest.id, objectiveId, isCompleted)
      setLocalQuest(updated)
    })
  }

  const handleDelete = () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette quête ?')) return

    startTransition(async () => {
      await deleteQuest(quest.id)
      router.push(`/campaigns/${campaignId}/quests`)
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn('p-3 rounded-lg', difficulty.color)}>
                <TypeIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{localQuest.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={cn(status.color, 'text-white')}>
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className={difficulty.color}>
                    {difficulty.label}
                  </Badge>
                  {typeInfo && (
                    <Badge variant="outline">
                      {typeInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isMJ && (
              <div className="flex flex-wrap gap-2">
                {localQuest.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    disabled={isPending}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Activer
                  </Button>
                )}
                {localQuest.status === 'active' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange('completed')}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Terminer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange('failed')}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Échouer
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base whitespace-pre-wrap">
            {localQuest.description}
          </CardDescription>

          {/* Métadonnées */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t">
            {localQuest.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{localQuest.location}</span>
              </div>
            )}
            {localQuest.npcGiver && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{localQuest.npcGiver}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objectifs */}
      {totalObjectives > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Objectifs</CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedObjectives}/{totalObjectives} complétés
              </span>
            </div>
            {/* Barre de progression */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className={cn(
                  'h-full transition-all',
                  progress === 100 ? 'bg-green-500' : 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {localQuest.objectives.map((objective) => (
                <li
                  key={objective.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    objective.isCompleted && 'bg-green-500/5 border-green-500/20'
                  )}
                >
                  {isMJ ? (
                    <button
                      onClick={() => handleToggleObjective(objective.id, !objective.isCompleted)}
                      disabled={isPending}
                      className="mt-0.5 shrink-0"
                    >
                      {objective.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                  ) : (
                    <span className="mt-0.5 shrink-0">
                      {objective.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </span>
                  )}
                  <div className="flex-1">
                    <span className={cn(
                      objective.isCompleted && 'line-through text-muted-foreground'
                    )}>
                      {objective.description}
                    </span>
                    {objective.isOptional && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Optionnel
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Récompenses */}
      {(localQuest.rewards.gold || localQuest.rewards.xp || localQuest.rewards.items?.length || localQuest.rewards.other) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Récompenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {localQuest.rewards.gold && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
                  <Coins className="h-6 w-6 text-amber-600" />
                  <div>
                    <div className="font-semibold">{localQuest.rewards.gold} pièces d'or</div>
                    <div className="text-sm text-muted-foreground">Or</div>
                  </div>
                </div>
              )}
              {localQuest.rewards.xp && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-semibold">{localQuest.rewards.xp} XP</div>
                    <div className="text-sm text-muted-foreground">Expérience</div>
                  </div>
                </div>
              )}
              {localQuest.rewards.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">{item.quantity}x {item.name}</div>
                    <div className="text-sm text-muted-foreground">Objet</div>
                  </div>
                </div>
              ))}
            </div>
            {localQuest.rewards.other && (
              <div className="mt-4 p-3 rounded-lg bg-muted">
                <div className="text-sm font-medium mb-1">Autres récompenses</div>
                <p className="text-sm text-muted-foreground">{localQuest.rewards.other}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default QuestDetail
