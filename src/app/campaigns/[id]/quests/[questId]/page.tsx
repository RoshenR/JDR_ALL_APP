import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { QuestDetail } from '@/components/quests/QuestDetail'
import { getCampaign } from '@/lib/actions/campaigns'
import { getQuest } from '@/lib/actions/quests'
import { getCurrentUser } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string; questId: string }
}

export default async function QuestDetailPage({ params }: PageProps) {
  const [campaign, user, quest] = await Promise.all([
    getCampaign(params.id),
    getCurrentUser(),
    getQuest(params.questId)
  ])

  if (!campaign) {
    notFound()
  }

  if (!user) {
    redirect('/login')
  }

  if (!quest) {
    notFound()
  }

  return (
    <>
      <Header
        title={quest.title}
        description={`Quête - ${campaign.name}`}
        user={user}
      />

      <div className="p-6">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/campaigns/${params.id}/quests`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux quêtes
            </Link>
          </Button>
        </div>

        <QuestDetail
          quest={quest}
          campaignId={params.id}
          isMJ={user.role === 'MJ'}
        />
      </div>
    </>
  )
}
