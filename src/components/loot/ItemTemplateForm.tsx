'use client'

import { useState, useTransition } from 'react'
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
import { createItemTemplate, updateItemTemplate, type ItemCategory, type ItemRarity, type ItemTemplate } from '@/lib/actions/loot'

interface ItemTemplateFormProps {
  template?: ItemTemplate
  onSuccess?: () => void
  onCancel?: () => void
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'weapon', label: 'Arme' },
  { value: 'armor', label: 'Armure' },
  { value: 'consumable', label: 'Consommable' },
  { value: 'quest', label: 'Objet de quête' },
  { value: 'misc', label: 'Divers' }
]

const rarities: { value: ItemRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Commun', color: 'text-gray-500' },
  { value: 'uncommon', label: 'Peu commun', color: 'text-green-600' },
  { value: 'rare', label: 'Rare', color: 'text-blue-600' },
  { value: 'epic', label: 'Épique', color: 'text-purple-600' },
  { value: 'legendary', label: 'Légendaire', color: 'text-amber-600' }
]

export function ItemTemplateForm({ template, onSuccess, onCancel }: ItemTemplateFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [category, setCategory] = useState<ItemCategory>(template?.category || 'misc')
  const [rarity, setRarity] = useState<ItemRarity>(template?.rarity || 'common')
  const [weight, setWeight] = useState(template?.weight?.toString() || '')
  const [minValue, setMinValue] = useState(template?.minValue?.toString() || '0')
  const [maxValue, setMaxValue] = useState(template?.maxValue?.toString() || '0')
  const [tags, setTags] = useState(template?.tags?.join(', ') || '')

  const isEditing = !!template

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          rarity,
          weight: weight ? parseFloat(weight) : undefined,
          minValue: parseInt(minValue) || 0,
          maxValue: parseInt(maxValue) || parseInt(minValue) || 0,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        }

        if (isEditing) {
          await updateItemTemplate(template.id, data)
        } else {
          await createItemTemplate(data)
        }
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm">Nom *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Épée longue +1"
          disabled={isPending}
        />
      </div>

      <div className="grid gap-3 grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Rareté</Label>
          <Select value={rarity} onValueChange={(v) => setRarity(v as ItemRarity)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rarities.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  <span className={r.color}>{r.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Poids (kg)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Valeur min (PO)</Label>
          <Input
            type="number"
            min="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Valeur max (PO)</Label>
          <Input
            type="number"
            min="0"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Tags (séparés par des virgules)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="magique, deux-mains, maudit"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de l'objet..."
          rows={2}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="w-full sm:w-auto">
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:ml-auto">
          {isPending ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
