'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { isValidDiceFormula } from '@/lib/dice-parser'
import { Plus, Minus, Dices } from 'lucide-react'

interface CustomRollInputProps {
  onRoll: (formula: string, label?: string) => void
  disabled?: boolean
}

export function CustomRollInput({ onRoll, disabled }: CustomRollInputProps) {
  const [open, setOpen] = useState(false)
  const [diceCount, setDiceCount] = useState(1)
  const [diceSides, setDiceSides] = useState(20)
  const [modifier, setModifier] = useState(0)
  const [label, setLabel] = useState('')

  const formula = `${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier}`

  const handleRoll = () => {
    onRoll(formula, label || undefined)
    setOpen(false)
    setLabel('')
  }

  const adjustValue = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    min: number = 1,
    max: number = 100
  ) => {
    setter(prev => Math.max(min, Math.min(max, prev + delta)))
  }

  const commonDice = [4, 6, 8, 10, 12, 20, 100]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Dices className="h-4 w-4 mr-2" />
          Personnaliser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jet personnalisé</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Sélection rapide du type de dé */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Type de dé
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonDice.map(sides => (
                <Button
                  key={sides}
                  variant={diceSides === sides ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiceSides(sides)}
                  className="font-mono"
                >
                  d{sides}
                </Button>
              ))}
            </div>
          </div>

          {/* Nombre de dés */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Nombre de dés
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setDiceCount, -1)}
                disabled={diceCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-20 text-center font-mono"
                min={1}
                max={100}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setDiceCount, 1)}
                disabled={diceCount >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Modificateur */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Modificateur
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setModifier, -1, -100, 100)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(Math.max(-100, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-20 text-center font-mono"
                min={-100}
                max={100}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setModifier, 1, -100, 100)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Label */}
          <div>
            <Label htmlFor="roll-label" className="text-sm text-muted-foreground mb-2 block">
              Description (optionnel)
            </Label>
            <Input
              id="roll-label"
              placeholder="Ex: Jet d'attaque"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Prévisualisation */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Formule</p>
            <p className="text-2xl font-bold font-mono">{formula}</p>
          </div>

          {/* Action */}
          <Button
            onClick={handleRoll}
            disabled={!isValidDiceFormula(formula)}
            className="w-full"
          >
            <Dices className="h-4 w-4 mr-2" />
            Lancer !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CustomRollInput
