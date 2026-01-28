'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Edit, Trash2 } from 'lucide-react'
import { updateItemQuantity, deleteInventoryItem, type ItemCategory, type ItemRarity } from '@/lib/actions/inventory'

interface InventoryItemRowProps {
  item: {
    id: string
    name: string
    quantity: number
    description: string | null
    category: ItemCategory | null
    rarity: ItemRarity | null
    weight: number | null
    value: number | null
  }
  canEdit: boolean
  onEdit?: (id: string) => void
}

const categoryLabels: Record<ItemCategory, string> = {
  weapon: 'Arme',
  armor: 'Armure',
  consumable: 'Consommable',
  quest: 'Quête',
  misc: 'Divers'
}

const rarityConfig: Record<ItemRarity, { label: string; className: string }> = {
  common: { label: 'Commun', className: 'text-gray-500 bg-gray-500/10' },
  uncommon: { label: 'Peu commun', className: 'text-green-600 bg-green-500/10' },
  rare: { label: 'Rare', className: 'text-blue-600 bg-blue-500/10' },
  epic: { label: 'Épique', className: 'text-purple-600 bg-purple-500/10' },
  legendary: { label: 'Légendaire', className: 'text-amber-600 bg-amber-500/10' }
}

export function InventoryItemRow({ item, canEdit, onEdit }: InventoryItemRowProps) {
  const [isPending, startTransition] = useTransition()

  const handleQuantityChange = (delta: number) => {
    startTransition(async () => {
      await updateItemQuantity(item.id, delta)
    })
  }

  const handleDelete = () => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      startTransition(async () => {
        await deleteInventoryItem(item.id)
      })
    }
  }

  const rarity = item.rarity ? rarityConfig[item.rarity] : null

  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 ${isPending ? 'opacity-50' : ''}`}>
      <td className="p-3">
        <div>
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {item.description}
            </p>
          )}
        </div>
      </td>
      <td className="p-3 text-center">
        {canEdit ? (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={isPending || item.quantity <= 0}
              className="h-7 w-7 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={isPending}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="font-medium">{item.quantity}</span>
        )}
      </td>
      <td className="p-3 text-center">
        {item.category && (
          <span className="text-sm text-muted-foreground">
            {categoryLabels[item.category]}
          </span>
        )}
      </td>
      <td className="p-3 text-center">
        {rarity && (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rarity.className}`}>
            {rarity.label}
          </span>
        )}
      </td>
      <td className="p-3 text-center text-sm text-muted-foreground">
        {item.weight ? `${item.weight} kg` : '-'}
      </td>
      <td className="p-3 text-center text-sm text-muted-foreground">
        {item.value ? `${item.value} PO` : '-'}
      </td>
      {canEdit && (
        <td className="p-3">
          <div className="flex justify-end gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item.id)}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      )}
    </tr>
  )
}
