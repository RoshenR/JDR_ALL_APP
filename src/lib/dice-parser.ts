// Parser pour les formules de dés (ex: "2d6+3", "1d20", "4d6-1")

export interface DiceResult {
  formula: string
  rolls: DieRoll[]
  modifier: number
  total: number
}

export interface DieRoll {
  sides: number
  count: number
  results: number[]
  subtotal: number
}

// Regex pour parser les formules de dés
// Supporte: 2d6, 1d20+5, 3d8-2, 2d6+1d4+3, etc.
const DICE_REGEX = /(\d+)d(\d+)/gi
const MODIFIER_REGEX = /[+-]\d+(?!d)/g

export function parseDiceFormula(formula: string): { dice: Array<{ count: number; sides: number }>; modifier: number } {
  const normalizedFormula = formula.replace(/\s/g, '').toLowerCase()

  // Extraire tous les dés
  const dice: Array<{ count: number; sides: number }> = []
  let match

  while ((match = DICE_REGEX.exec(normalizedFormula)) !== null) {
    dice.push({
      count: parseInt(match[1], 10),
      sides: parseInt(match[2], 10)
    })
  }

  // Extraire le modificateur total
  let modifier = 0
  const modifierMatches = normalizedFormula.match(MODIFIER_REGEX)
  if (modifierMatches) {
    modifier = modifierMatches.reduce((sum, mod) => sum + parseInt(mod, 10), 0)
  }

  return { dice, modifier }
}

export function rollDice(count: number, sides: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1)
  }
  return results
}

export function rollFormula(formula: string): DiceResult {
  const { dice, modifier } = parseDiceFormula(formula)

  const rolls: DieRoll[] = dice.map(die => {
    const results = rollDice(die.count, die.sides)
    return {
      sides: die.sides,
      count: die.count,
      results,
      subtotal: results.reduce((sum, r) => sum + r, 0)
    }
  })

  const diceTotal = rolls.reduce((sum, roll) => sum + roll.subtotal, 0)
  const total = diceTotal + modifier

  return {
    formula,
    rolls,
    modifier,
    total
  }
}

// Validation de formule
export function isValidDiceFormula(formula: string): boolean {
  if (!formula || formula.trim() === '') return false

  const normalizedFormula = formula.replace(/\s/g, '').toLowerCase()

  // Doit contenir au moins un dé
  if (!DICE_REGEX.test(normalizedFormula)) return false

  // Réinitialiser le regex
  DICE_REGEX.lastIndex = 0

  // Vérifier que les nombres sont raisonnables
  const { dice } = parseDiceFormula(normalizedFormula)
  for (const die of dice) {
    if (die.count < 1 || die.count > 100) return false
    if (die.sides < 2 || die.sides > 1000) return false
  }

  return true
}

// Formules prédéfinies
export const COMMON_DICE: Array<{ label: string; formula: string; icon?: string }> = [
  { label: 'd4', formula: '1d4', icon: '🎲' },
  { label: 'd6', formula: '1d6', icon: '🎲' },
  { label: 'd8', formula: '1d8', icon: '🎲' },
  { label: 'd10', formula: '1d10', icon: '🎲' },
  { label: 'd12', formula: '1d12', icon: '🎲' },
  { label: 'd20', formula: '1d20', icon: '🎲' },
  { label: 'd100', formula: '1d100', icon: '🎲' },
]

// Formatter le résultat pour affichage
export function formatDiceResult(result: DiceResult): string {
  const rollsStr = result.rolls
    .map(roll => {
      const diceStr = `${roll.count}d${roll.sides}`
      const resultsStr = roll.results.join(', ')
      return `${diceStr} [${resultsStr}]`
    })
    .join(' + ')

  const modifierStr = result.modifier !== 0
    ? (result.modifier > 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`)
    : ''

  return `${rollsStr}${modifierStr} = ${result.total}`
}

// Générer un résultat d'initiative (1d20 + modificateur)
export function rollInitiative(modifier: number = 0): DiceResult {
  return rollFormula(`1d20${modifier >= 0 ? '+' : ''}${modifier}`)
}

// Générer un jet d'attaque
export function rollAttack(modifier: number = 0, advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal'): DiceResult & { criticalHit?: boolean; criticalMiss?: boolean } {
  if (advantage === 'normal') {
    const result = rollFormula(`1d20${modifier >= 0 ? '+' : ''}${modifier}`)
    const d20Result = result.rolls[0]?.results[0] || 0
    return {
      ...result,
      criticalHit: d20Result === 20,
      criticalMiss: d20Result === 1
    }
  }

  // Advantage ou disadvantage: lancer 2d20
  const roll1 = Math.floor(Math.random() * 20) + 1
  const roll2 = Math.floor(Math.random() * 20) + 1
  const chosenRoll = advantage === 'advantage'
    ? Math.max(roll1, roll2)
    : Math.min(roll1, roll2)

  return {
    formula: `1d20${modifier >= 0 ? '+' : ''}${modifier} (${advantage})`,
    rolls: [{
      sides: 20,
      count: 2,
      results: [roll1, roll2],
      subtotal: chosenRoll
    }],
    modifier,
    total: chosenRoll + modifier,
    criticalHit: chosenRoll === 20,
    criticalMiss: chosenRoll === 1
  }
}

// Jet rapide sans enregistrement (pour preview)
export function quickRoll(formula: string): DiceResult | null {
  if (!isValidDiceFormula(formula)) return null
  return rollFormula(formula)
}
