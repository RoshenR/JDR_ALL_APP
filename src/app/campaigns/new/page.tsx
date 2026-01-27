import { Header } from '@/components/layout/Header'
import { CampaignForm } from '@/components/campaigns/CampaignForm'

export default function NewCampaignPage() {
  return (
    <>
      <Header
        title="Nouvelle campagne"
        description="Créer une nouvelle campagne"
      />

      <div className="p-6 max-w-3xl">
        <CampaignForm />
      </div>
    </>
  )
}
