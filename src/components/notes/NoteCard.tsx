'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pin, PinOff, Edit, Trash2, FileText, Users, MapPin, HelpCircle } from 'lucide-react'
import { togglePinNote, deleteNote, type NoteCategory } from '@/lib/actions/notes'
import { useTransition } from 'react'

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    category: NoteCategory | null
    isPinned: boolean
    updatedAt: Date
  }
  characterId: string
  canEdit: boolean
  onEdit?: (id: string) => void
}

const categoryConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  quest: { label: 'Quête', icon: FileText, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  npc: { label: 'PNJ', icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  location: { label: 'Lieu', icon: MapPin, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  other: { label: 'Autre', icon: HelpCircle, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' }
}

export function NoteCard({ note, characterId, canEdit, onEdit }: NoteCardProps) {
  const [isPending, startTransition] = useTransition()

  const category = note.category ? categoryConfig[note.category] : null
  const CategoryIcon = category?.icon || FileText

  const handleTogglePin = () => {
    startTransition(async () => {
      await togglePinNote(note.id)
    })
  }

  const handleDelete = () => {
    if (confirm('Supprimer cette note ?')) {
      startTransition(async () => {
        await deleteNote(note.id)
      })
    }
  }

  return (
    <Card className={`relative transition-all hover:shadow-md active:scale-[0.98] ${note.isPinned ? 'ring-2 ring-primary/30 bg-primary/5' : ''} ${isPending ? 'opacity-50' : ''}`}>
      {note.isPinned && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
          <Pin className="h-3 w-3" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm sm:text-base truncate">{note.title}</h4>
            </div>
          </div>

          {/* Category badge */}
          {category && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
              <CategoryIcon className="h-3 w-3" />
              {category.label}
            </span>
          )}

          {/* Content preview */}
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {note.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
            </span>
            {canEdit && (
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTogglePin}
                  disabled={isPending}
                  className="h-8 w-8"
                >
                  {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(note.id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
