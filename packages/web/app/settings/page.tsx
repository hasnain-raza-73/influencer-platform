'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User,
  Building2,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  Code2,
  Zap,
  BarChart3,
  Copy,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react'
import { api } from '@/lib/api'
import { integrationsService, BrandIntegration } from '@/services/integrations-service'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuthStore()

  // ── Profile & Password State ──────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company_name: '',
    website: '',
    bio: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  // ── Integrations State ────────────────────────────────────────────────────
  const [integration, setIntegration] = useState<BrandIntegration>({
    is_meta_enabled: false,
    is_ga4_enabled: false,
  })
  const [pixelSnippet, setPixelSnippet] = useState('')
  const [isSavingIntegration, setIsSavingIntegration] = useState(false)
  const [integrationMsg, setIntegrationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testMetaLoading, setTestMetaLoading] = useState(false)
  const [testGA4Loading, setTestGA4Loading] = useState(false)
  const [testMetaResult, setTestMetaResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testGA4Result, setTestGA4Result] = useState<{ success: boolean; message: string } | null>(null)
  const [showMetaToken, setShowMetaToken] = useState(false)
  const [showGA4Secret, setShowGA4Secret] = useState(false)
  const [snippetCopied, setSnippetCopied] = useState(false)

  // collapsible cards
  const [pixelOpen, setPixelOpen] = useState(true)
  const [metaOpen, setMetaOpen] = useState(false)
  const [ga4Open, setGA4Open] = useState(false)

  // ── Auth guard & prefill ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (user) {
      setProfileData({
        name: (user as any).name || '',
        email: user.email || '',
        company_name: (user as any).company_name || '',
        website: (user as any).website || '',
        bio: (user as any).bio || '',
      })
    }
  }, [isAuthenticated, user, router])

  // Load integrations for BRAND users
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') return
    integrationsService.get().then(setIntegration).catch(() => {})
    integrationsService.getPixelSnippet().then(setPixelSnippet).catch(() => {})
  }, [isAuthenticated, user])

  // ── Profile update ────────────────────────────────────────────────────────
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      const updateData: any = { name: profileData.name, email: profileData.email }
      if (user?.role === 'BRAND') {
        updateData.company_name = profileData.company_name
        updateData.website = profileData.website
      } else if (user?.role === 'INFLUENCER') {
        updateData.bio = profileData.bio
      }
      const response = await api.put('/auth/profile', updateData)
      updateUser(response.data.user)
      setSuccess('Profile updated successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Password change ───────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!passwordData.current_password || !passwordData.new_password) {
      setError('Please fill in all password fields')
      return
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }
    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      setSuccess('Password changed successfully')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Integration save ──────────────────────────────────────────────────────
  const handleSaveIntegration = async () => {
    setIsSavingIntegration(true)
    setIntegrationMsg(null)
    try {
      const updated = await integrationsService.update(integration)
      setIntegration(updated)
      setIntegrationMsg({ type: 'success', text: 'Integration settings saved.' })
    } catch {
      setIntegrationMsg({ type: 'error', text: 'Failed to save integration settings.' })
    } finally {
      setIsSavingIntegration(false)
    }
  }

  // ── Test connections ──────────────────────────────────────────────────────
  const handleTestMeta = async () => {
    setTestMetaLoading(true)
    setTestMetaResult(null)
    try {
      const result = await integrationsService.testMeta()
      setTestMetaResult(result)
    } catch {
      setTestMetaResult({ success: false, message: 'Request failed. Check credentials.' })
    } finally {
      setTestMetaLoading(false)
    }
  }

  const handleTestGA4 = async () => {
    setTestGA4Loading(true)
    setTestGA4Result(null)
    try {
      const result = await integrationsService.testGA4()
      setTestGA4Result(result)
    } catch {
      setTestGA4Result({ success: false, message: 'Request failed. Check credentials.' })
    } finally {
      setTestGA4Loading(false)
    }
  }

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(pixelSnippet).then(() => {
      setSnippetCopied(true)
      setTimeout(() => setSnippetCopied(false), 2000)
    })
  }

  const getDashboardRoute = () =>
    user?.role === 'BRAND' ? '/brand/dashboard' : '/influencer/dashboard'

  const integrationField = (field: keyof BrandIntegration, value: any) =>
    setIntegration((prev) => ({ ...prev, [field]: value }))

  // ── Render helpers ────────────────────────────────────────────────────────
  const TestResult = ({ result }: { result: { success: boolean; message: string } | null }) => {
    if (!result) return null
    return (
      <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {result.success
          ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
        <span>{result.message}</span>
      </div>
    )
  }

  const SectionToggle = ({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between text-left"
    >
      {children}
      {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile and account preferences
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(getDashboardRoute())}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Profile Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              {user?.role === 'BRAND' && (
                <>
                  <Input
                    label="Company Name"
                    type="text"
                    placeholder="Your Company Inc."
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    leftIcon={<Building2 className="w-5 h-5" />}
                  />
                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  />
                </>
              )}
              {user?.role === 'INFLUENCER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 resize-none"
                    rows={4}
                    placeholder="Tell brands about yourself and your audience..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Share your niche, audience demographics, and what makes you unique
                  </p>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                helperText="Must be at least 8 characters"
                leftIcon={<Lock className="w-5 h-5" />}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
              />
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Integrations (Brand only) ─────────────────────────────────── */}
        {user?.role === 'BRAND' && (
          <>
            <div className="mt-8 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Conversion Tracking Integrations</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track purchases from influencer links on your website. Use our pixel snippet, or forward conversions to your Meta and Google accounts automatically.
              </p>
            </div>

            {integrationMsg && (
              <div className={`p-4 rounded-lg text-sm ${integrationMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {integrationMsg.text}
              </div>
            )}

            {/* ── Card 1: Our Platform Pixel ── */}
            <Card variant="elevated">
              <CardHeader>
                <SectionToggle open={pixelOpen} onClick={() => setPixelOpen(!pixelOpen)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Platform Tracking Pixel</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Install on your purchase confirmation page</p>
                    </div>
                  </div>
                </SectionToggle>
              </CardHeader>

              {pixelOpen && (
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Add this snippet to your order confirmation / thank-you page. It reads the influencer attribution cookie and fires a conversion event back to our platform.
                  </p>

                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                      <span className="text-xs text-gray-400">JavaScript — paste before &lt;/body&gt;</span>
                      <button
                        type="button"
                        onClick={handleCopySnippet}
                        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
                      >
                        {snippetCopied ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-green-300 overflow-x-auto leading-relaxed">
                      {pixelSnippet || 'Loading pixel snippet...'}
                    </pre>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium mb-2">Installation steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Before the snippet, set <code className="bg-blue-100 px-1 rounded">window._order_id</code>, <code className="bg-blue-100 px-1 rounded">window._order_amount</code>, and <code className="bg-blue-100 px-1 rounded">window._currency</code> from your order data</li>
                      <li>Paste the snippet just before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag on your confirmation page</li>
                      <li>Only fires when the visitor came via an influencer tracking link (cookie-based)</li>
                    </ol>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ── Card 2: Meta Pixel (CAPI) ── */}
            <Card variant="elevated">
              <CardHeader>
                <SectionToggle open={metaOpen} onClick={() => setMetaOpen(!metaOpen)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">Meta Pixel — Conversions API</h3>
                        {integration.is_meta_enabled && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Enabled</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Forward attributed conversions to your Meta Ads account</p>
                    </div>
                  </div>
                </SectionToggle>
              </CardHeader>

              {metaOpen && (
                <CardContent className="space-y-5">
                  <p className="text-sm text-gray-600">
                    When we detect an influencer-attributed purchase, we automatically send it to your Meta pixel via the Conversions API (server-side). This improves attribution in your Meta Ads campaigns.
                  </p>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID</label>
                      <Input
                        placeholder="e.g. 123456789012345"
                        value={integration.meta_pixel_id || ''}
                        onChange={(e) => integrationField('meta_pixel_id', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System User Access Token</label>
                      <div className="relative">
                        <Input
                          type={showMetaToken ? 'text' : 'password'}
                          placeholder="EAAxxxxxxxxxx..."
                          value={integration.meta_access_token || ''}
                          onChange={(e) => integrationField('meta_access_token', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMetaToken(!showMetaToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showMetaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Event Code <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <Input
                        placeholder="e.g. TEST12345"
                        value={integration.meta_test_event_code || ''}
                        onChange={(e) => integrationField('meta_test_event_code', e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">From Meta Events Manager &rarr; Test Events tab</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => integrationField('is_meta_enabled', !integration.is_meta_enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.is_meta_enabled ? 'bg-primary-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.is_meta_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-sm text-gray-700">
                        {integration.is_meta_enabled ? 'Enabled — forwarding conversions to Meta' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">How to get your credentials:</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-700">
                      <li>Go to Meta Business Suite &rarr; Events Manager &rarr; select your Pixel &rarr; <strong>Settings</strong> &rarr; copy Pixel ID</li>
                      <li>Go to Business Settings &rarr; System Users &rarr; create a System User</li>
                      <li>Generate a token with <code className="bg-amber-100 px-1 rounded">ads_management</code> permission</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestMeta}
                      isLoading={testMetaLoading}
                    >
                      Test Connection
                    </Button>
                  </div>
                  <TestResult result={testMetaResult} />
                </CardContent>
              )}
            </Card>

            {/* ── Card 3: Google Analytics 4 ── */}
            <Card variant="elevated">
              <CardHeader>
                <SectionToggle open={ga4Open} onClick={() => setGA4Open(!ga4Open)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">Google Analytics 4 — Measurement Protocol</h3>
                        {integration.is_ga4_enabled && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Enabled</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Send influencer conversions to your GA4 property</p>
                    </div>
                  </div>
                </SectionToggle>
              </CardHeader>

              {ga4Open && (
                <CardContent className="space-y-5">
                  <p className="text-sm text-gray-600">
                    Influencer-attributed purchases are sent to your Google Analytics 4 property as <strong>purchase</strong> events, so they appear in your reports and can be used for audience building.
                  </p>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GA4 Measurement ID</label>
                      <Input
                        placeholder="e.g. G-XXXXXXXXXX"
                        value={integration.ga4_measurement_id || ''}
                        onChange={(e) => integrationField('ga4_measurement_id', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Protocol API Secret</label>
                      <div className="relative">
                        <Input
                          type={showGA4Secret ? 'text' : 'password'}
                          placeholder="Your API secret"
                          value={integration.ga4_api_secret || ''}
                          onChange={(e) => integrationField('ga4_api_secret', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowGA4Secret(!showGA4Secret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showGA4Secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => integrationField('is_ga4_enabled', !integration.is_ga4_enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.is_ga4_enabled ? 'bg-primary-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.is_ga4_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-sm text-gray-700">
                        {integration.is_ga4_enabled ? 'Enabled — forwarding conversions to GA4' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">How to get your credentials:</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-700">
                      <li>In GA4: Admin &rarr; Data Streams &rarr; select your stream &rarr; copy the <strong>Measurement ID</strong> (G-XXXXXXXX)</li>
                      <li>On the same page, scroll to <strong>Measurement Protocol API secrets</strong> &rarr; Create &rarr; copy the secret</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestGA4}
                      isLoading={testGA4Loading}
                    >
                      Test Connection
                    </Button>
                  </div>
                  <TestResult result={testGA4Result} />
                </CardContent>
              )}
            </Card>

            {/* Save all integration settings */}
            <div className="flex justify-end pb-4">
              <Button
                variant="primary"
                onClick={handleSaveIntegration}
                isLoading={isSavingIntegration}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Integration Settings
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
