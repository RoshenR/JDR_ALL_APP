import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

interface CharacterCardProps {
  character: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    attributes: Record<string, string | number>
    campaign?: { name: string } | null
  }
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link href={`/characters/${character.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{character.name}</CardTitle>
              {character.campaign && (
                <p className="text-sm text-muted-foreground truncate">
                  {character.campaign.name}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {character.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {character.description}
            </p>
          )}
          {Object.keys(character.attributes).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(character.attributes).slice(0, 4).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
