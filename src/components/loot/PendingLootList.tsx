'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LootApprovalDialog } from './LootApprovalDialog'
import type { PendingLootRecord } from '@/lib/actions/loot'
import { Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingLootListProps {
  pendingLoot: PendingLootRecord[]
  campaignId: string
  characters: Array<{ id: string; name: string }>
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-600 bg-gray-100',
  uncommon: 'text-green-600 bg-green-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-amber-600 bg-amber-100'
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', icon: Clock, color: 'text-amber-600' },
  approved: { label: 'Approuvé', icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Rejeté', icon: XCircle, color: 'text-red-600' },
  distributed: { label: 'Distribué', icon: Package, color: 'text-blue-600' }
}

export function PendingLootList({ pendingLoot, campaignId, characters }: PendingLootListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedLoot, setSelectedLoot] = useState<PendingLootRecord | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (pendingLoot.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Loot en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Aucun loot en attente. Utilisez le générateur pour créer du loot.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Loot en attente ({pendingLoot.filter(l => l.status === 'pending' || l.status === 'approved').length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingLoot.map((loot) => {
            const status = STATUS_CONFIG[loot.status]
            const StatusIcon = status.icon
            const isExpanded = expandedId === loot.id
            const totalValue = loot.items.reduce((sum, item) => sum + item.value * item.quantity, 0)

            return (
              <div
                key={loot.id}
                className={cn(
                  'border rounded-lg overflow-hidden',
                  loot.status === 'pending' && 'border-amber-500/50'
                )}
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(loot.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn('h-5 w-5', status.color)} />
                    <div className="text-left">
                      <div className="font-medium">
                        {loot.source || 'Loot généré'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {loot.items.length} objet(s) - {totalValue} po
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm', status.color)}>{status.label}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Contenu expandable */}
                {isExpanded && (
                  <div className="border-t bg-muted/30 p-4 space-y-3">
                    {/* Liste des items */}
                    <div className="space-y-2">
                      {loot.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background rounded border"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              RARITY_COLORS[item.rarity]
                            )}>
                              {item.rarity}
                            </span>
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.value * item.quantity} po
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {loot.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Note: {loot.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {loot.status === 'pending' && (
                        <Button
                          onClick={() => setSelectedLoot(loot)}
                          size="sm"
                        >
                          Gérer
                        </Button>
                      )}
                      {loot.status === 'approved' && (
                        <Button
                          onClick={() => setSelectedLoot(loot)}
                          size="sm"
                        >
                          Distribuer
                        </Button>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(loot.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Dialog d'approbation/distribution */}
      {selectedLoot && (
        <LootApprovalDialog
          loot={selectedLoot}
          characters={characters}
          open={!!selectedLoot}
          onClose={() => setSelectedLoot(null)}
        />
      )}
    </>
  )
}

export default PendingLootList
