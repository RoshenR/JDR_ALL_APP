import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Sword, Swords, BookOpen, Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [characters, campaigns, sessions, articles, activeCombats] = await Promise.all([
    prisma.character.count(),
    prisma.campaign.count(),
    prisma.session.count(),
    prisma.wikiArticle.count(),
    prisma.combat.count({ where: { isActive: true } }),
  ])
  return { characters, campaigns, sessions, articles, activeCombats }
}

async function getRecentActivity() {
  const [recentCharacters, recentCampaigns, recentArticles] = await Promise.all([
    prisma.character.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.campaign.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.wikiArticle.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { slug: true, title: true, updatedAt: true },
    }),
  ])
  return { recentCharacters, recentCampaigns, recentArticles }
}

export default async function Dashboard() {
  const [stats, activity, user] = await Promise.all([
    getStats(),
    getRecentActivity(),
    getCurrentUser()
  ])

  const isMJ = user?.role === 'MJ'

  return (
    <>
      <Header
        title="Dashboard"
        description={`Bienvenue${user ? `, ${user.name}` : ''}`}
        user={user}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Personnages</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.characters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <Sword className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.campaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Sword className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessions}</div>
            </CardContent>
          </Card>
          <Link href="/combat">
            <Card className={stats.activeCombats > 0 ? 'border-red-500/50 bg-red-500/5' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Combats actifs</CardTitle>
                <Swords className={`h-4 w-4 ${stats.activeCombats > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.activeCombats > 0 ? 'text-red-500' : ''}`}>
                  {stats.activeCombats}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Articles Wiki</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.articles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/characters/new">
                <Plus className="mr-1 h-4 w-4" /> Nouveau personnage
              </Link>
            </Button>
            {isMJ && (
              <>
                <Button asChild variant="outline">
                  <Link href="/campaigns/new">
                    <Plus className="mr-1 h-4 w-4" /> Nouvelle campagne
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/combat/new">
                    <Swords className="mr-1 h-4 w-4" /> Lancer un combat
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/wiki/new">
                    <Plus className="mr-1 h-4 w-4" /> Nouvel article
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personnages récents</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.recentCharacters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun personnage</p>
              ) : (
                <ul className="space-y-2">
                  {activity.recentCharacters.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/characters/${c.id}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campagnes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.recentCampaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune campagne</p>
              ) : (
                <ul className="space-y-2">
                  {activity.recentCampaigns.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Articles récents</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.recentArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun article</p>
              ) : (
                <ul className="space-y-2">
                  {activity.recentArticles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/wiki/articles/${a.slug}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
