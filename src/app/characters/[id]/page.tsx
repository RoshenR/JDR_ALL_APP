import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatBlock } from '@/components/characters/StatBlock'
import { getCharacter, deleteCharacter } from '@/lib/actions/characters'
import { Edit, Trash2, User } from 'lucide-react'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function CharacterPage({ params }: PageProps) {
  const character = await getCharacter(params.id)

  if (!character) {
    notFound()
  }

  async function handleDelete() {
    'use server'
    await deleteCharacter(params.id)
    redirect('/characters')
  }

  return (
    <>
      <Header
        title={character.name}
        description={character.campaign?.name || 'Personnage libre'}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/characters/${character.id}/edit`}>
                <Edit className="mr-1 h-4 w-4" /> Modifier
              </Link>
            </Button>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" /> Supprimer
              </Button>
            </form>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header with image */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-6 items-start">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{character.name}</h2>
                {character.campaign && (
                  <p className="text-muted-foreground">
                    Campagne:{' '}
                    <Link
                      href={`/campaigns/${character.campaign.id}`}
                      className="text-primary hover:underline"
                    >
                      {character.campaign.name}
                    </Link>
                  </p>
                )}
                {character.description && (
                  <p className="mt-3 text-muted-foreground">{character.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {Object.keys(character.attributes).length > 0 && (
          <StatBlock title="Attributs" stats={character.attributes} />
        )}

        {character.skills && Object.keys(character.skills).length > 0 && (
          <StatBlock title="Compétences" stats={character.skills} />
        )}

        {/* Notes */}
        {character.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {character.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
