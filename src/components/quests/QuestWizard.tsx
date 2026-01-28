'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { ObjectiveEditor } from './ObjectiveEditor'
import { RewardEditor } from './RewardEditor'
import { createQuest } from '@/lib/actions/quests'
import {
  QUEST_TEMPLATES,
  generateObjectiveId,
  type QuestObjective,
  type QuestRewards,
  type QuestDifficulty,
  type QuestType
} from '@/lib/quest-utils'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Scroll,
  MapPin,
  User,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestWizardProps {
  campaignId: string
}

type WizardStep = 'template' | 'basics' | 'objectives' | 'rewards' | 'review'

const STEPS: Array<{ id: WizardStep; label: string; icon: typeof Scroll }> = [
  { id: 'template', label: 'Modèle', icon: Sparkles },
  { id: 'basics', label: 'Informations', icon: Scroll },
  { id: 'objectives', label: 'Objectifs', icon: Check },
  { id: 'rewards', label: 'Récompenses', icon: Sparkles },
  { id: 'review', label: 'Révision', icon: Check }
]

const DIFFICULTIES: Array<{ value: QuestDifficulty; label: string; description: string }> = [
  { value: 'easy', label: 'Facile', description: 'Pour les aventuriers débutants' },
  { value: 'medium', label: 'Moyen', description: 'Défi équilibré' },
  { value: 'hard', label: 'Difficile', description: 'Pour les aventuriers expérimentés' },
  { value: 'deadly', label: 'Mortel', description: 'Risque de mort élevé' }
]

const QUEST_TYPES: Array<{ value: QuestType; label: string }> = [
  { value: 'fetch', label: 'Récupération' },
  { value: 'escort', label: 'Escorte' },
  { value: 'kill', label: 'Élimination' },
  { value: 'explore', label: 'Exploration' },
  { value: 'mystery', label: 'Enquête' },
  { value: 'other', label: 'Autre' }
]

export function QuestWizard({ campaignId }: QuestWizardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<WizardStep>('template')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questType, setQuestType] = useState<QuestType | null>(null)
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium')
  const [location, setLocation] = useState('')
  const [npcGiver, setNpcGiver] = useState('')
  const [objectives, setObjectives] = useState<QuestObjective[]>([])
  const [rewards, setRewards] = useState<QuestRewards>({})

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'template':
        return true
      case 'basics':
        return title.trim() && description.trim()
      case 'objectives':
        return objectives.length > 0
      case 'rewards':
        return true
      case 'review':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  const applyTemplate = (templateIndex: number) => {
    const template = QUEST_TEMPLATES[templateIndex]
    setQuestType(template.type)
    setDescription(template.description)
    setObjectives(
      template.objectives.map(o => ({
        ...o,
        id: generateObjectiveId()
      }))
    )
    goNext()
  }

  const handleSubmit = (asDraft: boolean) => {
    startTransition(async () => {
      await createQuest({
        title,
        description,
        objectives,
        rewards,
        difficulty,
        questType: questType || undefined,
        location: location || undefined,
        npcGiver: npcGiver || undefined,
        campaignId,
        status: asDraft ? 'draft' : 'active'
      })
      router.push(`/campaigns/${campaignId}/quests`)
      router.refresh()
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isPast = index < currentStepIndex

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isPast && setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isPast && 'text-primary hover:bg-primary/10 cursor-pointer',
                  !isActive && !isPast && 'text-muted-foreground'
                )}
                disabled={!isPast && !isActive}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive && 'bg-primary-foreground text-primary',
                  isPast && 'bg-primary text-primary-foreground',
                  !isActive && !isPast && 'bg-muted'
                )}>
                  {isPast ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <Card>
        {/* Template step */}
        {currentStep === 'template' && (
          <>
            <CardHeader>
              <CardTitle>Choisir un modèle</CardTitle>
              <CardDescription>
                Commencez avec un modèle ou créez une quête personnalisée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {QUEST_TEMPLATES.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start text-left"
                    onClick={() => applyTemplate(index)}
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {template.description}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={goNext}>
                Créer une quête personnalisée
              </Button>
            </CardContent>
          </>
        )}

        {/* Basics step */}
        {currentStep === 'basics' && (
          <>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Décrivez votre quête
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Le mystère de la forêt enchantée"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez la quête, son contexte et ses enjeux..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type de quête</Label>
                  <select
                    value={questType || ''}
                    onChange={(e) => setQuestType(e.target.value as QuestType || null)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Non défini</option>
                    {QUEST_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulté</Label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Lieu
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Forêt de Brocéliande"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npcGiver" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Donneur de quête
                  </Label>
                  <Input
                    id="npcGiver"
                    value={npcGiver}
                    onChange={(e) => setNpcGiver(e.target.value)}
                    placeholder="Eldric le Sage"
                  />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Objectives step */}
        {currentStep === 'objectives' && (
          <>
            <CardHeader>
              <CardTitle>Objectifs</CardTitle>
              <CardDescription>
                Définissez les objectifs de la quête
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectiveEditor
                objectives={objectives}
                onChange={setObjectives}
              />
            </CardContent>
          </>
        )}

        {/* Rewards step */}
        {currentStep === 'rewards' && (
          <>
            <CardHeader>
              <CardTitle>Récompenses</CardTitle>
              <CardDescription>
                Définissez les récompenses de la quête
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RewardEditor
                rewards={rewards}
                onChange={setRewards}
              />
            </CardContent>
          </>
        )}

        {/* Review step */}
        {currentStep === 'review' && (
          <>
            <CardHeader>
              <CardTitle>Révision</CardTitle>
              <CardDescription>
                Vérifiez les détails de votre quête avant de la créer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>

                <div className="flex flex-wrap gap-2 text-sm">
                  {questType && (
                    <span className="px-2 py-1 bg-muted rounded">
                      {QUEST_TYPES.find(t => t.value === questType)?.label}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-muted rounded">
                    {DIFFICULTIES.find(d => d.value === difficulty)?.label}
                  </span>
                  {location && (
                    <span className="px-2 py-1 bg-muted rounded flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                  {npcGiver && (
                    <span className="px-2 py-1 bg-muted rounded flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {npcGiver}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Objectifs ({objectives.length})</h4>
                  <ul className="space-y-1 text-sm">
                    {objectives.map(o => (
                      <li key={o.id} className="flex items-center gap-2">
                        <span className={o.isOptional ? 'text-amber-600' : ''}>
                          {o.isOptional ? '◇' : '•'}
                        </span>
                        {o.description}
                      </li>
                    ))}
                  </ul>
                </div>

                {(rewards.gold || rewards.xp || rewards.items?.length || rewards.other) && (
                  <div>
                    <h4 className="font-medium mb-2">Récompenses</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {rewards.gold && <span className="px-2 py-1 bg-amber-500/10 rounded">{rewards.gold} or</span>}
                      {rewards.xp && <span className="px-2 py-1 bg-purple-500/10 rounded">{rewards.xp} XP</span>}
                      {rewards.items?.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-500/10 rounded">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                      {rewards.other && <span className="px-2 py-1 bg-muted rounded">{rewards.other}</span>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStepIndex === 0 || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {currentStep === 'review' ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
              >
                Enregistrer comme brouillon
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Publier la quête
              </Button>
            </div>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canProceed() || isPending}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default QuestWizard
