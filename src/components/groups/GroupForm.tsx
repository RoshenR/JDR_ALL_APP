'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createGroup, updateGroup, type GroupRecord } from '@/lib/actions/groups'
import { Loader2, Save, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupFormProps {
  group?: GroupRecord
  mode: 'create' | 'edit'
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { value: 'emerald', label: 'Vert', class: 'bg-emerald-500' },
  { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'amber', label: 'Ambre', class: 'bg-amber-500' },
]

export function GroupForm({ group, mode }: GroupFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [iconUrl, setIconUrl] = useState(group?.iconUrl || '')
  const [color, setColor] = useState(group?.color || 'blue')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createGroup({
          name,
          description: description || undefined,
          iconUrl: iconUrl || undefined,
          color
        })

        if (result.success) {
          router.push(`/groups/${result.group.id}`)
        } else {
          setError(result.error)
        }
      } else if (group) {
        const result = await updateGroup(group.id, {
          name,
          description: description || undefined,
          iconUrl: iconUrl || undefined,
          color
        })

        if (result.success) {
          router.push(`/groups/${group.id}`)
        } else {
          setError(result.error)
        }
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Nouveau groupe' : 'Modifier le groupe'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Créez un groupe de discussion indépendant des campagnes'
            : 'Modifiez les informations du groupe'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom du groupe *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Équipe Donjons"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du groupe (optionnel)"
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconUrl">URL de l'icône</Label>
            <Input
              id="iconUrl"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
              disabled={isPending}
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur du groupe</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    option.class,
                    color === option.value
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  )}
                  title={option.label}
                  disabled={isPending}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : mode === 'create' ? (
                <Plus className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === 'create' ? 'Créer le groupe' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default GroupForm
