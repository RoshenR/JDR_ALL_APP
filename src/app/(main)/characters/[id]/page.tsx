import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatBlock } from '@/components/characters/StatBlock'
import { NotesList } from '@/components/notes/NotesList'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { getCharacter, deleteCharacter, canEditCharacter } from '@/lib/actions/characters'
import { getNotes } from '@/lib/actions/notes'
import { getInventory } from '@/lib/actions/inventory'
import { Edit, Trash2, User, FileText, Package } from 'lucide-react'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function CharacterPage({ params }: PageProps) {
  const character = await getCharacter(params.id)

  if (!character) {
    notFound()
  }

  const [canEdit, notes, inventory] = await Promise.all([
    canEditCharacter(params.id),
    getNotes(params.id).catch(() => []),
    getInventory(params.id).catch(() => [])
  ])

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
          canEdit && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="sm:size-default">
                <Link href={`/characters/${character.id}/edit`}>
                  <Edit className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Modifier</span>
                </Link>
              </Button>
              <form action={handleDelete}>
                <Button type="submit" variant="destructive" size="sm" className="sm:size-default">
                  <Trash2 className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </form>
            </div>
          )
        }
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">
        {/* Header with image */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{character.name}</h2>
                {character.campaign && (
                  <p className="text-sm text-muted-foreground">
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
                  <p className="mt-2 sm:mt-3 text-sm text-muted-foreground line-clamp-3 sm:line-clamp-none">
                    {character.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Infos</span>
              <span className="sm:hidden">Infos</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Notes</span>
              <span className="ml-1">({notes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs sm:text-sm">
              <Package className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Inventaire</span>
              <span className="ml-1">({inventory.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Stats */}
            {Object.keys(character.attributes).length > 0 && (
              <StatBlock title="Attributs" stats={character.attributes} />
            )}

            {character.skills && Object.keys(character.skills).length > 0 && (
              <StatBlock title="Compétences" stats={character.skills} />
            )}

            {/* Legacy Notes */}
            {character.notes && (
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Notes générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {character.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 sm:mt-6">
            <NotesList
              characterId={params.id}
              notes={notes}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-4 sm:mt-6">
            <InventoryTable
              characterId={params.id}
              items={inventory}
              canEdit={canEdit}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
