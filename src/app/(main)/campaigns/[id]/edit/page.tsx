import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { getCampaign } from '@/lib/actions/campaigns'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function EditCampaignPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'MJ') {
    redirect(`/campaigns/${params.id}?error=unauthorized`)
  }

  const campaign = await getCampaign(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <>
      <Header
        title={`Modifier ${campaign.name}`}
        description="Modifier les informations de la campagne"
        user={user}
      />

      <div className="p-6 max-w-3xl">
        <CampaignForm campaign={campaign} />
      </div>
    </>
  )
}
