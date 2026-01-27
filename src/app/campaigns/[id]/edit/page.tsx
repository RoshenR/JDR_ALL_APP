import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { getCampaign } from '@/lib/actions/campaigns'

interface PageProps {
  params: { id: string }
}

export default async function EditCampaignPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <>
      <Header
        title={`Modifier ${campaign.name}`}
        description="Modifier les informations de la campagne"
      />

      <div className="p-6 max-w-3xl">
        <CampaignForm campaign={campaign} />
      </div>
    </>
  )
}
