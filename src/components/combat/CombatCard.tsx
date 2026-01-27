import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Users, Clock } from 'lucide-react'

interface CombatCardProps {
  combat: {
    id: string
    name: string
    description: string | null
    isActive: boolean
    currentRound: number
    participants: Array<{ id: string; isActive: boolean }>
  }
}

export function CombatCard({ combat }: CombatCardProps) {
  const activeCount = combat.participants.filter(p => p.isActive).length
  const totalCount = combat.participants.length

  return (
    <Link href={`/combat/${combat.id}`}>
      <Card className={`h-full transition-all hover:shadow-md hover:border-primary/50 ${!combat.isActive ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${combat.isActive ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
              <Swords className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{combat.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {combat.isActive ? 'En cours' : 'Terminé'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {combat.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {combat.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {activeCount}/{totalCount} actifs
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Round {combat.currentRound}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
