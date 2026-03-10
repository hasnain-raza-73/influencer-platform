'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '@/services/auth-service'
import { ApiError } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, user } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })

  // Redirect already logged in users to their dashboard (only if they have a valid token)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (isAuthenticated && user && token) {
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (user.role === 'BRAND') {
          router.push('/brand/dashboard')
        } else if (user.role === 'INFLUENCER') {
          router.push('/influencer/dashboard')
        }
      } else if (isAuthenticated && !token) {
        // User data exists but no token - clear auth state
        useAuthStore.getState().clearAuth()
      }
    }
  }, [isAuthenticated, user, router])

  // Show loading spinner while redirecting (only if we have a valid token)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (isAuthenticated && user && token) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authService.login(formData)

      // Store user data
      setUser(response.user, response.brand, response.influencer)

      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (response.user.role === 'BRAND') {
        router.push('/brand/dashboard')
      } else if (response.user.role === 'INFLUENCER') {
        router.push('/influencer/dashboard')
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-light dark:bg-background-dark">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-background-dark">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">InfluencerPlatform</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-slate-100">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Enter your details to access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                id="email"
                placeholder="name@company.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100" htmlFor="password">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                id="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <label className="ml-2 text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-primary/20"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                Start your 14-day free trial
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Testimonial & Brand Visual */}
      <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]"></div>
        </div>

        {/* Content Card */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50">
            <div className="flex gap-1 mb-6 text-yellow-400">
              <span className="material-symbols-outlined fill-1">star</span>
              <span className="material-symbols-outlined fill-1">star</span>
              <span className="material-symbols-outlined fill-1">star</span>
              <span className="material-symbols-outlined fill-1">star</span>
              <span className="material-symbols-outlined fill-1">star</span>
            </div>
            <blockquote className="text-2xl font-medium leading-relaxed text-slate-800 dark:text-slate-100 mb-8 italic">
              "This platform transformed how we handle our creator partnerships. We&apos;ve seen a 40% increase in campaign ROI since switching our entire workflow to InfluencerPlatform."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full overflow-hidden bg-slate-200">
                <img
                  alt="Sarah Jenkins"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2Yn5Xkztz9ddn6g8qp5MFlSdjHS_8L7_4ZCspjR96H08HNBrtcyNysBV9fNrmkTyM7LU6CNaa0uVV5VlbYuPkq-_NZ1lfb1f-hdDEUxm_HkrJo5gUDPwL1QkQj74bEHdtckJFeMsDMKywM7TG-L7UA-99Gy36kn-cG6Ijk4vJKVCMZyLTZ6jb_ftBgQTxYtR-D8zJssNTCyXqVlqkq3m62PQaHqZW0D0v1SwdQKDwZfIN4Gw-qR1-BwIMCki7L0SpMPuSqORd2pbt"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Sarah Jenkins</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Global Marketing Manager, Bloom Digital</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center gap-8 opacity-40 grayscale contrast-125 dark:invert">
            <div className="text-sm font-black uppercase tracking-widest italic">Bloom</div>
            <div className="text-sm font-black uppercase tracking-widest italic">Nova</div>
            <div className="text-sm font-black uppercase tracking-widest italic">Vortex</div>
            <div className="text-sm font-black uppercase tracking-widest italic">Pulse</div>
          </div>
        </div>
      </div>
    </div>
  )
}
