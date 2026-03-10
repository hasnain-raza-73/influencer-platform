'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

interface BrandRegistrationFormProps {
  formData: {
    email: string
    password: string
    confirmPassword: string
    company_name: string
    website: string
    full_name?: string
    budget_range?: string
  }
  onChange: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  isLoading: boolean
  error: string
}

export function BrandRegistrationForm({
  formData,
  onChange,
  onSubmit,
  onBack,
  isLoading,
  error,
}: BrandRegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const handlePasswordChange = (password: string) => {
    onChange({ ...formData, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return { text: 'Weak', color: 'text-red-500' }
    if (passwordStrength <= 2) return { text: 'Medium', color: 'text-yellow-500' }
    return { text: 'Strong', color: 'text-green-500' }
  }

  const strengthInfo = getStrengthText()

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Testimonial & Benefits (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-primary p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-xl font-bold tracking-tight">InfluencerPlatform</span>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-4xl opacity-50">format_quote</span>
              <p className="text-2xl font-medium leading-relaxed italic">
                "The most efficient way to manage influencer campaigns at scale. It transformed our ROI tracking overnight."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/30 border border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Sarah Jenkins</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Marketing Director, Global Retail</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <ul className="space-y-6">
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-lg font-medium">Access to 10M+ creators</span>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <span className="text-lg font-medium">Real-time ROI tracking</span>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined">description</span>
              </div>
              <span className="text-lg font-medium">Automated contracting</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side: Registration Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-primary mb-4 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Change role
            </button>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Brand Account</h1>
            <p className="text-slate-500 dark:text-slate-400">Join thousands of brands growing with our platform.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="Enter your full name"
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Work Email</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="Enter brand name"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => onChange({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website URL</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="https://example.com"
                  type="url"
                  value={formData.website}
                  onChange={(e) => onChange({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Marketing Budget</label>
              <select
                className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                value={formData.budget_range || ''}
                onChange={(e) => onChange({ ...formData, budget_range: e.target.value })}
              >
                <option value="">Select budget range</option>
                <option value="1k-5k">$1,000 - $5,000</option>
                <option value="5k-20k">$5,000 - $20,000</option>
                <option value="20k-50k">$20,000 - $50,000</option>
                <option value="50k+">$50,000+</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 pr-12"
                  placeholder="Min. 8 characters"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="pt-2">
                  <div className="flex gap-1 h-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < passwordStrength ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${strengthInfo.color}`}>
                      {passwordStrength >= 3 ? 'check_circle' : 'info'}
                    </span>
                    Password strength: <span className={`font-bold ${strengthInfo.color}`}>{strengthInfo.text}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <input
                className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
                placeholder="Re-enter password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => onChange({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="pt-4">
              <button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Brand Account
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              By signing up, you agree to our{' '}
              <a className="text-primary hover:underline font-medium" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="text-primary hover:underline font-medium" href="#">
                Privacy Policy
              </a>
              .
            </p>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link className="text-primary font-bold hover:underline" href="/auth/login">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
