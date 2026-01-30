'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GroupMessageList } from './GroupMessageList'
import { GroupChatInput } from './GroupChatInput'
import { PinnedMessagesBar } from '@/components/chat/PinnedMessagesBar'
import { SearchDialog } from '@/components/chat/SearchDialog'
import { useGroupChannel } from '@/hooks/usePusher'
import {
  getGroupMessages,
  getGroupPinnedMessages,
  addGroupReaction,
  removeGroupReaction,
  pinGroupMessage,
  unpinGroupMessage,
  searchGroupMessages
} from '@/lib/actions/groups'
import type {
  GroupMessageRecord,
  GroupRecord,
  ReplyInfo,
  ReactionEmoji,
  ReactionRecord
} from '@/lib/group-types'
import { MessageSquare, Wifi, WifiOff, Settings, Users, Search } from 'lucide-react'
import Link from 'next/link'

interface TypingUser {
  userId: string
  userName: string
}

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
  const [pinnedMessages, setPinnedMessages] = useState<GroupMessageRecord[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReplyInfo | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | undefined>()
  const { bind, channel } = useGroupChannel(group.id)

  const isAdmin = group.isAdmin

  // Load pinned messages
  useEffect(() => {
    async function loadPinned() {
      const pinned = await getGroupPinnedMessages(group.id)
      setPinnedMessages(pinned)
    }
    loadPinned()
  }, [group.id])

  // Listen for new messages
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

  // Listen for reactions
  useEffect(() => {
    const unbindAdd = bind<{ messageId: string; reaction: ReactionRecord }>('reaction-added', (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          if (m.reactions.some(r => r.id === data.reaction.id)) {
            return m
          }
          return { ...m, reactions: [...m.reactions, data.reaction] }
        }
        return m
      }))
    })

    const unbindRemove = bind<{ messageId: string; emoji: ReactionEmoji; userId: string }>('reaction-removed', (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return {
            ...m,
            reactions: m.reactions.filter(r => !(r.emoji === data.emoji && r.userId === data.userId))
          }
        }
        return m
      }))
    })

    return () => {
      unbindAdd()
      unbindRemove()
    }
  }, [bind])

  // Listen for pin/unpin
  useEffect(() => {
    const unbindPin = bind<{ messageId: string }>('message-pinned', (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return { ...m, isPinned: true }
        }
        return m
      }))
      getGroupPinnedMessages(group.id).then(setPinnedMessages)
    })

    const unbindUnpin = bind<{ messageId: string }>('message-unpinned', (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return { ...m, isPinned: false }
        }
        return m
      }))
      setPinnedMessages(prev => prev.filter(m => m.id !== data.messageId))
    })

    return () => {
      unbindPin()
      unbindUnpin()
    }
  }, [bind, group.id])

  // Listen for typing indicator
  useEffect(() => {
    const unbind = bind<{ userId: string; userName: string; isTyping: boolean }>('typing-indicator', (data) => {
      if (data.userId === currentUserId) return

      setTypingUsers(prev => {
        if (data.isTyping) {
          if (!prev.some(u => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, userName: data.userName }]
          }
        } else {
          return prev.filter(u => u.userId !== data.userId)
        }
        return prev
      })

      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
        }, 3000)
      }
    })

    return unbind
  }, [bind, currentUserId])

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

  // Handle reply
  const handleReply = useCallback((message: GroupMessageRecord) => {
    setReplyingTo({
      id: message.id,
      content: message.content,
      senderName: message.senderName
    })
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  // Handle reactions
  const handleReaction = useCallback(async (messageId: string, emoji: ReactionEmoji, remove: boolean) => {
    if (remove) {
      await removeGroupReaction(messageId, emoji)
    } else {
      await addGroupReaction(messageId, emoji)
    }
  }, [])

  // Handle pin/unpin
  const handlePin = useCallback(async (messageId: string) => {
    await pinGroupMessage(messageId)
  }, [])

  const handleUnpin = useCallback(async (messageId: string) => {
    await unpinGroupMessage(messageId)
  }, [])

  // Handle jump to message
  const handleJumpToMessage = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId)
    setTimeout(() => setHighlightedMessageId(undefined), 2500)
  }, [])

  // Custom search for group
  const handleSearchSelect = useCallback(async (messageId: string) => {
    handleJumpToMessage(messageId)
  }, [handleJumpToMessage])

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            {group.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchDialog
              groupId={group.id}
              onSelectMessage={handleSearchSelect}
            />
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

      {/* Pinned messages bar - convert to ChatMessageRecord format */}
      <PinnedMessagesBar
        messages={pinnedMessages.map(m => ({
          ...m,
          campaignId: m.groupId,
          recipientId: null,
          recipientName: null,
          character: null,
          isSecret: false
        }))}
        onUnpin={isAdmin ? handleUnpin : undefined}
        onJumpToMessage={handleJumpToMessage}
        isMJ={isAdmin}
      />

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <GroupMessageList
          messages={messages}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          typingUsers={typingUsers}
          onLoadMore={loadMoreMessages}
          onReply={handleReply}
          onPin={isAdmin ? handlePin : undefined}
          onUnpin={isAdmin ? handleUnpin : undefined}
          onReaction={handleReaction}
          highlightedMessageId={highlightedMessageId}
        />
        <GroupChatInput
          groupId={group.id}
          currentUserColor={currentUserColor}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          onMessageSent={handleMessageSent}
        />
      </CardContent>
    </Card>
  )
}

export default GroupChatWindow
