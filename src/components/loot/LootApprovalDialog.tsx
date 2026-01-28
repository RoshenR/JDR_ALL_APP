'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  updatePendingLootStatus,
  distributeLootToCharacter,
  deletePendingLoot,
  type PendingLootRecord
} from '@/lib/actions/loot'
import { Check, X, Trash2, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LootApprovalDialogProps {
  loot: PendingLootRecord
  characters: Array<{ id: string; name: string }>
  open: boolean
  onClose: () => void
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-600 bg-gray-100',
  uncommon: 'text-green-600 bg-green-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-amber-600 bg-amber-100'
}

export function LootApprovalDialog({ loot, characters, open, onClose }: LootApprovalDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(loot.notes || '')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectedCharacter, setSelectedCharacter] = useState('')

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(loot.items.map((_, i) => i)))
  }

  const selectNone = () => {
    setSelectedItems(new Set())
  }

  const handleApprove = () => {
    startTransition(async () => {
      await updatePendingLootStatus(loot.id, 'approved', notes || undefined)
      router.refresh()
      onClose()
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await updatePendingLootStatus(loot.id, 'rejected', notes || undefined)
      router.refresh()
      onClose()
    })
  }

  const handleDelete = () => {
    if (!confirm('Supprimer définitivement ce loot ?')) return

    startTransition(async () => {
      await deletePendingLoot(loot.id)
      router.refresh()
      onClose()
    })
  }

  const handleDistribute = () => {
    if (!selectedCharacter || selectedItems.size === 0) return

    startTransition(async () => {
      await distributeLootToCharacter(
        loot.id,
        selectedCharacter,
        Array.from(selectedItems)
      )
      router.refresh()
      onClose()
    })
  }

  const totalValue = loot.items.reduce((sum, item) => sum + item.value * item.quantity, 0)
  const selectedValue = Array.from(selectedItems).reduce(
    (sum, i) => sum + (loot.items[i]?.value || 0) * (loot.items[i]?.quantity || 0),
    0
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {loot.status === 'pending' ? 'Approuver le loot' : 'Distribuer le loot'}
          </DialogTitle>
          <DialogDescription>
            {loot.source || 'Loot généré'} - {loot.items.length} objet(s) - {totalValue} po
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Liste des items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Objets</Label>
              {loot.status === 'approved' && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Tout
                  </Button>
                  <Button variant="ghost" size="sm" onClick={selectNone}>
                    Aucun
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {loot.items.map((item, index) => (
                <div
                  key={index}
                  onClick={() => loot.status === 'approved' && toggleItem(index)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    loot.status === 'approved' && 'cursor-pointer hover:bg-muted/50',
                    selectedItems.has(index) && 'bg-primary/10 border-primary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {loot.status === 'approved' && (
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center',
                        selectedItems.has(index)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      )}>
                        {selectedItems.has(index) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          RARITY_COLORS[item.rarity]
                        )}>
                          {item.rarity}
                        </span>
                        <span className="font-medium">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">
                    {item.value * item.quantity} po
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sélection personnage (pour distribution) */}
          {loot.status === 'approved' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Distribuer à
              </Label>
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un personnage...</option>
                {characters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedItems.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedItems.size} objet(s) sélectionné(s) - {selectedValue} po
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {loot.status === 'pending' && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter une note..."
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {loot.status === 'pending' ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
              <Button onClick={handleApprove} disabled={isPending}>
                <Check className="h-4 w-4 mr-1" />
                Approuver
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                onClick={handleDistribute}
                disabled={isPending || !selectedCharacter || selectedItems.size === 0}
              >
                <Package className="h-4 w-4 mr-1" />
                Distribuer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LootApprovalDialog
