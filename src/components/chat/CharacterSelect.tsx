'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { User, UserCircle } from 'lucide-react'
import { getUserCharactersForChat } from '@/lib/actions/chat'
import { cn } from '@/lib/utils'

interface Character {
  id: string
  name: string
  imageUrl: string | null
}

interface CharacterSelectProps {
  campaignId: string
  selectedCharacter: Character | null
  onSelect: (character: Character | null) => void
  className?: string
}

export function CharacterSelect({
  campaignId,
  selectedCharacter,
  onSelect,
  className
}: CharacterSelectProps) {
  const [open, setOpen] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCharacters() {
      setLoading(true)
      const chars = await getUserCharactersForChat(campaignId)
      setCharacters(chars)
      setLoading(false)
    }
    loadCharacters()
  }, [campaignId])

  const handleSelect = (character: Character | null) => {
    onSelect(character)
    setOpen(false)
  }

  // Dont show if user has no characters
  if (!loading && characters.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedCharacter ? 'secondary' : 'ghost'}
          size="icon"
          className={cn(
            'shrink-0',
            selectedCharacter && 'ring-2 ring-violet-500',
            className
          )}
          title={selectedCharacter ? `Parlant en tant que ${selectedCharacter.name}` : 'Parler en tant que personnage'}
        >
          {selectedCharacter ? (
            selectedCharacter.imageUrl ? (
              <img
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-5 w-5 text-violet-500" />
            )
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 mb-2">
            Mode In-Character (IC)
          </p>

          {/* Option to speak as self */}
          <Button
            variant={selectedCharacter === null ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => handleSelect(null)}
          >
            <User className="h-4 w-4" />
            <span>Parler en tant que moi</span>
          </Button>

          {loading ? (
            <p className="text-sm text-muted-foreground px-2 py-2">
              Chargement...
            </p>
          ) : (
            characters.map(character => (
              <Button
                key={character.id}
                variant={selectedCharacter?.id === character.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => handleSelect(character)}
              >
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
                <span className="truncate">{character.name}</span>
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CharacterSelect
