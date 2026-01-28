'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Users, MapPin, HelpCircle } from 'lucide-react'
import { createNote, updateNote, type NoteCategory } from '@/lib/actions/notes'

interface NoteFormProps {
  characterId: string
  note?: {
    id: string
    title: string
    content: string
    category: NoteCategory | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

const categories: { value: NoteCategory; label: string; icon: typeof FileText }[] = [
  { value: 'quest', label: 'Quête', icon: FileText },
  { value: 'npc', label: 'PNJ', icon: Users },
  { value: 'location', label: 'Lieu', icon: MapPin },
  { value: 'other', label: 'Autre', icon: HelpCircle }
]

export function NoteForm({ characterId, note, onSuccess, onCancel }: NoteFormProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState<NoteCategory | ''>(note?.category || '')
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!note

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }

    if (!content.trim()) {
      setError('Le contenu est requis')
      return
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateNote(note.id, {
            title: title.trim(),
            content: content.trim(),
            category: category || null
          })
        } else {
          await createNote(characterId, {
            title: title.trim(),
            content: content.trim(),
            category: category || undefined
          })
        }
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm">Titre *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la note"
          disabled={isPending}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Catégorie</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content" className="text-sm">Contenu *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenu de la note..."
          rows={5}
          disabled={isPending}
          className="resize-none"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto sm:ml-auto"
        >
          {isPending ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
