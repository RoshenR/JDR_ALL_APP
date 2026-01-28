'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useCampaignChannel } from '@/hooks/usePusher'
import { getCampaignMessages, type ChatMessageRecord } from '@/lib/actions/chat'
import { MessageSquare, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatWindowProps {
  campaignId: string
  currentUserId: string
  currentUserRole: string
  currentUserColor: string | null
  participants: Array<{ id: string; name: string; role: string }>
  initialMessages?: ChatMessageRecord[]
}

export function ChatWindow({
  campaignId,
  currentUserId,
  currentUserRole,
  currentUserColor,
  participants,
  initialMessages = []
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageRecord[]>(initialMessages)
  const [isConnected, setIsConnected] = useState(false)
  const { bind, channel } = useCampaignChannel(campaignId)

  // Écouter les nouveaux messages
  useEffect(() => {
    const unbind = bind<ChatMessageRecord & { createdAt: string }>('chat-message', (data) => {
      const newMessage: ChatMessageRecord = {
        ...data,
        createdAt: new Date(data.createdAt)
      }

      // Vérifier si le message nous concerne (pour les messages privés)
      const isMJ = currentUserRole === 'MJ'
      const isForMe = !newMessage.recipientId ||
                      newMessage.recipientId === currentUserId ||
                      newMessage.senderId === currentUserId ||
                      isMJ

      if (isForMe) {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === newMessage.id)) {
            return prev
          }
          return [...prev, newMessage]
        })
      }
    })

    return unbind
  }, [bind, currentUserId, currentUserRole])

  // Surveiller la connexion
  useEffect(() => {
    setIsConnected(!!channel)
  }, [channel])

  // Callback pour ajouter un message localement (optimistic update)
  const handleMessageSent = useCallback((message: ChatMessageRecord) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev
      }
      return [...prev, message]
    })
  }, [])

  // Charger plus de messages
  const loadMoreMessages = async () => {
    const oldestMessage = messages[0]
    if (!oldestMessage) return

    const olderMessages = await getCampaignMessages(campaignId, {
      limit: 50,
      before: oldestMessage.id
    })

    setMessages(prev => [...olderMessages, ...prev])
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Chat de campagne
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <WifiOff className="h-4 w-4" />
                Hors ligne
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onLoadMore={loadMoreMessages}
        />
        <ChatInput
          campaignId={campaignId}
          participants={participants}
          currentUserId={currentUserId}
          currentUserColor={currentUserColor}
          onMessageSent={handleMessageSent}
        />
      </CardContent>
    </Card>
  )
}

export default ChatWindow
