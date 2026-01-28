'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { saveLootSettings, type LootSettings, type ItemCategory, type ItemRarity } from '@/lib/actions/loot'
import { Settings, Save, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LootConstraintsProps {
  campaignId: string
  initialSettings: LootSettings | null
}

const RARITIES: Array<{ value: ItemRarity; label: string; color: string }> = [
  { value: 'common', label: 'Commun', color: 'bg-gray-500' },
  { value: 'uncommon', label: 'Peu commun', color: 'bg-green-500' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
  { value: 'epic', label: 'Épique', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Légendaire', color: 'bg-amber-500' }
]

const CATEGORIES: Array<{ value: ItemCategory; label: string }> = [
  { value: 'weapon', label: 'Armes' },
  { value: 'armor', label: 'Armures' },
  { value: 'consumable', label: 'Consommables' },
  { value: 'quest', label: 'Objets de quête' },
  { value: 'misc', label: 'Divers' }
]

const defaultSettings: Omit<LootSettings, 'id' | 'campaignId'> = {
  minRarity: 'common',
  maxRarity: 'rare',
  maxItemValue: 1000,
  maxTotalValue: 5000,
  allowedCategories: [],
  bannedItemIds: []
}

export function LootConstraints({ campaignId, initialSettings }: LootConstraintsProps) {
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState<Omit<LootSettings, 'id' | 'campaignId'>>(
    initialSettings
      ? {
          minRarity: initialSettings.minRarity,
          maxRarity: initialSettings.maxRarity,
          maxItemValue: initialSettings.maxItemValue,
          maxTotalValue: initialSettings.maxTotalValue,
          allowedCategories: initialSettings.allowedCategories,
          bannedItemIds: initialSettings.bannedItemIds
        }
      : defaultSettings
  )

  const handleSave = () => {
    startTransition(async () => {
      await saveLootSettings(campaignId, settings)
    })
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  const toggleCategory = (category: ItemCategory) => {
    setSettings(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(category)
        ? prev.allowedCategories.filter(c => c !== category)
        : [...prev.allowedCategories, category]
    }))
  }

  const getRarityIndex = (rarity: ItemRarity) =>
    RARITIES.findIndex(r => r.value === rarity)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Contraintes de génération
        </CardTitle>
        <CardDescription>
          Définissez les règles pour la génération automatique de loot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rareté */}
        <div className="space-y-3">
          <Label>Plage de rareté</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Minimum</Label>
              <select
                value={settings.minRarity}
                onChange={(e) => {
                  const newMin = e.target.value as ItemRarity
                  setSettings(prev => ({
                    ...prev,
                    minRarity: newMin,
                    // Ajuster max si nécessaire
                    maxRarity: getRarityIndex(newMin) > getRarityIndex(prev.maxRarity)
                      ? newMin
                      : prev.maxRarity
                  }))
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {RARITIES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <span className="text-muted-foreground pt-5">→</span>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Maximum</Label>
              <select
                value={settings.maxRarity}
                onChange={(e) => {
                  const newMax = e.target.value as ItemRarity
                  setSettings(prev => ({
                    ...prev,
                    maxRarity: newMax,
                    // Ajuster min si nécessaire
                    minRarity: getRarityIndex(newMax) < getRarityIndex(prev.minRarity)
                      ? newMax
                      : prev.minRarity
                  }))
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {RARITIES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Visualisation de la plage */}
          <div className="flex gap-1">
            {RARITIES.map(r => {
              const isInRange =
                getRarityIndex(r.value) >= getRarityIndex(settings.minRarity) &&
                getRarityIndex(r.value) <= getRarityIndex(settings.maxRarity)
              return (
                <div
                  key={r.value}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    isInRange ? r.color : 'bg-muted'
                  )}
                  title={r.label}
                />
              )
            })}
          </div>
        </div>

        {/* Valeurs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxItemValue">Valeur max par objet</Label>
            <Input
              id="maxItemValue"
              type="number"
              value={settings.maxItemValue}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxItemValue: parseInt(e.target.value) || 0
              }))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Pieces d&apos;or maximum par objet</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTotalValue">Valeur totale max</Label>
            <Input
              id="maxTotalValue"
              type="number"
              value={settings.maxTotalValue}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxTotalValue: parseInt(e.target.value) || 0
              }))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Valeur totale du loot généré</p>
          </div>
        </div>

        {/* Catégories autorisées */}
        <div className="space-y-3">
          <Label>Catégories autorisées</Label>
          <p className="text-xs text-muted-foreground">
            Laissez vide pour autoriser toutes les catégories
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                type="button"
                variant={settings.allowedCategories.includes(cat.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4 mr-1" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LootConstraints
