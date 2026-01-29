'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GroupMessageList } from './GroupMessageList'
import { GroupChatInput } from './GroupChatInput'
import { useGroupChannel } from '@/hooks/usePusher'
import { getGroupMessages, type GroupMessageRecord, type GroupRecord } from '@/lib/actions/groups'
import { MessageSquare, Wifi, WifiOff, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GroupChatWindowProps {
  group: GroupRecord
  currentUserId: string
  currentUserRole: string
  currentUserColor: string | null
  initialMessages?: GroupMessageRecord[]
}

export function GroupChatWindow({
  group,
  currentUserId,
  currentUserRole,
  currentUserColor,
  initialMessages = []
}: GroupChatWindowProps) {
  const [messages, setMessages] = useState<GroupMessageRecord[]>(initialMessages)
  const [isConnected, setIsConnected] = useState(false)
  const { bind, channel } = useGroupChannel(group.id)

  useEffect(() => {
    const unbind = bind<GroupMessageRecord & { createdAt: string }>('chat-message', (data) => {
      const newMessage: GroupMessageRecord = {
        ...data,
        createdAt: new Date(data.createdAt)
      }

      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    })

    return unbind
  }, [bind])

  useEffect(() => {
    setIsConnected(!!channel)
  }, [channel])

  const handleMessageSent = useCallback((message: GroupMessageRecord) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev
      }
      return [...prev, message]
    })
  }, [])

  const loadMoreMessages = async () => {
    const oldestMessage = messages[0]
    if (!oldestMessage) return

    const olderMessages = await getGroupMessages(group.id, {
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
            {group.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Wifi className="h-4 w-4" />
                En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <WifiOff className="h-4 w-4" />
                Hors ligne
              </span>
            )}

            <div className="flex items-center gap-1 ml-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.memberCount}
              </span>

              {group.isAdmin && (
                <Link href={`/groups/${group.id}/settings`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <GroupMessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onLoadMore={loadMoreMessages}
        />
        <GroupChatInput
          groupId={group.id}
          currentUserColor={currentUserColor}
          onMessageSent={handleMessageSent}
        />
      </CardContent>
    </Card>
  )
}

export default GroupChatWindow
