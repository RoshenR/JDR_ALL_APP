import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionList } from '@/components/campaigns/SessionList'
import { getCampaign, deleteCampaign } from '@/lib/actions/campaigns'
import { getCurrentUser } from '@/lib/actions/auth'
import { Edit, Trash2, Sword, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function CampaignPage({ params }: PageProps) {
  const [campaign, user] = await Promise.all([
    getCampaign(params.id),
    getCurrentUser()
  ])

  if (!campaign) {
    notFound()
  }

  async function handleDelete() {
    'use server'
    await deleteCampaign(params.id)
    redirect('/campaigns')
  }

  return (
    <>
      <Header
        title={campaign.name}
        description={campaign.system || 'Système non défini'}
        user={user}
        action={
          user?.role === 'MJ' ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/campaigns/${campaign.id}/edit`}>
                  <Edit className="mr-1 h-4 w-4" /> Modifier
                </Link>
              </Button>
              <form action={handleDelete}>
                <Button type="submit" variant="destructive">
                  <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                </Button>
              </form>
            </div>
          ) : undefined
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6 items-start">
                  {campaign.imageUrl ? (
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.name}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                      <Sword className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{campaign.name}</h2>
                    {campaign.system && (
                      <p className="text-muted-foreground">{campaign.system}</p>
                    )}
                    {campaign.description && (
                      <p className="mt-3 text-muted-foreground">{campaign.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions */}
            <SessionList campaignId={campaign.id} sessions={campaign.sessions || []} isMJ={user?.role === 'MJ'} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Characters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personnages ({campaign.characters?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!campaign.characters || campaign.characters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun personnage lié
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {campaign.characters.map((char) => (
                      <li key={char.id}>
                        <Link
                          href={`/characters/${char.id}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          {char.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <Link href="/characters/new">
                    Ajouter un personnage
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
