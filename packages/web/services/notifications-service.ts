const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const notificationsService = {
  async getNotifications(limit: number = 20) {
    try {
      const response = await fetch(`${API_BASE}/notifications?limit=${limit}`, {
        headers: getAuthHeaders(),
      })

      // Handle unauthenticated requests gracefully
      if (response.status === 401) {
        return { success: true, data: [] }
      }

      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.status, response.statusText)
        throw new Error('Failed to fetch notifications')
      }

      return response.json()
    } catch (error) {
      // Only log network errors or unexpected issues
      if (error instanceof Error && error.message !== 'Failed to fetch notifications') {
        console.error('Network error fetching notifications:', error)
      }
      return { success: true, data: [] }
    }
  },

  async getUnreadCount() {
    try {
      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
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

  async markAsRead(notificationId: string) {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to mark notification as read:', response.status, response.statusText)
        throw new Error('Failed to mark notification as read')
      }

      return response.json()
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  async markAllAsRead() {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to mark all notifications as read:', response.status, response.statusText)
        throw new Error('Failed to mark all notifications as read')
      }

      return response.json()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to delete notification:', response.status, response.statusText)
        throw new Error('Failed to delete notification')
      }

      return response.json()
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  },

  async deleteAllNotifications() {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        console.error('Failed to delete all notifications:', response.status, response.statusText)
        throw new Error('Failed to delete all notifications')
      }

      return response.json()
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      throw error
    }
  },
}
