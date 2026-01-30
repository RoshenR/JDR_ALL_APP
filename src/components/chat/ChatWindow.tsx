'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { PinnedMessagesBar } from './PinnedMessagesBar'
import { SearchDialog } from './SearchDialog'
import { useCampaignChannel } from '@/hooks/usePusher'
import {
  getCampaignMessages,
  getPinnedMessages,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  type ChatMessageRecord,
  type ReplyInfo,
  type ReactionEmoji,
  type ReactionRecord
} from '@/lib/actions/chat'
import { MessageSquare, Wifi, WifiOff } from 'lucide-react'

interface TypingUser {
  userId: string
  userName: string
}

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
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessageRecord[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReplyInfo | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | undefined>()
  const { bind, channel } = useCampaignChannel(campaignId)

  const isMJ = currentUserRole === 'MJ'

  // Load pinned messages
  useEffect(() => {
    async function loadPinned() {
      const pinned = await getPinnedMessages(campaignId)
      setPinnedMessages(pinned)
    }
    loadPinned()
  }, [campaignId])

  // Écouter les nouveaux messages
  useEffect(() => {
    const unbind = bind<ChatMessageRecord & { createdAt: string }>('chat-message', (data) => {
      const newMessage: ChatMessageRecord = {
        ...data,
        createdAt: new Date(data.createdAt)
      }

      // Vérifier si le message nous concerne (pour les messages privés)
      const isForMe = !newMessage.recipientId ||
                      newMessage.recipientId === currentUserId ||
                      newMessage.senderId === currentUserId ||
                      isMJ

      // For secret messages, only MJ and the sender can see them
      const canSeeSecret = !newMessage.isSecret || isMJ || newMessage.senderId === currentUserId

      if (isForMe && canSeeSecret) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) {
            return prev
          }
          return [...prev, newMessage]
        })
      }
    })

    return unbind
  }, [bind, currentUserId, isMJ])

  // Listen for reactions
  useEffect(() => {
    const unbindAdd = bind<{ messageId: string; reaction: ReactionRecord }>('reaction-added', (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          // Check if reaction already exists
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
      // Reload pinned messages
      getPinnedMessages(campaignId).then(setPinnedMessages)
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
  }, [bind, campaignId])

  // Listen for typing indicator
  useEffect(() => {
    const unbind = bind<{ userId: string; userName: string; isTyping: boolean }>('typing-indicator', (data) => {
      if (data.userId === currentUserId) return // Ignore own typing

      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user if not already in list
          if (!prev.some(u => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, userName: data.userName }]
          }
        } else {
          // Remove user
          return prev.filter(u => u.userId !== data.userId)
        }
        return prev
      })

      // Auto-remove after 3 seconds if no update
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
        }, 3000)
      }
    })

    return unbind
  }, [bind, currentUserId])

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

  // Handle reply
  const handleReply = useCallback((message: ChatMessageRecord) => {
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
      await removeReaction(messageId, emoji)
    } else {
      await addReaction(messageId, emoji)
    }
  }, [])

  // Handle pin/unpin
  const handlePin = useCallback(async (messageId: string) => {
    await pinMessage(messageId)
  }, [])

  const handleUnpin = useCallback(async (messageId: string) => {
    await unpinMessage(messageId)
  }, [])

  // Handle jump to message
  const handleJumpToMessage = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId)
    // Clear highlight after animation
    setTimeout(() => setHighlightedMessageId(undefined), 2500)
  }, [])

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Chat de campagne
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchDialog
              campaignId={campaignId}
              onSelectMessage={handleJumpToMessage}
            />
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
        </div>
      </CardHeader>

      {/* Pinned messages bar */}
      <PinnedMessagesBar
        messages={pinnedMessages}
        onUnpin={isMJ ? handleUnpin : undefined}
        onJumpToMessage={handleJumpToMessage}
        isMJ={isMJ}
      />

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          typingUsers={typingUsers}
          onLoadMore={loadMoreMessages}
          onReply={handleReply}
          onPin={isMJ ? handlePin : undefined}
          onUnpin={isMJ ? handleUnpin : undefined}
          onReaction={handleReaction}
          highlightedMessageId={highlightedMessageId}
        />
        <ChatInput
          campaignId={campaignId}
          participants={participants}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          currentUserColor={currentUserColor}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          onMessageSent={handleMessageSent}
        />
      </CardContent>
    </Card>
  )
}

export default ChatWindow
