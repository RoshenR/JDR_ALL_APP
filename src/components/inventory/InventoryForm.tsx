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
import { createInventoryItem, updateInventoryItem, type ItemCategory, type ItemRarity } from '@/lib/actions/inventory'

interface InventoryFormProps {
  characterId: string
  item?: {
    id: string
    name: string
    quantity: number
    description: string | null
    category: ItemCategory | null
    rarity: ItemRarity | null
    weight: number | null
    value: number | null
  }
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
  { value: 'uncommon', label: 'Peu commun', color: 'text-green-500' },
  { value: 'rare', label: 'Rare', color: 'text-blue-500' },
  { value: 'epic', label: 'Épique', color: 'text-purple-500' },
  { value: 'legendary', label: 'Légendaire', color: 'text-amber-500' }
]

export function InventoryForm({ characterId, item, onSuccess, onCancel }: InventoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(item?.name || '')
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [description, setDescription] = useState(item?.description || '')
  const [category, setCategory] = useState<ItemCategory | ''>(item?.category || '')
  const [rarity, setRarity] = useState<ItemRarity | ''>(item?.rarity || '')
  const [weight, setWeight] = useState<string>(item?.weight?.toString() || '')
  const [value, setValue] = useState<string>(item?.value?.toString() || '')
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!item

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
          quantity,
          description: description.trim() || null,
          category: category || null,
          rarity: rarity || null,
          weight: weight ? parseFloat(weight) : null,
          value: value ? parseInt(value, 10) : null
        }

        if (isEditing) {
          await updateInventoryItem(item.id, data)
        } else {
          await createInventoryItem(characterId, data)
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

      {/* Name and Quantity */}
      <div className="grid gap-3 grid-cols-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name" className="text-sm">Nom *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'objet"
            disabled={isPending}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity" className="text-sm">Qté</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
            disabled={isPending}
            className="h-10"
          />
        </div>
      </div>

      {/* Category and Rarity */}
      <div className="grid gap-3 grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Rareté</Label>
          <Select value={rarity} onValueChange={(v) => setRarity(v as ItemRarity)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sélectionner" />
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

      {/* Weight and Value */}
      <div className="grid gap-3 grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="weight" className="text-sm">Poids (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            disabled={isPending}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="value" className="text-sm">Valeur (PO)</Label>
          <Input
            id="value"
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            disabled={isPending}
            className="h-10"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de l'objet..."
          rows={2}
          disabled={isPending}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto sm:ml-auto"
        >
          {isPending ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
