import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getCampaign } from '@/lib/actions/campaigns'
import { getCampaignMessages, getCampaignParticipants } from '@/lib/actions/chat'
import { getCurrentUser } from '@/lib/actions/auth'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignChatPage({ params }: PageProps) {
  const { id } = await params
  const [campaign, user] = await Promise.all([
    getCampaign(id),
    getCurrentUser()
  ])

  if (!campaign) {
    notFound()
  }

  if (!user) {
    redirect('/login')
  }

  const [messages, participants] = await Promise.all([
    getCampaignMessages(id, { limit: 100 }),
    getCampaignParticipants(id)
  ])

  return (
    <>
      <Header
        title={`Chat - ${campaign.name}`}
        description="Discussion en temps réel"
        user={user}
      />

      <div className="p-6 h-[calc(100vh-8rem)]">
        <ChatWindow
          campaignId={id}
          currentUserId={user.id}
          currentUserRole={user.role}
          currentUserColor={user.chatColor}
          participants={participants}
          initialMessages={messages}
        />
      </div>
    </>
  )
}
