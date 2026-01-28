'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateObjectiveId, type QuestObjective } from '@/lib/quest-utils'
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ObjectiveEditorProps {
  objectives: QuestObjective[]
  onChange: (objectives: QuestObjective[]) => void
  disabled?: boolean
}

export function ObjectiveEditor({ objectives, onChange, disabled }: ObjectiveEditorProps) {
  const [newObjective, setNewObjective] = useState('')
  const [isOptional, setIsOptional] = useState(false)

  const addObjective = () => {
    if (!newObjective.trim()) return

    const objective: QuestObjective = {
      id: generateObjectiveId(),
      description: newObjective.trim(),
      isCompleted: false,
      isOptional
    }

    onChange([...objectives, objective])
    setNewObjective('')
    setIsOptional(false)
  }

  const removeObjective = (id: string) => {
    onChange(objectives.filter(o => o.id !== id))
  }

  const toggleCompleted = (id: string) => {
    onChange(
      objectives.map(o =>
        o.id === id ? { ...o, isCompleted: !o.isCompleted } : o
      )
    )
  }

  const toggleOptional = (id: string) => {
    onChange(
      objectives.map(o =>
        o.id === id ? { ...o, isOptional: !o.isOptional } : o
      )
    )
  }

  const updateDescription = (id: string, description: string) => {
    onChange(
      objectives.map(o =>
        o.id === id ? { ...o, description } : o
      )
    )
  }

  const moveObjective = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= objectives.length) return

    const newObjectives = [...objectives]
    const [moved] = newObjectives.splice(index, 1)
    newObjectives.splice(newIndex, 0, moved)
    onChange(newObjectives)
  }

  return (
    <div className="space-y-4">
      <Label>Objectifs</Label>

      {/* Liste des objectifs */}
      <div className="space-y-2">
        {objectives.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
            Aucun objectif. Ajoutez-en un ci-dessous.
          </p>
        ) : (
          objectives.map((objective, index) => (
            <div
              key={objective.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border bg-background',
                objective.isCompleted && 'bg-muted/50'
              )}
            >
              {/* Drag handle */}
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => moveObjective(index, 'up')}
                  disabled={disabled || index === 0}
                >
                  <span className="sr-only">Monter</span>
                  <span className="text-xs">&#9650;</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => moveObjective(index, 'down')}
                  disabled={disabled || index === objectives.length - 1}
                >
                  <span className="sr-only">Descendre</span>
                  <span className="text-xs">&#9660;</span>
                </Button>
              </div>

              {/* Checkbox */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => toggleCompleted(objective.id)}
                disabled={disabled}
              >
                {objective.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>

              {/* Description */}
              <Input
                value={objective.description}
                onChange={(e) => updateDescription(objective.id, e.target.value)}
                disabled={disabled}
                className={cn(
                  'flex-1',
                  objective.isCompleted && 'line-through text-muted-foreground'
                )}
              />

              {/* Optionnel */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleOptional(objective.id)}
                disabled={disabled}
                className={cn(
                  'shrink-0',
                  objective.isOptional && 'text-amber-600'
                )}
                title={objective.isOptional ? 'Optionnel' : 'Obligatoire'}
              >
                <Star className={cn(
                  'h-4 w-4',
                  objective.isOptional ? 'fill-amber-500' : ''
                )} />
              </Button>

              {/* Supprimer */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive"
                onClick={() => removeObjective(objective.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Ajouter un objectif */}
      <div className="flex gap-2">
        <Input
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          placeholder="Nouvel objectif..."
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addObjective()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOptional(!isOptional)}
          className={cn(isOptional && 'bg-amber-500/20')}
          title="Marquer comme optionnel"
        >
          <Star className={cn('h-4 w-4', isOptional && 'fill-amber-500 text-amber-600')} />
        </Button>
        <Button
          type="button"
          onClick={addObjective}
          disabled={disabled || !newObjective.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        <Star className="h-3 w-3 inline fill-amber-500 text-amber-600" /> = Objectif optionnel
      </p>
    </div>
  )
}

export default ObjectiveEditor
