'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { generateLootWithConstraints } from '@/lib/actions/loot'
import { Sparkles, Package, Plus, Minus } from 'lucide-react'

interface LootGeneratorProps {
  campaignId: string
}

const SOURCES = [
  { value: 'enemy', label: 'Ennemi vaincu' },
  { value: 'chest', label: 'Coffre' },
  { value: 'reward', label: 'Récompense de quête' },
  { value: 'shop', label: 'Boutique' },
  { value: 'other', label: 'Autre' }
]

export function LootGenerator({ campaignId }: LootGeneratorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [itemCount, setItemCount] = useState(3)
  const [source, setSource] = useState('enemy')
  const [customSource, setCustomSource] = useState('')

  const handleGenerate = () => {
    startTransition(async () => {
      const sourceText = source === 'other' ? customSource : SOURCES.find(s => s.value === source)?.label
      await generateLootWithConstraints(campaignId, {
        count: itemCount,
        source: sourceText
      })
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Générer du loot
        </CardTitle>
        <CardDescription>
          Génère du loot aléatoire selon les contraintes définies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nombre d'objets */}
        <div className="space-y-2">
          <Label>Nombre d&apos;objets</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setItemCount(Math.max(1, itemCount - 1))}
              disabled={itemCount <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
              min={1}
              max={10}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setItemCount(Math.min(10, itemCount + 1))}
              disabled={itemCount >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label>Source du loot</Label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {source === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="customSource">Source personnalisée</Label>
            <Input
              id="customSource"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Ex: Trésor du dragon"
            />
          </div>
        )}

        {/* Bouton de génération */}
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full"
        >
          <Package className="h-4 w-4 mr-2" />
          {isPending ? 'Génération...' : 'Générer le loot'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default LootGenerator
