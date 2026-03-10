'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CreatorRegistrationFormProps {
  formData: {
    email: string
    password: string
    confirmPassword: string
    display_name: string
    social_instagram?: string
    full_name?: string
    primary_platform?: string
    content_category?: string
  }
  onChange: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  isLoading: boolean
  error: string
}

export function CreatorRegistrationForm({
  formData,
  onChange,
  onSubmit,
  onBack,
  isLoading,
  error,
}: CreatorRegistrationFormProps) {
  return (
    <div className="flex w-full max-w-[1280px] min-h-[800px] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden rounded-xl m-4">
      {/* Left Side: Gradient & Mosaic (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] relative overflow-hidden p-12 flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white mb-12">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-xl font-bold tracking-tight">InfluencerPlatform</span>
          </div>
          <h1 className="text-white text-5xl font-extrabold leading-tight tracking-tight mb-6">
            Turn your influence into income
          </h1>
          <p className="text-blue-100 text-lg">
            Join over 10,000+ influencers collaborating with the world's most innovative brands.
          </p>
        </div>

        {/* Mosaic Visual Decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-2 gap-4 rotate-12 scale-125 translate-x-20">
          <div className="bg-white/20 h-48 rounded-lg"></div>
          <div className="bg-white/20 h-64 rounded-lg"></div>
          <div className="bg-white/20 h-40 rounded-lg"></div>
          <div className="bg-white/20 h-56 rounded-lg"></div>
          <div className="bg-white/20 h-48 rounded-lg"></div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/80 text-sm">
          <span className="material-symbols-outlined">verified</span>
          <span>Trusted by top B2B SaaS and Tech Brands</span>
        </div>
      </div>

      {/* Right Side: Registration Form (60%) */}
      <div className="w-full lg:w-[60%] p-8 md:p-16 overflow-y-auto">
        <div className="max-w-[520px] mx-auto">
          <header className="mb-10">
            <button
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-primary mb-4 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Change role
            </button>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Create Influencer Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Fill in your details to start your journey with us.</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                  placeholder="Alex Rivera"
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                  placeholder="alex@influencer.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
              <input
                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                placeholder="Your influencer name"
                type="text"
                value={formData.display_name}
                onChange={(e) => onChange({ ...formData, display_name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Platform</label>
              <div className="grid grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input
                    className="peer hidden"
                    name="platform"
                    type="radio"
                    value="instagram"
                    checked={formData.primary_platform === 'instagram'}
                    onChange={(e) => onChange({ ...formData, primary_platform: e.target.value })}
                  />
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-slate-100 dark:border-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">photo_camera</span>
                    <span className="text-xs mt-2 font-medium">Instagram</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    className="peer hidden"
                    name="platform"
                    type="radio"
                    value="tiktok"
                    checked={formData.primary_platform === 'tiktok'}
                    onChange={(e) => onChange({ ...formData, primary_platform: e.target.value })}
                  />
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-slate-100 dark:border-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">videocam</span>
                    <span className="text-xs mt-2 font-medium">TikTok</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    className="peer hidden"
                    name="platform"
                    type="radio"
                    value="youtube"
                    checked={formData.primary_platform === 'youtube'}
                    onChange={(e) => onChange({ ...formData, primary_platform: e.target.value })}
                  />
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-slate-100 dark:border-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">play_circle</span>
                    <span className="text-xs mt-2 font-medium">YouTube</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Main Content Category</label>
              <select
                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                value={formData.content_category || ''}
                onChange={(e) => onChange({ ...formData, content_category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option value="tech">Tech & Software</option>
                <option value="beauty">Beauty & Lifestyle</option>
                <option value="gaming">Gaming</option>
                <option value="finance">Finance & Business</option>
                <option value="health">Health & Fitness</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Instagram Handle (Optional)
              </label>
              <input
                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                placeholder="@yourusername"
                type="text"
                value={formData.social_instagram || ''}
                onChange={(e) => onChange({ ...formData, social_instagram: e.target.value })}
              />
            </div>

            <div className="py-2">
              <button
                className="w-full h-14 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-3 font-bold hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(124,59,237,0.1)]"
                type="button"
              >
                <span className="material-symbols-outlined">link</span>
                Connect Social Account
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <input
                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <input
                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                placeholder="••••••••"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => onChange({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                className="mt-1 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                id="tos"
                type="checkbox"
                required
              />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="tos">
                I agree to the{' '}
                <a className="text-primary hover:underline font-medium" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-primary hover:underline font-medium" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              className="w-full h-14 rounded-lg bg-primary text-white font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Influencer Account'
              )}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
              Already have an account?{' '}
              <Link className="text-primary font-bold hover:underline" href="/auth/login">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
