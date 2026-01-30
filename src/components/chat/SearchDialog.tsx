'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Loader2 } from 'lucide-react'
import { searchMessages } from '@/lib/actions/chat'
import type { ChatMessageRecord } from '@/lib/chat-types'
import { cn } from '@/lib/utils'

interface SearchDialogProps {
  campaignId: string
  onSelectMessage?: (messageId: string) => void
  className?: string
}

export function SearchDialog({
  campaignId,
  onSelectMessage,
  className
}: SearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChatMessageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const messages = await searchMessages(campaignId, query)
      setResults(messages)
    } finally {
      setLoading(false)
    }
  }, [campaignId, query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectMessage = (messageId: string) => {
    onSelectMessage?.(messageId)
    setOpen(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text

    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className} title="Rechercher">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Rechercher dans le chat</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Rechercher un message..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    'hover:bg-muted/50'
                  )}
                  onClick={() => handleSelectMessage(message.id)}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-medium">{message.senderName}</span>
                    <span>•</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="text-sm">
                    {highlightMatch(message.content, query)}
                  </p>
                </div>
              ))}
            </div>
          ) : searched ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Entrez votre recherche</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchDialog
