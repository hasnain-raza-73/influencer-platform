'use client'

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
  TrendingUp,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  BarChart3,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()

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

  const adminNavItems: NavItem[] = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Brands', href: '/admin/brands', icon: ShieldCheck },
    { name: 'Influencers', href: '/admin/influencers', icon: Users },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Target },
    { name: 'Product Reviews', href: '/admin/products', icon: Package },
    { name: 'Payouts', href: '/admin/payouts', icon: DollarSign },
    { name: 'Conversions', href: '/admin/conversions', icon: ArrowLeftRight },
  ]

  const navItems = user?.role === 'ADMIN' ? adminNavItems : user?.role === 'BRAND' ? brandNavItems : influencerNavItems

  const handleLogout = () => {
    clearAuth()
    router.push('/auth/login')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">
              {user?.role === 'ADMIN' ? 'Admin Panel' : user?.role === 'BRAND' ? 'Brand Portal' : 'Influencer Hub'}
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
              onClick={() => router.push(item.href)}
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
  )
}
