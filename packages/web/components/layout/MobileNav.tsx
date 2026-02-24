'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import {
  LayoutDashboard,
  Package,
  Target,
  Link as LinkIcon,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
}

export function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const brandNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/brand/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/brand/products', icon: Package },
    { name: 'Campaigns', href: '/brand/campaigns', icon: Target },
    { name: 'Find Influencers', href: '/brand/influencers', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const influencerNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/influencer/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/influencer/campaigns', icon: Target },
    { name: 'Tracking Links', href: '/influencer/tracking-links', icon: LinkIcon },
    { name: 'Payouts', href: '/influencer/payouts', icon: DollarSign },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const navItems = user?.role === 'BRAND' ? brandNavItems : influencerNavItems

  const handleLogout = () => {
    clearAuth()
    router.push('/auth/login')
    setIsOpen(false)
  }

  const handleNavClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-900" />
        ) : (
          <Menu className="w-6 h-6 text-gray-900" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-80 bg-white shadow-xl z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">
                  {user?.role === 'BRAND' ? 'Brand Portal' : 'Influencer Hub'}
                </h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase()} Account
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
