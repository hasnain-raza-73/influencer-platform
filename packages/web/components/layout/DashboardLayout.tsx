'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')

      // If no auth or no token, redirect to login
      if (!isAuthenticated || !user || !token) {
        // Clear auth state if missing token
        if (isAuthenticated && !token) {
          useAuthStore.getState().clearAuth()
        }
        router.push('/auth/login')
        return
      }

      // Role-based route protection
      const path = window.location.pathname
      if (path.startsWith('/admin') && user.role !== 'ADMIN') {
        router.push('/')
      } else if (path.startsWith('/brand') && user.role !== 'BRAND') {
        router.push('/')
      } else if (path.startsWith('/influencer') && user.role !== 'INFLUENCER') {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, router])

  // Check for token before rendering
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (!isAuthenticated || !user || !token) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
