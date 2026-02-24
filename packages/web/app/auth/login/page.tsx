'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-medium p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              id="email"
              placeholder="you@example.com"
              required
              leftIcon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {/* Password Input */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
