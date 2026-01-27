import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import { Plus } from 'lucide-react'
import { getCampaigns } from '@/lib/actions/campaigns'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const user = await getCurrentUser()
  const campaigns = await getCampaigns()

  return (
    <>
      <Header
        title="Campagnes"
        description={`${campaigns.length} campagne${campaigns.length > 1 ? 's' : ''}`}
        user={user}
        action={
          user?.role === 'MJ' ? (
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="mr-1 h-4 w-4" /> Nouvelle
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="p-6">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucune campagne pour le moment
            </p>
            {user?.role === 'MJ' && (
              <Button asChild>
                <Link href="/campaigns/new">
                  <Plus className="mr-1 h-4 w-4" /> Créer une campagne
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
