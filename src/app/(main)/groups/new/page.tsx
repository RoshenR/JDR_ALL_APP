import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { GroupForm } from '@/components/groups/GroupForm'
import { getCurrentUser } from '@/lib/actions/auth'

export default async function NewGroupPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header
        title="Nouveau groupe"
        description="Créer un groupe de discussion"
        user={user}
      />

      <div className="p-6 max-w-2xl mx-auto">
        <GroupForm mode="create" />
      </div>
    </>
  )
}
