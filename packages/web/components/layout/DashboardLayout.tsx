'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Topbar } from './Topbar'
import FloatingChatWidget from '@/components/FloatingChatWidget'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

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
  }, [mounted, isAuthenticated, user, router])

  // Show loading state until mounted and authenticated
  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
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
      <main className="flex-1 overflow-auto flex flex-col">
        <Topbar />
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>

      {/* Floating Chat Widget - Only for Brands and Influencers */}
      {user?.role !== 'ADMIN' && <FloatingChatWidget />}
    </div>
  )
}
