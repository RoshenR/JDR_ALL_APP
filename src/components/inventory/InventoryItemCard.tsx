'use client'

import { useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Edit, Trash2, Sword, Shield, FlaskConical, Scroll, Package } from 'lucide-react'
import { updateItemQuantity, deleteInventoryItem, type ItemCategory, type ItemRarity } from '@/lib/actions/inventory'

interface InventoryItemCardProps {
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

const categoryConfig: Record<ItemCategory, { label: string; icon: typeof Package }> = {
  weapon: { label: 'Arme', icon: Sword },
  armor: { label: 'Armure', icon: Shield },
  consumable: { label: 'Consommable', icon: FlaskConical },
  quest: { label: 'Quête', icon: Scroll },
  misc: { label: 'Divers', icon: Package }
}

const rarityConfig: Record<ItemRarity, { label: string; className: string; border: string }> = {
  common: { label: 'Commun', className: 'text-gray-500 bg-gray-500/10', border: 'border-l-gray-400' },
  uncommon: { label: 'Peu commun', className: 'text-green-600 bg-green-500/10', border: 'border-l-green-500' },
  rare: { label: 'Rare', className: 'text-blue-600 bg-blue-500/10', border: 'border-l-blue-500' },
  epic: { label: 'Épique', className: 'text-purple-600 bg-purple-500/10', border: 'border-l-purple-500' },
  legendary: { label: 'Légendaire', className: 'text-amber-600 bg-amber-500/10', border: 'border-l-amber-500' }
}

export function InventoryItemCard({ item, canEdit, onEdit }: InventoryItemCardProps) {
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

  const category = item.category ? categoryConfig[item.category] : null
  const CategoryIcon = category?.icon || Package
  const rarity = item.rarity ? rarityConfig[item.rarity] : null

  return (
    <Card className={`transition-all ${rarity ? `border-l-4 ${rarity.border}` : ''} ${isPending ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{item.name}</h4>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {rarity && (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rarity.className}`}>
                    {rarity.label}
                  </span>
                )}
                {item.weight && (
                  <span className="text-xs text-muted-foreground">{item.weight} kg</span>
                )}
                {item.value && (
                  <span className="text-xs text-muted-foreground">{item.value} PO</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity controls */}
          <div className="flex flex-col items-end gap-2">
            {canEdit ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isPending || item.quantity <= 0}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={isPending}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="font-bold text-lg px-2">x{item.quantity}</span>
            )}

            {canEdit && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item.id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
