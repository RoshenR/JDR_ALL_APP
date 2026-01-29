import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { QuestList } from '@/components/quests/QuestList'
import { getCampaign } from '@/lib/actions/campaigns'
import { getCampaignQuests } from '@/lib/actions/quests'
import { getCurrentUser } from '@/lib/actions/auth'

interface PageProps {
  params: { id: string }
}

export default async function CampaignQuestsPage({ params }: PageProps) {
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

  const quests = await getCampaignQuests(params.id)

  return (
    <>
      <Header
        title={`Quêtes - ${campaign.name}`}
        description="Gestion des quêtes de la campagne"
        user={user}
      />

      <div className="p-6">
        <QuestList
          quests={quests}
          campaignId={params.id}
          isMJ={user.role === 'MJ'}
        />
      </div>
    </>
  )
}
