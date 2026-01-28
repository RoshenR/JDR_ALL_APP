'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestCardProps {
  quest: QuestRecord
  campaignId: string
  showActions?: boolean
  compact?: boolean
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

const typeIcons: Record<string, typeof Swords> = {
  fetch: Package,
  escort: Users,
  kill: Swords,
  explore: Map,
  mystery: Search
}

export function QuestCard({ quest, campaignId, showActions = true, compact = false }: QuestCardProps) {
  const status = statusConfig[quest.status]
  const difficulty = difficultyConfig[quest.difficulty]
  const TypeIcon = quest.questType ? typeIcons[quest.questType] || Star : Star

  const completedObjectives = quest.objectives.filter(o => o.isCompleted).length
  const totalObjectives = quest.objectives.length
  const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0

  if (compact) {
    return (
      <Link href={`/campaigns/${campaignId}/quests/${quest.id}`}>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  'p-2 rounded-lg shrink-0',
                  difficulty.color
                )}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{quest.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {completedObjectives}/{totalObjectives} objectifs
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className={cn('shrink-0', status.color, 'text-white')}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg mt-1',
              difficulty.color
            )}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{quest.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn(status.color, 'text-white')}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className={difficulty.color}>
                  {difficulty.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {quest.description}
        </p>

        {/* Métadonnées */}
        <div className="flex flex-wrap gap-4 text-sm">
          {quest.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {quest.location}
            </div>
          )}
          {quest.npcGiver && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="h-4 w-4" />
              {quest.npcGiver}
            </div>
          )}
        </div>

        {/* Progression */}
        {totalObjectives > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span className="text-muted-foreground">
                {completedObjectives}/{totalObjectives}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  progress === 100 ? 'bg-green-500' : 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Récompenses */}
        {(quest.rewards.gold || quest.rewards.xp || quest.rewards.items?.length) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {quest.rewards.gold && (
              <Badge variant="outline" className="bg-amber-500/10">
                {quest.rewards.gold} or
              </Badge>
            )}
            {quest.rewards.xp && (
              <Badge variant="outline" className="bg-purple-500/10">
                {quest.rewards.xp} XP
              </Badge>
            )}
            {quest.rewards.items?.map((item, i) => (
              <Badge key={i} variant="outline" className="bg-blue-500/10">
                {item.quantity}x {item.name}
              </Badge>
            ))}
          </div>
        )}

        {showActions && (
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/campaigns/${campaignId}/quests/${quest.id}`}>
                Voir les détails
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestCard
