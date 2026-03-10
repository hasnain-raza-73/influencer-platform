'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { messagesService } from '@/services/messages-service'
import { brandsService } from '@/services/brands-service'
import { Brand } from '@/types'

interface Conversation {
  brand_id: string
  brand_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

interface Message {
  id: string
  sender_type: 'BRAND' | 'INFLUENCER'
  message: string
  created_at: string
  is_read: boolean
}

export default function InfluencerMessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedConversationName, setSelectedConversationName] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Brand[]>([])
  const [searching, setSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const data = await messagesService.getConversations()
      setConversations(data.data || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (brandId: string) => {
    try {
      const data = await messagesService.getConversation(brandId)
      setMessages(data.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const searchBrands = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const data = await brandsService.getAll({ search: query, limit: 10 })
      setSearchResults(data.brands || [])
    } catch (error) {
      // Silently handle error - service already logs it
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchBrands(value)
  }

  const startConversation = (brand: Brand) => {
    setSelectedConversation(brand.id)
    setSelectedConversationName(brand.company_name || brand.user?.email || 'Unknown')
    setShowNewConversation(false)
    setSearchQuery('')
    setSearchResults([])
    setMessages([])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const data = await messagesService.sendMessage(selectedConversation, 'BRAND', newMessage)
      setMessages([...messages, data.data])
      setNewMessage('')
      fetchConversations() // Refresh conversation list
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const selectedConversationData = conversations.find(c => c.brand_id === selectedConversation)
  const displayName = selectedConversationData?.brand_name || selectedConversationName

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with brands</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="col-span-4 bg-card rounded-lg border overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
            <h2 className="font-semibold">Conversations</h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 text-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">forum</span>
                <p className="mb-4">No conversations yet</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.brand_id}
                    onClick={() => {
                      setSelectedConversation(conversation.brand_id)
                      setSelectedConversationName(conversation.brand_name)
                    }}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedConversation === conversation.brand_id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">business</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{conversation.brand_name}</h3>
                          {conversation.unread_count > 0 && (
                            <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(conversation.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Thread */}
        <div className="col-span-8 bg-card rounded-lg border flex flex-col">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">business</span>
                </div>
                <div>
                  <h2 className="font-semibold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">Brand</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'INFLUENCER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_type === 'INFLUENCER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_type === 'INFLUENCER' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">chat_bubble</span>
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Select a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewConversation(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Conversation</h3>
              <button
                onClick={() => setShowNewConversation(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searching ? (
                <div className="text-center py-8">
                  <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => startConversation(brand)}
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">business</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{brand.company_name || brand.user?.email}</h4>
                        {brand.website && (
                          <p className="text-sm text-muted-foreground truncate">{brand.website}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8 px-4">
                  <span className="material-symbols-outlined text-4xl mb-3 block opacity-50 text-muted-foreground">info</span>
                  <p className="text-sm text-muted-foreground mb-2">Unable to search all brands</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You can message brands from your <span className="font-medium">Campaign Invitations</span> page, or reply to brands who message you first.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <span className="material-symbols-outlined text-4xl mb-3 block opacity-50 text-muted-foreground">campaign</span>
                  <p className="text-sm font-medium mb-2">Message Brands from Campaigns</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Check your <span className="font-medium">Campaign Invitations</span> to find brands to message, or wait for brands to reach out to you.
                  </p>
                  <button
                    onClick={() => {
                      setShowNewConversation(false)
                      router.push('/influencer/invitations')
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    View Campaign Invitations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
