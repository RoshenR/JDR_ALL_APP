'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCampaign, updateCampaign } from '@/lib/actions/campaigns'
interface CampaignFormProps {
  campaign?: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    system: string | null
  }
}

const COMMON_SYSTEMS = [
  'D&D 5e',
  'Pathfinder 2e',
  'Call of Cthulhu',
  'Vampire: The Masquerade',
  'FATE',
  'Savage Worlds',
  'Custom',
]

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(campaign?.name || '')
  const [description, setDescription] = useState(campaign?.description || '')
  const [imageUrl, setImageUrl] = useState(campaign?.imageUrl || '')
  const [system, setSystem] = useState(campaign?.system || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      name,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      system: system || undefined,
    }

    try {
      if (campaign) {
        await updateCampaign(campaign.id, data)
        router.push(`/campaigns/${campaign.id}`)
      } else {
        await createCampaign(data)
        router.push('/campaigns')
      }
      router.refresh()
    } catch (error) {
      console.error('Error saving campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de la campagne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la campagne"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">Système de jeu</Label>
            <Input
              id="system"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              placeholder="Ex: D&D 5e, Pathfinder..."
              list="systems"
            />
            <datalist id="systems">
              {COMMON_SYSTEMS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l&apos;image</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la campagne, contexte, synopsis..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : campaign ? 'Mettre à jour' : 'Créer la campagne'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
