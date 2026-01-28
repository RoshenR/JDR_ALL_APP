'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, Crown, User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivateMessageSelectProps {
  participants: Array<{ id: string; name: string; role: string }>
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function PrivateMessageSelect({
  participants,
  selectedId,
  onSelect
}: PrivateMessageSelectProps) {
  const selected = participants.find(p => p.id === selectedId)
  const mjs = participants.filter(p => p.role === 'MJ')
  const players = participants.filter(p => p.role !== 'MJ')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            selectedId && 'bg-amber-500/20 border-amber-500/50'
          )}
          title={selected ? `Message privé: ${selected.name}` : 'Message groupe'}
        >
          {selectedId ? (
            <Lock className="h-4 w-4 text-amber-600" />
          ) : (
            <Users className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Destinataire</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Option groupe */}
        <DropdownMenuItem
          onClick={() => onSelect(null)}
          className={cn(!selectedId && 'bg-accent')}
        >
          <Users className="h-4 w-4 mr-2" />
          Tout le groupe
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* MJs */}
        {mjs.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Maîtres du Jeu
            </DropdownMenuLabel>
            {mjs.map(mj => (
              <DropdownMenuItem
                key={mj.id}
                onClick={() => onSelect(mj.id)}
                className={cn(selectedId === mj.id && 'bg-accent')}
              >
                <Crown className="h-4 w-4 mr-2 text-amber-500" />
                {mj.name}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Joueurs */}
        {players.length > 0 && (
          <>
            {mjs.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Joueurs
            </DropdownMenuLabel>
            {players.map(player => (
              <DropdownMenuItem
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={cn(selectedId === player.id && 'bg-accent')}
              >
                <User className="h-4 w-4 mr-2" />
                {player.name}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {participants.length === 0 && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Aucun autre participant
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PrivateMessageSelect
