'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Building2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '@/services/auth-service'
import { UserRole } from '@/types'
import { ApiError } from '@/lib/api-client'

type Step = 'role' | 'details'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, user } = useAuthStore()

  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Brand fields
    company_name: '',
    website: '',
    // Influencer fields
    display_name: '',
    social_instagram: '',
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

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    setIsLoading(true)

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        ...(selectedRole === UserRole.BRAND
          ? {
              company_name: formData.company_name,
              website: formData.website,
            }
          : {
              display_name: formData.display_name,
              social_instagram: formData.social_instagram,
            }),
      }

      const response = await authService.register(registerData)

      // Store user data
      setUser(response.user, response.brand, response.influencer)

      // Redirect based on role
      if (response.user.role === 'BRAND') {
        router.push('/brand/dashboard')
      } else {
        router.push('/influencer/dashboard')
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Role Selection Step
  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Join Our Platform
            </h1>
            <p className="text-gray-600">
              Choose how you want to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Brand Card */}
            <Card
              variant="bordered"
              padding="lg"
              className="cursor-pointer hover:border-primary-500 hover:shadow-medium transition-all duration-200 group"
              onClick={() => handleRoleSelect(UserRole.BRAND)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Building2 className="w-10 h-10 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    I&apos;m a Brand
                  </h3>
                  <p className="text-gray-600">
                    Find influencers to promote your products and grow your business
                  </p>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 text-left w-full">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2" />
                    Create and manage campaigns
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2" />
                    Track conversions and ROI
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2" />
                    Connect with top influencers
                  </li>
                </ul>
                <Button variant="primary" size="lg" className="w-full">
                  Sign up as Brand
                </Button>
              </div>
            </Card>

            {/* Influencer Card */}
            <Card
              variant="bordered"
              padding="lg"
              className="cursor-pointer hover:border-secondary-500 hover:shadow-medium transition-all duration-200 group"
              onClick={() => handleRoleSelect(UserRole.INFLUENCER)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <Sparkles className="w-10 h-10 text-secondary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    I&apos;m an Influencer
                  </h3>
                  <p className="text-gray-600">
                    Monetize your audience by promoting products you love
                  </p>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 text-left w-full">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-2" />
                    Earn commission on sales
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-2" />
                    Access exclusive campaigns
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-2" />
                    Track your performance
                  </li>
                </ul>
                <Button variant="secondary" size="lg" className="w-full">
                  Sign up as Influencer
                </Button>
              </div>
            </Card>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Registration Form Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => setStep('role')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Change role
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Sign up as a {selectedRole === UserRole.BRAND ? 'Brand' : 'Influencer'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-medium p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              placeholder="••••••••"
              helperText="Must be at least 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              required
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />

            {selectedRole === UserRole.BRAND ? (
              <>
                <Input
                  label="Company Name"
                  type="text"
                  required
                  leftIcon={<Building2 className="w-5 h-5" />}
                  placeholder="Acme Inc."
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                />
                <Input
                  label="Website"
                  type="url"
                  leftIcon={<span className="text-xs">🌐</span>}
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <Input
                  label="Display Name"
                  type="text"
                  required
                  leftIcon={<User className="w-5 h-5" />}
                  placeholder="Your Name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                />
                <Input
                  label="Instagram Handle (Optional)"
                  type="text"
                  leftIcon={<span className="text-xs">📸</span>}
                  placeholder="@yourusername"
                  value={formData.social_instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, social_instagram: e.target.value })
                  }
                />
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
