'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { createCharacter, updateCharacter } from '@/lib/actions/characters'

interface CharacterFormProps {
  character?: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    notes: string | null
    campaignId: string | null
    attributes: Record<string, string | number>
    skills: Record<string, string | number> | null
  }
  campaigns: Array<{ id: string; name: string }>
  /** IDs des campagnes où le joueur a déjà un personnage */
  campaignsWithCharacter?: string[]
}

export function CharacterForm({ character, campaigns, campaignsWithCharacter = [] }: CharacterFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(character?.name || '')
  const [description, setDescription] = useState(character?.description || '')
  const [imageUrl, setImageUrl] = useState(character?.imageUrl || '')
  const [notes, setNotes] = useState(character?.notes || '')
  const [campaignId, setCampaignId] = useState(character?.campaignId || 'none')
  const [attributes, setAttributes] = useState<[string, string][]>(
    character?.attributes
      ? Object.entries(character.attributes).map(([k, v]) => [k, String(v)])
      : [['Force', '10'], ['Dextérité', '10'], ['Constitution', '10']]
  )
  const [skills, setSkills] = useState<[string, string][]>(
    character?.skills
      ? Object.entries(character.skills).map(([k, v]) => [k, String(v)])
      : []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = {
      name,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined,
      campaignId: campaignId && campaignId !== 'none' ? campaignId : undefined,
      attributes: Object.fromEntries(
        attributes.filter(([k]) => k.trim()).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
      ),
      skills: skills.length > 0
        ? Object.fromEntries(
            skills.filter(([k]) => k.trim()).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
          )
        : undefined,
    }

    try {
      if (character) {
        await updateCharacter(character.id, data)
      } else {
        await createCharacter(data)
      }
      router.push('/characters')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const addAttribute = () => setAttributes([...attributes, ['', '']])
  const removeAttribute = (index: number) => setAttributes(attributes.filter((_, i) => i !== index))
  const updateAttribute = (index: number, key: string, value: string) => {
    const newAttrs = [...attributes]
    newAttrs[index] = [key, value]
    setAttributes(newAttrs)
  }

  const addSkill = () => setSkills([...skills, ['', '']])
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index))
  const updateSkill = (index: number, key: string, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = [key, value]
    setSkills(newSkills)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du personnage"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign">Campagne</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une campagne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {campaigns.map((c) => {
                    const alreadyHasCharacter = campaignsWithCharacter.includes(c.id) && character?.campaignId !== c.id
                    return (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        disabled={alreadyHasCharacter}
                      >
                        {c.name}{alreadyHasCharacter ? ' (personnage existant)' : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
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
              placeholder="Description du personnage..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attributs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {attributes.map(([key, value], index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Attribut"
                value={key}
                onChange={(e) => updateAttribute(index, e.target.value, value)}
                className="flex-1"
              />
              <Input
                placeholder="Valeur"
                value={value}
                onChange={(e) => updateAttribute(index, key, e.target.value)}
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAttribute(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compétences</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune compétence ajoutée</p>
          ) : (
            skills.map(([key, value], index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Compétence"
                  value={key}
                  onChange={(e) => updateSkill(index, e.target.value, value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Valeur"
                  value={value}
                  onChange={(e) => updateSkill(index, key, e.target.value)}
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes personnelles, background, objectifs..."
            rows={5}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : character ? 'Mettre à jour' : 'Créer le personnage'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
