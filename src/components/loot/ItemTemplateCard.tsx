'use client'

import { useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Sword, Shield, FlaskConical, Scroll, Package } from 'lucide-react'
import { deleteItemTemplate, type ItemTemplate, type ItemCategory, type ItemRarity } from '@/lib/actions/loot'

interface ItemTemplateCardProps {
  template: ItemTemplate
  onEdit?: (template: ItemTemplate) => void
  compact?: boolean
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

export function ItemTemplateCard({ template, onEdit, compact }: ItemTemplateCardProps) {
  const [isPending, startTransition] = useTransition()

  const category = categoryConfig[template.category]
  const rarity = rarityConfig[template.rarity]
  const CategoryIcon = category.icon

  const handleDelete = () => {
    if (confirm(`Supprimer "${template.name}" ?`)) {
      startTransition(async () => {
        await deleteItemTemplate(template.id)
      })
    }
  }

  const valueDisplay = template.minValue === template.maxValue
    ? `${template.minValue} PO`
    : `${template.minValue}-${template.maxValue} PO`

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-2 rounded-lg border-l-4 ${rarity.border} bg-muted/30 ${isPending ? 'opacity-50' : ''}`}>
        <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm truncate block">{template.name}</span>
          <span className={`text-xs ${rarity.className} px-1.5 py-0.5 rounded`}>{rarity.label}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{valueDisplay}</span>
      </div>
    )
  }

  return (
    <Card className={`border-l-4 ${rarity.border} ${isPending ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{template.name}</h4>
            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{template.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rarity.className}`}>
                {rarity.label}
              </span>
              <span className="text-xs text-muted-foreground">{category.label}</span>
              {template.weight && (
                <span className="text-xs text-muted-foreground">{template.weight} kg</span>
              )}
              <span className="text-xs text-muted-foreground">{valueDisplay}</span>
            </div>
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(template)} className="h-8 w-8">
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
        </div>
      </CardContent>
    </Card>
  )
}
