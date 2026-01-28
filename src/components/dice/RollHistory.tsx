'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Lock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RollRecord {
  id: string
  formula: string
  results: number[]
  total: number
  label: string | null
  isPrivate: boolean
  userName: string
  createdAt: Date
}

interface RollHistoryProps {
  history: RollRecord[]
  maxHeight?: number
}

export function RollHistory({ history, maxHeight = 400 }: RollHistoryProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Déterminer si c'est un résultat critique (pour les d20)
  const isCritical = (record: RollRecord) => {
    if (!record.formula.includes('d20')) return null
    const d20Result = record.results[0]
    if (d20Result === 20) return 'critical'
    if (d20Result === 1) return 'fumble'
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historique des jets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-1 p-4 pt-0">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun jet enregistré
              </p>
            ) : (
              history.map((record) => {
                const critical = isCritical(record)
                return (
                  <div
                    key={record.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      critical === 'critical' && 'bg-green-500/10 border-green-500/30',
                      critical === 'fumble' && 'bg-red-500/10 border-red-500/30',
                      !critical && 'bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {record.label && (
                          <p className="text-sm font-medium truncate mb-1">
                            {record.label}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{record.formula}</span>
                          <span className="text-muted-foreground">=</span>
                          <span className={cn(
                            'font-bold text-lg',
                            critical === 'critical' && 'text-green-600',
                            critical === 'fumble' && 'text-red-600'
                          )}>
                            {record.total}
                          </span>
                          {critical && (
                            <span className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded',
                              critical === 'critical' && 'bg-green-500/20 text-green-700',
                              critical === 'fumble' && 'bg-red-500/20 text-red-700'
                            )}>
                              {critical === 'critical' ? 'CRITIQUE!' : 'FUMBLE!'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          [{record.results.join(', ')}]
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {record.userName}
                          {record.isPrivate && (
                            <Lock className="h-3 w-3 text-amber-600" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(record.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default RollHistory
