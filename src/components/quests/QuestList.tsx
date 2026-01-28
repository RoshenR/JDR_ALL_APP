'use client'

import { useState } from 'react'
import { QuestCard } from './QuestCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { QuestRecord, QuestStatus } from '@/lib/quest-utils'
import { Scroll, Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuestListProps {
  quests: QuestRecord[]
  campaignId: string
  isMJ?: boolean
}

const statusFilters: Array<{ value: QuestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'Actives' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'completed', label: 'Terminées' },
  { value: 'failed', label: 'Échouées' }
]

export function QuestList({ quests, campaignId, isMJ = false }: QuestListProps) {
  const [filter, setFilter] = useState<QuestStatus | 'all'>('all')

  const filteredQuests = filter === 'all'
    ? quests
    : quests.filter(q => q.status === filter)

  // Grouper par statut pour l'affichage
  const activeQuests = filteredQuests.filter(q => q.status === 'active')
  const draftQuests = filteredQuests.filter(q => q.status === 'draft')
  const completedQuests = filteredQuests.filter(q => q.status === 'completed' || q.status === 'failed')

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" />
              Quêtes ({filteredQuests.length})
            </CardTitle>
            {isMJ && (
              <Button asChild>
                <Link href={`/campaigns/${campaignId}/quests/new`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nouvelle quête
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(f => {
              // Ne pas montrer les brouillons aux joueurs
              if (!isMJ && f.value === 'draft') return null

              return (
                <Button
                  key={f.value}
                  variant={filter === f.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des quêtes */}
      {filteredQuests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scroll className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Aucune quête trouvée</p>
            {isMJ && (
              <Button asChild variant="outline" className="mt-4">
                <Link href={`/campaigns/${campaignId}/quests/new`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Créer une quête
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quêtes actives */}
          {activeQuests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Quêtes en cours
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    campaignId={campaignId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Brouillons (MJ uniquement) */}
          {isMJ && draftQuests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Brouillons
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {draftQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    campaignId={campaignId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quêtes terminées */}
          {completedQuests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Historique
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {completedQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    campaignId={campaignId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuestList
