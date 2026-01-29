import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { Package, ArrowRight, Settings } from 'lucide-react'

export default async function LootPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Seul le MJ peut accéder à cette page
  if (user.role !== 'MJ') {
    redirect('/')
  }

  // Récupérer les campagnes avec du loot pending
  const campaigns = await prisma.campaign.findMany({
    include: {
      _count: {
        select: {
          pendingLoot: {
            where: { status: { in: ['pending', 'approved'] } }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <>
      <Header
        title="Gestion du Loot"
        description="Générez et distribuez le loot pour vos campagnes"
        user={user}
      />

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Aucune campagne. Créez une campagne pour gérer le loot.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/campaigns/new">Créer une campagne</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            campaigns.map(campaign => (
              <Card key={campaign.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{campaign.name}</span>
                    {campaign._count.pendingLoot > 0 && (
                      <span className="flex items-center gap-1 text-sm font-normal text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                        {campaign._count.pendingLoot} en attente
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {campaign.system || 'Système non défini'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/campaigns/${campaign.id}/loot`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Gérer
                      </Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href={`/campaigns/${campaign.id}/loot`}>
                        <Package className="h-4 w-4 mr-1" />
                        Générer
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
