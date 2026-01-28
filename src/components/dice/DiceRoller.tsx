'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dice3D } from './Dice3D'
import { RollHistory, RollRecord } from './RollHistory'
import { COMMON_DICE, isValidDiceFormula, parseDiceFormula } from '@/lib/dice-parser'
import { rollDice, DiceRollRecord } from '@/lib/actions/dice'
import { Dices, Lock, Unlock, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiceRollerProps {
  campaignId?: string
  initialHistory?: DiceRollRecord[]
  onRoll?: (roll: DiceRollRecord) => void
}

export function DiceRoller({ campaignId, initialHistory = [], onRoll }: DiceRollerProps) {
  const [formula, setFormula] = useState('')
  const [label, setLabel] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<{
    results: number[]
    total: number
    sides: number
  } | null>(null)
  const [history, setHistory] = useState<RollRecord[]>(
    initialHistory.map(r => ({
      id: r.id,
      formula: r.formula,
      results: r.results,
      total: r.total,
      label: r.label,
      isPrivate: r.isPrivate,
      userName: r.userName,
      createdAt: r.createdAt
    }))
  )
  const [isPending, startTransition] = useTransition()

  const handleRoll = async (rollFormula: string) => {
    if (!isValidDiceFormula(rollFormula)) return

    setIsRolling(true)

    // Parser pour déterminer le type de dé principal
    const { dice } = parseDiceFormula(rollFormula)
    const mainDie = dice[0] || { sides: 6 }

    startTransition(async () => {
      const result = await rollDice({
        formula: rollFormula,
        label: label || undefined,
        isPrivate,
        campaignId
      })

      if (result.success) {
        const roll = result.roll
        setCurrentResult({
          results: roll.results,
          total: roll.total,
          sides: mainDie.sides
        })

        // Ajouter à l'historique local
        const historyRecord: RollRecord = {
          id: roll.id,
          formula: roll.formula,
          results: roll.results,
          total: roll.total,
          label: roll.label,
          isPrivate: roll.isPrivate,
          userName: roll.userName,
          createdAt: roll.createdAt
        }

        setHistory(prev => [historyRecord, ...prev].slice(0, 50))
        onRoll?.(roll)

        // Arrêter l'animation après un délai
        setTimeout(() => {
          setIsRolling(false)
        }, 1500)
      } else {
        setIsRolling(false)
      }
    })
  }

  const handleCustomRoll = () => {
    if (formula.trim()) {
      handleRoll(formula)
      setFormula('')
      setLabel('')
    }
  }

  const handleQuickRoll = (quickFormula: string) => {
    handleRoll(quickFormula)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Panneau de lancement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            Lanceur de dés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualisation 3D */}
          <div className="flex justify-center items-center h-40 bg-gradient-to-b from-muted/50 to-muted rounded-lg">
            {currentResult ? (
              <div className="flex items-center gap-4">
                <Dice3D
                  result={currentResult.results[0] || 1}
                  isRolling={isRolling}
                  sides={currentResult.sides}
                  size={120}
                />
                {!isRolling && (
                  <div className="text-center">
                    <div className="text-4xl font-bold">{currentResult.total}</div>
                    <div className="text-sm text-muted-foreground">
                      [{currentResult.results.join(', ')}]
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                <Dices className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cliquez sur un dé pour lancer</p>
              </div>
            )}
          </div>

          {/* Dés rapides */}
          <div className="grid grid-cols-4 gap-2">
            {COMMON_DICE.map(die => (
              <Button
                key={die.formula}
                variant="outline"
                size="sm"
                onClick={() => handleQuickRoll(die.formula)}
                disabled={isRolling || isPending}
                className="font-mono"
              >
                {die.label}
              </Button>
            ))}
          </div>

          {/* Formule personnalisée */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Formule (ex: 2d6+3)"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomRoll()}
                className="font-mono"
              />
              <Button
                onClick={handleCustomRoll}
                disabled={!isValidDiceFormula(formula) || isRolling || isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Label (optionnel)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPrivate(!isPrivate)}
                title={isPrivate ? 'Jet privé (MJ seulement)' : 'Jet public'}
                className={cn(isPrivate && 'bg-amber-500/20')}
              >
                {isPrivate ? (
                  <Lock className="h-4 w-4 text-amber-600" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Formules utiles */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Formules utiles :</p>
            <div className="flex flex-wrap gap-2">
              {['2d6', '1d20+5', '4d6', '1d100', '2d10+2'].map(f => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormula(f)}
                  className="text-xs font-mono h-7"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique */}
      <RollHistory history={history} />
    </div>
  )
}

export default DiceRoller
