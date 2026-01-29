import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { QuestWizard } from '@/components/quests/QuestWizard'
import { getCampaign } from '@/lib/actions/campaigns'
import { getCurrentUser } from '@/lib/actions/auth'

interface PageProps {
  params: { id: string }
}

export default async function NewQuestPage({ params }: PageProps) {
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

  // Seul le MJ peut créer des quêtes
  if (user.role !== 'MJ') {
    redirect(`/campaigns/${params.id}/quests`)
  }

  return (
    <>
      <Header
        title="Nouvelle quête"
        description={campaign.name}
        user={user}
      />

      <div className="p-6">
        <QuestWizard campaignId={params.id} />
      </div>
    </>
  )
}
