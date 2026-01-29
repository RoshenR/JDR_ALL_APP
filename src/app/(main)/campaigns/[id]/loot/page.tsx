import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { LootConstraints } from '@/components/loot/LootConstraints'
import { LootGenerator } from '@/components/loot/LootGenerator'
import { PendingLootList } from '@/components/loot/PendingLootList'
import { getCampaign } from '@/lib/actions/campaigns'
import { getLootSettings, getPendingLoot } from '@/lib/actions/loot'
import { getCurrentUser } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'

interface PageProps {
  params: { id: string }
}

export default async function CampaignLootPage({ params }: PageProps) {
  const [campaign, user] = await Promise.all([
    getCampaign(params.id),
    getCurrentUser()
  ])

  if (!campaign) {
    notFound()
  }

  if (!user) {
    redirect('/login')
  }

  // Seul le MJ peut accéder à cette page
  if (user.role !== 'MJ') {
    redirect(`/campaigns/${params.id}`)
  }

  const [settings, pendingLoot, characters] = await Promise.all([
    getLootSettings(params.id),
    getPendingLoot(params.id),
    prisma.character.findMany({
      where: { campaignId: params.id },
      select: { id: true, name: true }
    })
  ])

  return (
    <>
      <Header
        title={`Loot - ${campaign.name}`}
        description="Génération et distribution du loot"
        user={user}
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche: Contraintes et Générateur */}
          <div className="lg:col-span-1 space-y-6">
            <LootConstraints
              campaignId={params.id}
              initialSettings={settings}
            />
            <LootGenerator campaignId={params.id} />
          </div>

          {/* Colonne droite: Loot en attente */}
          <div className="lg:col-span-2">
            <PendingLootList
              pendingLoot={pendingLoot}
              campaignId={params.id}
              characters={characters}
            />
          </div>
        </div>
      </div>
    </>
  )
}
