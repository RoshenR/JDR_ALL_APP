import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CharacterForm } from '@/components/characters/CharacterForm'
import { getCharacter } from '@/lib/actions/characters'
import { getCampaigns } from '@/lib/actions/campaigns'

interface PageProps {
  params: { id: string }
}

export default async function EditCharacterPage({ params }: PageProps) {
  const [character, campaigns] = await Promise.all([
    getCharacter(params.id),
    getCampaigns(),
  ])

  if (!character) {
    notFound()
  }

  return (
    <>
      <Header
        title={`Modifier ${character.name}`}
        description="Modifier la fiche de personnage"
      />

      <div className="p-6 max-w-3xl">
        <CharacterForm character={character} campaigns={campaigns} />
      </div>
    </>
  )
}
