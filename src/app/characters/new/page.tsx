import { Header } from '@/components/layout/Header'
import { CharacterForm } from '@/components/characters/CharacterForm'
import { getCampaigns } from '@/lib/actions/campaigns'

export default async function NewCharacterPage() {
  const campaigns = await getCampaigns()

  return (
    <>
      <Header
        title="Nouveau personnage"
        description="Créer une nouvelle fiche de personnage"
      />

      <div className="p-6 max-w-3xl">
        <CharacterForm campaigns={campaigns} />
      </div>
    </>
  )
}
