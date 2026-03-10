'use client'

import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'
import { useAuthStore } from '@/store/auth-store'

export function Topbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Home'

    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Right Side - Notifications */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
