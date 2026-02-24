'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, ArrowLeft, Save, Calendar, DollarSign, Package, Search, X, Check } from 'lucide-react'
import { campaignsService } from '@/services/campaigns-service'
import { productsService } from '@/services/products-service'
import { Product } from '@/types'

export default function NewCampaignPage() {
  const router = useRouter()
  const { user, brand } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commission_rate: '',
    budget: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (brand?.id) {
      loadProducts(brand.id)
    } else {
      setIsLoadingProducts(false)
    }
  }, [brand])

  const loadProducts = async (brandId: string) => {
    try {
      setIsLoadingProducts(true)
      const response = await productsService.getBrandProducts(brandId)
      setProducts(response.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  )

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.name || !formData.commission_rate) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      const commissionRate = parseFloat(formData.commission_rate)
      if (isNaN(commissionRate) || commissionRate <= 0 || commissionRate > 100) {
        setError('Commission rate must be between 0 and 100')
        setIsLoading(false)
        return
      }

      if (formData.budget) {
        const budget = parseFloat(formData.budget)
        if (isNaN(budget) || budget <= 0) {
          setError('Budget must be a valid positive number')
          setIsLoading(false)
          return
        }
      }

      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date)
        const endDate = new Date(formData.end_date)
        if (endDate <= startDate) {
          setError('End date must be after start date')
          setIsLoading(false)
          return
        }
      }

      const campaignData = {
        name: formData.name,
        description: formData.description || undefined,
        commission_rate: commissionRate,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        target_product_ids: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      }

      await campaignsService.create(campaignData)
      router.push('/brand/campaigns')
    } catch (err: any) {
      console.error('Error creating campaign:', err)
      setError(err.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="text-sm text-gray-600 mt-1">
                Set up a new marketing campaign for influencers
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/brand/campaigns')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Info */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Campaign Name"
                type="text"
                placeholder="Enter campaign name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                helperText="A clear, descriptive name for your campaign"
                leftIcon={<Target className="w-5 h-5" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={4}
                  placeholder="Describe your campaign goals, target audience, and key messages..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Commission Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="10.00"
                  required
                  rightIcon={<span className="text-gray-500">%</span>}
                  value={formData.commission_rate}
                  onChange={(e) => handleChange('commission_rate', e.target.value)}
                  helperText="Percentage influencers earn per sale"
                />

                <Input
                  label="Budget (Optional)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-5 h-5" />}
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  helperText="Total budget allocated for this campaign"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  type="date"
                  min={getTodayDate()}
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  helperText="When the campaign becomes active"
                  leftIcon={<Calendar className="w-5 h-5" />}
                />

                <Input
                  label="End Date (Optional)"
                  type="date"
                  min={formData.start_date || getTodayDate()}
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  helperText="Leave blank for ongoing campaign"
                  leftIcon={<Calendar className="w-5 h-5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Select Campaign Products
                {selectedProductIds.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {selectedProductIds.length} selected
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Choose which of your products influencers can promote in this campaign. Leave empty to allow all products.
              </p>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Selected products chips */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                  {selectedProducts.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary-300 rounded-full text-xs font-medium text-primary-700"
                    >
                      {p.name}
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Product list */}
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {products.length === 0
                      ? 'No products found. Add products first.'
                      : 'No products match your search.'}
                  </p>
                  {products.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push('/brand/products/new')}
                    >
                      Add Products
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/brand/campaigns')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
