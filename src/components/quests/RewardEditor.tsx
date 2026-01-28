'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { QuestRewards } from '@/lib/quest-utils'
import { Coins, Sparkles, Package, Plus, Trash2, FileText } from 'lucide-react'

interface RewardEditorProps {
  rewards: QuestRewards
  onChange: (rewards: QuestRewards) => void
  disabled?: boolean
}

export function RewardEditor({ rewards, onChange, disabled }: RewardEditorProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)

  const updateReward = <K extends keyof QuestRewards>(key: K, value: QuestRewards[K]) => {
    onChange({ ...rewards, [key]: value })
  }

  const addItem = () => {
    if (!newItemName.trim()) return

    const items = rewards.items || []
    updateReward('items', [
      ...items,
      { name: newItemName.trim(), quantity: newItemQuantity }
    ])
    setNewItemName('')
    setNewItemQuantity(1)
  }

  const removeItem = (index: number) => {
    const items = rewards.items || []
    updateReward('items', items.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const items = rewards.items || []
    updateReward('items', items.map((item, i) =>
      i === index ? { ...item, quantity } : item
    ))
  }

  return (
    <div className="space-y-4">
      <Label>Récompenses</Label>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Or */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Coins className="h-4 w-4 text-amber-500" />
            Or (pièces)
          </Label>
          <Input
            type="number"
            value={rewards.gold || ''}
            onChange={(e) => updateReward('gold', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0"
            min={0}
            disabled={disabled}
          />
        </div>

        {/* XP */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Points d&apos;experience
          </Label>
          <Input
            type="number"
            value={rewards.xp || ''}
            onChange={(e) => updateReward('xp', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0"
            min={0}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Objets */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground flex items-center gap-1">
          <Package className="h-4 w-4 text-blue-500" />
          Objets
        </Label>

        {rewards.items && rewards.items.length > 0 && (
          <div className="space-y-2">
            {rewards.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                  className="w-20"
                  min={1}
                  disabled={disabled}
                />
                <span className="text-muted-foreground">x</span>
                <Input
                  value={item.name}
                  className="flex-1"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            className="w-20"
            min={1}
            disabled={disabled}
          />
          <span className="text-muted-foreground self-center">x</span>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Nom de l&apos;objet..."
            className="flex-1"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            disabled={disabled || !newItemName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Autre récompense */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Autre (texte libre)
        </Label>
        <Input
          value={rewards.other || ''}
          onChange={(e) => updateReward('other', e.target.value || undefined)}
          placeholder="Faveur d&apos;un noble, acces a une zone..."
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default RewardEditor
