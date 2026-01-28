import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function NewCampaignPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'MJ') {
    redirect('/campaigns?error=unauthorized')
  }

  return (
    <>
      <Header
        title="Nouvelle campagne"
        description="Créer une nouvelle campagne"
        user={user}
      />

      <div className="p-6 max-w-3xl">
        <CampaignForm />
      </div>
    </>
  )
}
