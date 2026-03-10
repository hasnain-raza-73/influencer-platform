const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const messagesService = {
  async getConversations() {
    try {
      const response = await fetch(`${API_BASE}/messages/conversations`, {
        headers: getAuthHeaders(),
      })

      // Handle unauthenticated requests gracefully
      if (response.status === 401) {
        return { success: true, data: [] }
      }

      if (!response.ok) {
        console.error('Failed to fetch conversations:', response.status, response.statusText)
        throw new Error('Failed to fetch conversations')
      }

      return response.json()
    } catch (error) {
      // Only log network errors or unexpected issues
      if (error instanceof Error && error.message !== 'Failed to fetch conversations') {
        console.error('Network error fetching conversations:', error)
      }
      return { success: true, data: [] }
    }
  },

  async getConversation(userId: string) {
    try {
      const response = await fetch(`${API_BASE}/messages/conversation/${userId}`, {
        headers: getAuthHeaders(),
      })

      // Handle unauthenticated requests gracefully
      if (response.status === 401) {
        return { success: true, data: [] }
      }

      if (!response.ok) {
        console.error('Failed to fetch conversation:', response.status, response.statusText)
        throw new Error('Failed to fetch conversation')
      }

      return response.json()
    } catch (error) {
      // Only log network errors or unexpected issues
      if (error instanceof Error && error.message !== 'Failed to fetch conversation') {
        console.error('Network error fetching conversation:', error)
      }
      return { success: true, data: [] }
    }
  },

  async sendMessage(recipientId: string, recipientType: 'BRAND' | 'INFLUENCER', message: string, campaignId?: string) {
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          recipient_id: recipientId,
          recipient_type: recipientType,
          message,
          campaign_id: campaignId,
        }),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to send message:', response.status, response.statusText)
        throw new Error('Failed to send message')
      }

      return response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  async getUnreadCount() {
    try {
      const response = await fetch(`${API_BASE}/messages/unread-count`, {
        headers: getAuthHeaders(),
      })

      // Handle unauthenticated requests gracefully
      if (response.status === 401) {
        return { success: true, data: { count: 0 } }
      }

      if (!response.ok) {
        console.error('Failed to fetch unread count:', response.status, response.statusText)
        throw new Error('Failed to fetch unread count')
      }

      return response.json()
    } catch (error) {
      // Only log network errors or unexpected issues
      if (error instanceof Error && error.message !== 'Failed to fetch unread count') {
        console.error('Network error fetching unread count:', error)
      }
      return { success: true, data: { count: 0 } }
    }
  },

  async markAsRead(userId: string) {
    try {
      const response = await fetch(`${API_BASE}/messages/read/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to mark as read:', response.status, response.statusText)
        throw new Error('Failed to mark as read')
      }

      return response.json()
    } catch (error) {
      console.error('Error marking as read:', error)
      throw error
    }
  },
}
