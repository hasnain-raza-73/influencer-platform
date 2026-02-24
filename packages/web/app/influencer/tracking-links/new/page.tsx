'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link as LinkIcon, ArrowLeft, Save, Package, Target } from 'lucide-react'
import { trackingService } from '@/services/tracking-service'
import { productsService } from '@/services/products-service'
import { campaignsService } from '@/services/campaigns-service'
import { Product, Campaign } from '@/types'

export default function NewTrackingLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const campaignIdParam = searchParams.get('campaign_id')

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const [formData, setFormData] = useState({
    product_id: '',
    campaign_id: '',
    custom_code: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.product_id) {
        setError('Please select a product')
        setIsLoading(false)
        return
      }

      const linkData = {
        product_id: formData.product_id,
        campaign_id: formData.campaign_id || undefined,
        custom_code: formData.custom_code || undefined,
      }

      await trackingService.create(linkData)
      router.push('/influencer/tracking-links')
    } catch (err: any) {
      console.error('Error creating tracking link:', err)
      setError(err.message || 'Failed to create tracking link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    // When campaign changes, reset product selection
    if (field === 'campaign_id') {
      setFormData({ ...formData, [field]: value, product_id: '' })
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  const selectedProduct = availableProducts.find((p) => p.id === formData.product_id)
  const selectedCampaign = campaigns.find((c) => c.id === formData.campaign_id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Tracking Link</h1>
              <p className="text-sm text-gray-600 mt-1">
                Generate a unique tracking link to promote products
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
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Link Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Campaign Selection first — affects product list */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign (Optional)
                  </label>
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
                  <p className="mt-1 text-xs text-gray-500">
                    Selecting a campaign filters the product list to that campaign&apos;s products
                  </p>
                </div>

                {/* Selected Campaign Preview */}
                {selectedCampaign && (
                  <Card variant="bordered" className="bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{selectedCampaign.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedCampaign.commission_rate}% commission
                            {selectedCampaign.budget && ` • $${selectedCampaign.budget?.toLocaleString() || '0'} budget`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product <span className="text-red-500">*</span>
                    {formData.campaign_id && selectedCampaign?.target_product_ids?.length ? (
                      <span className="ml-2 text-xs font-normal text-blue-600">
                        ({availableProducts.length} products in this campaign)
                      </span>
                    ) : null}
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleChange('product_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                        {product.commission_rate && ` (${product.commission_rate}% commission)`}
                      </option>
                    ))}
                  </select>
                  {availableProducts.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.campaign_id
                        ? 'No products assigned to this campaign yet.'
                        : 'No products available.'}
                    </p>
                  )}
                </div>

                {/* Selected Product Preview */}
                {selectedProduct && (
                  <Card variant="bordered" className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {selectedProduct.image_url ? (
                          <img
                            src={selectedProduct.image_url}
                            alt={selectedProduct.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            ${selectedProduct.price} •{' '}
                            {selectedProduct.commission_rate || 'Default'} commission
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Custom Code (Optional) */}
                <Input
                  label="Custom Code (Optional)"
                  type="text"
                  placeholder="e.g., SUMMER2024"
                  value={formData.custom_code}
                  onChange={(e) => handleChange('custom_code', e.target.value)}
                  helperText="Leave blank to auto-generate a unique code"
                  leftIcon={<LinkIcon className="w-5 h-5" />}
                />

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• A unique tracking link will be generated for you</li>
                    <li>• Share this link on your social media, blog, or other channels</li>
                    <li>• Every click and conversion will be tracked automatically</li>
                    <li>• Earn commission on every sale made through your link</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-6 border-t">
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
                    disabled={!formData.product_id}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Tracking Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
    </div>
  )
}
