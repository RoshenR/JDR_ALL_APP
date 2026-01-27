'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  SortDesc,
  Skull,
  Heart,
  Shield,
  Trash2,
  UserPlus
} from 'lucide-react'
import {
  addParticipant,
  updateParticipant,
  removeParticipant,
  nextTurn,
  previousTurn,
  sortByInitiative,
  resetCombat,
  updateCombat,
  addCharacterToCombat
} from '@/lib/actions/combat'
import { ParticipantRow } from './ParticipantRow'

interface Participant {
  id: string
  name: string
  initiative: number
  currentHp: number
  maxHp: number
  armorClass: number | null
  isNpc: boolean
  isActive: boolean
  conditions: string[]
  notes: string | null
  order: number
}

interface Combat {
  id: string
  name: string
  description: string | null
  isActive: boolean
  currentRound: number
  currentTurn: number
  participants: Participant[]
}

interface CombatTrackerProps {
  combat: Combat
  characters: Array<{ id: string; name: string }>
  isMJ?: boolean
}

export function CombatTracker({ combat, characters, isMJ = false }: CombatTrackerProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    initiative: 0,
    currentHp: 10,
    maxHp: 10,
    armorClass: 10,
    isNpc: true
  })
  const [importInitiative, setImportInitiative] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState('')

  const activeParticipants = combat.participants.filter(p => p.isActive)
  const currentParticipant = activeParticipants[combat.currentTurn]

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    await addParticipant(combat.id, newParticipant)
    setNewParticipant({
      name: '',
      initiative: 0,
      currentHp: 10,
      maxHp: 10,
      armorClass: 10,
      isNpc: true
    })
    setAddDialogOpen(false)
    router.refresh()
  }

  const handleImportCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCharacter) {
      await addCharacterToCombat(combat.id, selectedCharacter, importInitiative)
      setSelectedCharacter('')
      setImportInitiative(0)
      setImportDialogOpen(false)
      router.refresh()
    }
  }

  const handleNextTurn = async () => {
    await nextTurn(combat.id)
    router.refresh()
  }

  const handlePreviousTurn = async () => {
    await previousTurn(combat.id)
    router.refresh()
  }

  const handleSortByInitiative = async () => {
    await sortByInitiative(combat.id)
    router.refresh()
  }

  const handleResetCombat = async () => {
    if (confirm('Réinitialiser le combat ? Les PV seront restaurés et les conditions retirées.')) {
      await resetCombat(combat.id)
      router.refresh()
    }
  }

  const handleEndCombat = async () => {
    if (confirm('Terminer ce combat ?')) {
      await updateCombat(combat.id, { isActive: false })
      router.refresh()
    }
  }

  const handleUpdateHp = async (id: string, delta: number) => {
    const participant = combat.participants.find(p => p.id === id)
    if (!participant) return
    const newHp = Math.max(0, Math.min(participant.maxHp, participant.currentHp + delta))
    await updateParticipant(id, { currentHp: newHp })
    router.refresh()
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateParticipant(id, { isActive })
    router.refresh()
  }

  const handleUpdateInitiative = async (id: string, initiative: number) => {
    await updateParticipant(id, { initiative })
    router.refresh()
  }

  const handleRemoveParticipant = async (id: string) => {
    if (confirm('Retirer ce participant du combat ?')) {
      await removeParticipant(id)
      router.refresh()
    }
  }

  const handleUpdateConditions = async (id: string, conditions: string[]) => {
    await updateParticipant(id, { conditions })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Combat Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Round {combat.currentRound}
                {currentParticipant && (
                  <span className="text-primary">- Tour de {currentParticipant.name}</span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {activeParticipants.length} participants actifs
              </p>
            </div>
            {isMJ && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousTurn}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={handleNextTurn}>
                  Tour suivant <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {isMJ && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-4 w-4" /> Ajouter PNJ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un participant</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddParticipant} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                        placeholder="Gobelin 1"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Initiative</Label>
                        <Input
                          type="number"
                          value={newParticipant.initiative}
                          onChange={(e) => setNewParticipant({ ...newParticipant, initiative: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CA</Label>
                        <Input
                          type="number"
                          value={newParticipant.armorClass}
                          onChange={(e) => setNewParticipant({ ...newParticipant, armorClass: parseInt(e.target.value) || 10 })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PV actuels</Label>
                        <Input
                          type="number"
                          value={newParticipant.currentHp}
                          onChange={(e) => setNewParticipant({ ...newParticipant, currentHp: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PV max</Label>
                        <Input
                          type="number"
                          value={newParticipant.maxHp}
                          onChange={(e) => setNewParticipant({ ...newParticipant, maxHp: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Ajouter</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-1 h-4 w-4" /> Importer PJ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importer un personnage</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleImportCharacter} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Personnage</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {characters.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Initiative</Label>
                      <Input
                        type="number"
                        value={importInitiative}
                        onChange={(e) => setImportInitiative(parseInt(e.target.value) || 0)}
                        placeholder="Jet d'initiative"
                      />
                    </div>
                    <Button type="submit" className="w-full">Importer</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleSortByInitiative}>
                <SortDesc className="mr-1 h-4 w-4" /> Trier par initiative
              </Button>

              <Button variant="outline" size="sm" onClick={handleResetCombat}>
                <RotateCcw className="mr-1 h-4 w-4" /> Réinitialiser
              </Button>

              {combat.isActive && (
                <Button variant="destructive" size="sm" onClick={handleEndCombat}>
                  Terminer le combat
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Ordre d&apos;initiative</CardTitle>
        </CardHeader>
        <CardContent>
          {combat.participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun participant. Ajoutez des personnages ou des PNJ pour commencer.
            </p>
          ) : (
            <div className="space-y-2">
              {combat.participants.map((participant, index) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  isCurrentTurn={activeParticipants[combat.currentTurn]?.id === participant.id}
                  onUpdateHp={handleUpdateHp}
                  onToggleActive={handleToggleActive}
                  onUpdateInitiative={handleUpdateInitiative}
                  onRemove={handleRemoveParticipant}
                  onUpdateConditions={handleUpdateConditions}
                  isMJ={isMJ}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
