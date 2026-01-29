import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { GroupChatWindow } from '@/components/groups/GroupChatWindow'
import { getGroup, getGroupMessages } from '@/lib/actions/groups'
import { getCurrentUser } from '@/lib/actions/auth'

interface PageProps {
  params: { id: string }
}

export default async function GroupChatPage({ params }: PageProps) {
  const [group, user] = await Promise.all([
    getGroup(params.id),
    getCurrentUser()
  ])

  if (!user) {
    redirect('/login')
  }

  if (!group) {
    notFound()
  }

  const messages = await getGroupMessages(params.id, { limit: 100 })

  return (
    <>
      <Header
        title={group.name}
        description="Chat de groupe"
        user={user}
      />

      <div className="p-6 h-[calc(100vh-8rem)]">
        <GroupChatWindow
          group={group}
          currentUserId={user.id}
          currentUserRole={user.role}
          currentUserColor={user.chatColor}
          initialMessages={messages}
        />
      </div>
    </>
  )
}
