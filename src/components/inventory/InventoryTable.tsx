'use client'

import { useState } from 'react'
import { InventoryItemRow } from './InventoryItemRow'
import { InventoryItemCard } from './InventoryItemCard'
import { InventoryForm } from './InventoryForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Package } from 'lucide-react'
import { type ItemCategory, type ItemRarity } from '@/lib/actions/inventory'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  description: string | null
  category: ItemCategory | null
  rarity: ItemRarity | null
  weight: number | null
  value: number | null
}

interface InventoryTableProps {
  characterId: string
  items: InventoryItem[]
  canEdit: boolean
}

export function InventoryTable({ characterId, items, canEdit }: InventoryTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const handleEditItem = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      setEditingItem(item)
    }
  }

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0) * item.quantity, 0)

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-1 h-4 w-4" /> Ajouter un objet
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Inventaire vide</p>
          {canEdit && (
            <p className="text-sm mt-1">
              Ajoutez des objets à l&apos;inventaire
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="flex flex-col gap-3 md:hidden">
            {items.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onEdit={handleEditItem}
              />
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Objet</th>
                  <th className="text-center p-3 font-medium w-28">Qté</th>
                  <th className="text-center p-3 font-medium">Catégorie</th>
                  <th className="text-center p-3 font-medium">Rareté</th>
                  <th className="text-center p-3 font-medium w-20">Poids</th>
                  <th className="text-center p-3 font-medium w-20">Valeur</th>
                  {canEdit && <th className="w-20"></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <InventoryItemRow
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    onEdit={handleEditItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-6 text-sm bg-muted/30 p-3 rounded-lg">
            <span className="flex justify-between sm:block">
              <span className="text-muted-foreground">Poids total:</span>
              <strong className="text-foreground ml-2">{totalWeight.toFixed(1)} kg</strong>
            </span>
            <span className="flex justify-between sm:block">
              <span className="text-muted-foreground">Valeur totale:</span>
              <strong className="text-foreground ml-2">{totalValue} PO</strong>
            </span>
          </div>
        </>
      )}

      {/* Create Item Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un objet</DialogTitle>
          </DialogHeader>
          <InventoryForm
            characterId={characterId}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;objet</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              characterId={characterId}
              item={editingItem}
              onSuccess={() => setEditingItem(null)}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
