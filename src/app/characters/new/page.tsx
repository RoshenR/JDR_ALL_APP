import { Header } from '@/components/layout/Header'
import { CharacterForm } from '@/components/characters/CharacterForm'
import { getCampaigns } from '@/lib/actions/campaigns'
import { getUserCampaignsWithCharacter } from '@/lib/actions/characters'

export default async function NewCharacterPage() {
  const [campaigns, campaignsWithCharacter] = await Promise.all([
    getCampaigns(),
    getUserCampaignsWithCharacter()
  ])

  return (
    <>
      <Header
        title="Nouveau personnage"
        description="Créer une nouvelle fiche de personnage"
      />

      <div className="p-6 max-w-3xl">
        <CharacterForm
          campaigns={campaigns}
          campaignsWithCharacter={campaignsWithCharacter}
        />
      </div>
    </>
  )
}
