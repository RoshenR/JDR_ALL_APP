import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CharacterCard } from '@/components/characters/CharacterCard'
import { Plus } from 'lucide-react'
import { getCharacters } from '@/lib/actions/characters'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function CharactersPage() {
  const user = await getCurrentUser()
  const allCharacters = await getCharacters()

  // MJ sees all, players see only their own
  const characters = user?.role === 'MJ'
    ? allCharacters
    : allCharacters.filter(c => c.ownerId === user?.id)

  return (
    <>
      <Header
        title="Personnages"
        description={`${characters.length} personnage${characters.length > 1 ? 's' : ''}`}
        user={user}
        action={
          <Button asChild>
            <Link href="/characters/new">
              <Plus className="mr-1 h-4 w-4" /> Nouveau
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {user?.role === 'MJ' ? 'Aucun personnage pour le moment' : 'Vous n\'avez pas encore de personnage'}
            </p>
            <Button asChild>
              <Link href="/characters/new">
                <Plus className="mr-1 h-4 w-4" /> Créer un personnage
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
