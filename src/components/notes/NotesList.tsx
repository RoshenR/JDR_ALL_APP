'use client'

import { useState } from 'react'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, FileText } from 'lucide-react'
import { type NoteCategory } from '@/lib/actions/notes'

interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory | null
  isPinned: boolean
  updatedAt: Date
}

interface NotesListProps {
  characterId: string
  notes: Note[]
  canEdit: boolean
}

export function NotesList({ characterId, notes, canEdit }: NotesListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      setEditingNote(note)
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-1 h-4 w-4" /> Nouvelle note
          </Button>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucune note</p>
          {canEdit && (
            <p className="text-sm mt-1">
              Créez votre première note
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              characterId={characterId}
              canEdit={canEdit}
              onEdit={handleEditNote}
            />
          ))}
        </div>
      )}

      {/* Create Note Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
          </DialogHeader>
          <NoteForm
            characterId={characterId}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm
              characterId={characterId}
              note={editingNote}
              onSuccess={() => setEditingNote(null)}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
