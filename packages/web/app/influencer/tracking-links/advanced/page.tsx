'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Link as LinkIcon,
  ArrowLeft,
  Save,
  Package,
  Target,
  CheckCircle,
  XCircle,
  Loader,
  Plus,
  Trash2,
  Palette,
  Type,
  Globe,
} from 'lucide-react'
import { trackingService } from '@/services/tracking-service'
import { productsService } from '@/services/products-service'
import { campaignsService } from '@/services/campaigns-service'
import { Product, Campaign } from '@/types'

export default function AdvancedTrackingLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const campaignIdParam = searchParams.get('campaign_id')

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Slug availability checking
  const [customSlug, setCustomSlug] = useState('')
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<{
    available: boolean | null
    suggestions: string[]
  }>({ available: null, suggestions: [] })

  const [formData, setFormData] = useState({
    product_ids: [] as string[],
    campaign_id: '',
    custom_slug: '',
    is_bio_link: false,
    landing_page_config: {
      title: '',
      description: '',
      theme: 'default',
      primary_color: '#3b82f6',
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoadingData(true)
      const [productsRes, campaignsRes] = await Promise.all([
        productsService.getAll().catch(() => ({ products: [] })),
        campaignsService.getActiveCampaigns().catch(() => []),
      ])
      setProducts(productsRes.products || [])
      setCampaigns(campaignsRes || [])

      // Pre-select campaign if provided in URL
      if (campaignIdParam) {
        setFormData((prev) => ({ ...prev, campaign_id: campaignIdParam }))
      }
    } catch (err: any) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Products filtered by selected campaign's target_product_ids
  const availableProducts = (() => {
    if (!formData.campaign_id) return products
    const campaign = campaigns.find((c) => c.id === formData.campaign_id)
    if (!campaign || !campaign.target_product_ids || campaign.target_product_ids.length === 0) {
      return products
    }
    return products.filter((p) => campaign.target_product_ids!.includes(p.id))
  })()

  const handleCheckSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus({ available: null, suggestions: [] })
      return
    }

    try {
      setIsCheckingSlug(true)
      const result = await trackingService.checkSlugAvailability(slug)
      setSlugStatus({
        available: result.available,
        suggestions: result.suggestions || [],
      })
    } catch (err: any) {
      console.error('Error checking slug:', err)
      setSlugStatus({ available: false, suggestions: [] })
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setCustomSlug(sanitized)
    setFormData({ ...formData, custom_slug: sanitized })

    // Debounce the check
    if (sanitized.length >= 3) {
      const timer = setTimeout(() => handleCheckSlug(sanitized), 500)
      return () => clearTimeout(timer)
    } else {
      setSlugStatus({ available: null, suggestions: [] })
    }
  }

  const handleToggleProduct = (productId: string) => {
    const newProductIds = formData.product_ids.includes(productId)
      ? formData.product_ids.filter((id) => id !== productId)
      : [...formData.product_ids, productId]
    setFormData({ ...formData, product_ids: newProductIds })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      if (formData.product_ids.length === 0) {
        setError('Please select at least one product')
        setIsLoading(false)
        return
      }

      if (formData.product_ids.length > 10) {
        setError('Maximum 10 products allowed per link')
        setIsLoading(false)
        return
      }

      if (formData.custom_slug && !slugStatus.available) {
        setError('Please choose an available slug or leave it blank for auto-generation')
        setIsLoading(false)
        return
      }

      const linkData = {
        product_ids: formData.product_ids,
        campaign_id: formData.campaign_id || undefined,
        custom_slug: formData.custom_slug || undefined,
        is_bio_link: formData.is_bio_link,
        landing_page_config:
          formData.landing_page_config.title || formData.landing_page_config.description
            ? formData.landing_page_config
            : undefined,
      }

      await trackingService.createAdvanced(linkData)
      router.push('/influencer/tracking-links')
    } catch (err: any) {
      console.error('Error creating advanced tracking link:', err)
      setError(err.message || 'Failed to create tracking link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    // When campaign changes, reset product selection
    if (field === 'campaign_id') {
      setFormData({ ...formData, [field]: value, product_ids: [] })
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleLandingPageConfigChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      landing_page_config: {
        ...formData.landing_page_config,
        [field]: value,
      },
    })
  }

  const selectedCampaign = campaigns.find((c) => c.id === formData.campaign_id)
  const selectedProducts = availableProducts.filter((p) => formData.product_ids.includes(p.id))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Advanced Tracking Link</h1>
              <p className="text-sm text-gray-600 mt-1">
                Custom slug, multi-product, and Link-in-Bio support
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/influencer/tracking-links')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Custom Slug */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Custom Slug
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Slug (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., my-summer-promo"
                        value={customSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="flex-1"
                      />
                      {isCheckingSlug && <Loader className="w-5 h-5 animate-spin text-gray-400" />}
                      {!isCheckingSlug && slugStatus.available === true && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {!isCheckingSlug && slugStatus.available === false && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank to auto-generate. Only lowercase letters, numbers, and hyphens allowed.
                    </p>

                    {/* Slug Status */}
                    {slugStatus.available === true && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        ✓ Slug is available!
                      </div>
                    )}
                    {slugStatus.available === false && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700 mb-2">✗ Slug is already taken</p>
                        {slugStatus.suggestions.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                              {slugStatus.suggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleSlugChange(suggestion)}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Link-in-Bio Toggle */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_bio_link"
                      checked={formData.is_bio_link}
                      onChange={(e) => handleChange('is_bio_link', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <label htmlFor="is_bio_link" className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium text-purple-900">Add to Link-in-Bio</p>
                      <p className="text-xs text-purple-700">
                        Display this link on your public bio page
                      </p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Campaign (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={formData.campaign_id}
                    onChange={(e) => handleChange('campaign_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="">No specific campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} - {campaign.commission_rate}% commission
                      </option>
                    ))}
                  </select>
                  {selectedCampaign && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">{selectedCampaign.name}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {selectedCampaign.commission_rate}% commission
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Multi-Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Products (1-10) <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Select 1-10 products for this link. Selected: {formData.product_ids.length}
                  </p>
                  {availableProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">No products available</p>
                  ) : (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {availableProducts.map((product) => {
                        const isSelected = formData.product_ids.includes(product.id)
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleToggleProduct(product.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-600">
                                  ${product.price} • {product.commission_rate || 'Default'} commission
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Products Preview */}
              {selectedProducts.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">
                      Selected Products ({selectedProducts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-900 flex items-center gap-2"
                        >
                          {product.name}
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(product.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Landing Page Customization */}
              {selectedProducts.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Landing Page Customization (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., My Summer Collection"
                        value={formData.landing_page_config.title}
                        onChange={(e) => handleLandingPageConfigChange('title', e.target.value)}
                        leftIcon={<Type className="w-5 h-5" />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your products..."
                        value={formData.landing_page_config.description}
                        onChange={(e) => handleLandingPageConfigChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                          value={formData.landing_page_config.theme}
                          onChange={(e) => handleLandingPageConfigChange('theme', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                        >
                          <option value="default">Default</option>
                          <option value="minimal">Minimal</option>
                          <option value="bold">Bold</option>
                          <option value="elegant">Elegant</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={formData.landing_page_config.primary_color}
                          onChange={(e) => handleLandingPageConfigChange('primary_color', e.target.value)}
                          className="w-full h-11 px-2 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Advanced Features:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Custom slugs make your links memorable and brandable</li>
                  <li>• Multi-product links create beautiful landing pages</li>
                  <li>• Link-in-Bio displays your link on your public profile</li>
                  <li>• Landing page customization lets you match your brand</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/influencer/tracking-links')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                  disabled={formData.product_ids.length === 0 || formData.product_ids.length > 10}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Advanced Link
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
