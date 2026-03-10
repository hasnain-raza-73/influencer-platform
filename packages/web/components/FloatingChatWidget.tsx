'use client'

import { useState, useEffect, useRef } from 'react'
import { messagesService } from '@/services/messages-service'
import { useAuthStore } from '@/store/auth-store'
import Link from 'next/link'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  sender_type: 'BRAND' | 'INFLUENCER'
  message: string
  created_at: string
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchUnreadCount = async () => {
    try {
      const data = await messagesService.getUnreadCount()
      setUnreadCount(data.data.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      const data = await messagesService.getConversations()
      const formatted = data.data?.map((conv: any) => ({
        id: user?.role === 'BRAND' ? conv.influencer_id : conv.brand_id,
        name: user?.role === 'BRAND' ? conv.influencer_name : conv.brand_name,
        lastMessage: conv.last_message,
        lastMessageAt: conv.last_message_at,
        unreadCount: conv.unread_count,
      })) || []
      setConversations(formatted)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await messagesService.getConversation(conversationId)
      setMessages(data.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const data = await messagesService.sendMessage(
        selectedConversation,
        user?.role === 'BRAND' ? 'INFLUENCER' : 'BRAND',
        newMessage
      )
      setMessages([...messages, data.data])
      setNewMessage('')
      fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 size-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isOpen ? (
          <span className="material-symbols-outlined">close</span>
        ) : (
          <span className="material-symbols-outlined">chat</span>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col z-40">
          {/* Header */}
          <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">
              {selectedConversation ? selectedConversationData?.name : 'Messages'}
            </h3>
            <div className="flex items-center gap-2">
              {selectedConversation && (
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="hover:bg-primary-foreground/20 p-1 rounded"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              )}
              <Link
                href={user?.role === 'BRAND' ? '/brand/messages' : '/influencer/messages'}
                className="hover:bg-primary-foreground/20 p-1 rounded"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedConversation ? (
              /* Messages Thread */
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        (user?.role === 'BRAND' && message.sender_type === 'BRAND') ||
                        (user?.role === 'INFLUENCER' && message.sender_type === 'INFLUENCER')
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-2 text-sm ${
                          (user?.role === 'BRAND' && message.sender_type === 'BRAND') ||
                          (user?.role === 'INFLUENCER' && message.sender_type === 'INFLUENCER')
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="break-words">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Conversations List */
              <div>
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">forum</span>
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.slice(0, 5).map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className="w-full p-3 text-left hover:bg-muted transition-colors flex items-start gap-3"
                      >
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">
                            {user?.role === 'BRAND' ? 'person' : 'business'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                            {conversation.unreadCount > 0 && (
                              <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
