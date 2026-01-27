'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateSession, deleteSession } from '@/lib/actions/campaigns'
import { formatDate } from '@/lib/utils'
import type { Session } from '@/types'
import { Trash2 } from 'lucide-react'

interface SessionNotesProps {
  session: Session
}

export function SessionNotes({ session }: SessionNotesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(session.title)
  const [date, setDate] = useState(
    session.date ? new Date(session.date).toISOString().split('T')[0] : ''
  )
  const [summary, setSummary] = useState(session.summary || '')
  const [notes, setNotes] = useState(session.notes || '')

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateSession(session.id, {
        title,
        date: date || null,
        summary,
        notes,
      })
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette session ?')) return
    try {
      await deleteSession(session.id)
      router.push(`/campaigns/${session.campaignId}`)
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-title">Titre</Label>
              <Input
                id="session-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-date">Date</Label>
              <Input
                id="session-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-summary">Résumé</Label>
            <Textarea
              id="session-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Résumé de la session..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Éditer</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes détaillées de la session..."
                rows={15}
                className="font-mono"
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 min-h-[300px]">
                {notes ? (
                  <ReactMarkdown>{notes}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">Aucune note</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" /> Supprimer
        </Button>
      </div>
    </div>
  )
}
