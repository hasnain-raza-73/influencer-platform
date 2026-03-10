'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '@/services/auth-service'
import { UserRole } from '@/types'
import { ApiError } from '@/lib/api-client'
import { BrandRegistrationForm } from '@/components/auth/BrandRegistrationForm'
import { CreatorRegistrationForm } from '@/components/auth/CreatorRegistrationForm'

type Step = 'role' | 'details'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, user } = useAuthStore()

  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-primary/10 px-10 py-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
                InfluencerPlatform
              </h2>
            </div>
            <Link href="/auth/login">
              <Button variant="primary" size="sm" className="bg-primary text-white hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
            <div className="max-w-[800px] w-full text-center space-y-4 mb-12">
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Join the future of influence
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[600px] mx-auto">
                Whether you&apos;re looking to scale your brand or monetize your content, we&apos;ve got the tools to help you succeed.
              </p>
            </div>

            {/* Account Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-[900px] px-4">
              {/* Brand Card */}
              <div
                onClick={() => handleRoleSelect(UserRole.BRAND)}
                className="group flex flex-col bg-white dark:bg-slate-900 p-8 rounded-xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
              >
                <div className="size-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">business_center</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">I am a Brand</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[48px]">
                  Grow your business by partnering with the right creators for your niche.
                </p>
                <ul className="space-y-3 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Search 100k+ vetted creators</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Real-time ROI tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Seamless campaign management</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-6 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                  Get Started as Brand
                </button>
              </div>

              {/* Influencer Card */}
              <div
                onClick={() => handleRoleSelect(UserRole.INFLUENCER)}
                className="group flex flex-col bg-white dark:bg-slate-900 p-8 rounded-xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
              >
                <div className="size-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">I am an Influencer</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[48px]">
                  Monetize your audience and build lasting relationships with top brands.
                </p>
                <ul className="space-y-3 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Find relevant brand partnerships</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Manage earnings and payouts</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>Professional media kit builder</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-6 rounded-lg border-2 border-primary/40 text-slate-700 dark:text-slate-200 font-bold hover:border-primary hover:bg-primary/5 transition-all">
                  Get Started as Influencer
                </button>
              </div>
            </div>

            {/* Footer Link */}
            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </main>

          {/* Visual Decorative Element (Background) */}
          <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          </div>
        </div>
      </div>
    )
  }

  // Registration Form Step
  if (selectedRole === UserRole.BRAND) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <BrandRegistrationForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onBack={() => setStep('role')}
          isLoading={isLoading}
          error={error}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
      <CreatorRegistrationForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onBack={() => setStep('role')}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
