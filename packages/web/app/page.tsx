'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Link as LinkIcon,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  // No redirect logic - let logged in users view the home page

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Influencer Platform
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/auth/login')}>
                Sign In
              </Button>
              <Button variant="primary" onClick={() => router.push('/auth/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Brands with
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Influential Creators
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The ultimate platform for brands to launch campaigns and influencers to monetize their
            audience. Track performance, manage payouts, and grow together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="text-lg px-8 py-6"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/login')}
              className="text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Succeed
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Brands */}
            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Campaign Management</h4>
                <p className="text-gray-600">
                  Create and manage marketing campaigns with custom commission rates, budgets, and
                  performance tracking.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h4>
                <p className="text-gray-600">
                  Monitor clicks, conversions, and ROI in real-time. Get detailed insights into
                  campaign performance.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Influencer Network</h4>
                <p className="text-gray-600">
                  Connect with verified influencers across multiple niches and platforms to amplify
                  your brand reach.
                </p>
              </CardContent>
            </Card>

            {/* For Influencers */}
            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Earn Commissions</h4>
                <p className="text-gray-600">
                  Monetize your audience with competitive commission rates. Track your earnings and
                  request payouts easily.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center mb-6">
                  <LinkIcon className="w-7 h-7 text-secondary-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Smart Tracking Links</h4>
                <p className="text-gray-600">
                  Generate unique tracking links for campaigns and products. Every click and
                  conversion is automatically tracked.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Performance Dashboard</h4>
                <p className="text-gray-600">
                  View your performance metrics, top campaigns, and earning trends in one
                  easy-to-use dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Section */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-12 h-12" />
              <Zap className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Built for Performance & Trust</h3>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Our platform ensures transparent tracking, secure payments, and reliable performance
              metrics for both brands and influencers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 text-primary-100">
              <div>
                <p className="text-4xl font-bold text-white mb-2">99.9%</p>
                <p className="text-sm">Uptime Guarantee</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">Real-time</p>
                <p className="text-sm">Click Tracking</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">Secure</p>
                <p className="text-sm">Payment Processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of brands and influencers already growing their business on our platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="text-lg px-10 py-6"
            >
              <Users className="w-5 h-5 mr-2" />
              Create Free Account
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Influencer Platform - Connecting Brands with Creators</p>
            <p className="text-sm text-gray-500">
              Built with Next.js, TypeScript, and PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
