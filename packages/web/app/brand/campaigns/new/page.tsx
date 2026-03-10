'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, ArrowLeft, Save, Calendar, DollarSign, Package, Search, X, Check, Users, Globe } from 'lucide-react'
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
    campaign_type: 'OPEN' as 'OPEN' | 'SPECIFIC',
    country: '',
    currency: 'USD',
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
        campaign_type: formData.campaign_type,
        country: formData.country || undefined,
        currency: formData.currency,
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

              {/* Campaign Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Campaign Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OPEN Campaign */}
                  <div
                    onClick={() => handleChange('campaign_type', 'OPEN')}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.campaign_type === 'OPEN'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        formData.campaign_type === 'OPEN' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      }`}>
                        {formData.campaign_type === 'OPEN' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">Open Campaign</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Visible to all influencers. Anyone can create tracking links and promote your products.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SPECIFIC Campaign */}
                  <div
                    onClick={() => handleChange('campaign_type', 'SPECIFIC')}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.campaign_type === 'SPECIFIC'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        formData.campaign_type === 'SPECIFIC' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      }`}>
                        {formData.campaign_type === 'SPECIFIC' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">Invitation-Only</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Only invited influencers can participate. You choose who can promote your products.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {formData.campaign_type === 'SPECIFIC' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 You'll be able to invite specific influencers after creating the campaign.
                    </p>
                  </div>
                )}
              </div>

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                    <option value="FI">Finland</option>
                    <option value="PL">Poland</option>
                    <option value="CZ">Czech Republic</option>
                    <option value="AT">Austria</option>
                    <option value="CH">Switzerland</option>
                    <option value="BE">Belgium</option>
                    <option value="IE">Ireland</option>
                    <option value="PT">Portugal</option>
                    <option value="GR">Greece</option>
                    <option value="TR">Turkey</option>
                    <option value="RU">Russia</option>
                    <option value="UA">Ukraine</option>
                    <option value="RO">Romania</option>
                    <option value="HU">Hungary</option>
                    <option value="BG">Bulgaria</option>
                    <option value="HR">Croatia</option>
                    <option value="SI">Slovenia</option>
                    <option value="SK">Slovakia</option>
                    <option value="LT">Lithuania</option>
                    <option value="LV">Latvia</option>
                    <option value="EE">Estonia</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="IN">India</option>
                    <option value="KR">South Korea</option>
                    <option value="SG">Singapore</option>
                    <option value="HK">Hong Kong</option>
                    <option value="TW">Taiwan</option>
                    <option value="TH">Thailand</option>
                    <option value="MY">Malaysia</option>
                    <option value="ID">Indonesia</option>
                    <option value="PH">Philippines</option>
                    <option value="VN">Vietnam</option>
                    <option value="NZ">New Zealand</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="AR">Argentina</option>
                    <option value="CL">Chile</option>
                    <option value="CO">Colombia</option>
                    <option value="PE">Peru</option>
                    <option value="ZA">South Africa</option>
                    <option value="NG">Nigeria</option>
                    <option value="EG">Egypt</option>
                    <option value="KE">Kenya</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="IL">Israel</option>
                    <option value="PK">Pakistan</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">Target market for this campaign</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="DKK">DKK - Danish Krone</option>
                    <option value="PLN">PLN - Polish Zloty</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="RON">RON - Romanian Leu</option>
                    <option value="BGN">BGN - Bulgarian Lev</option>
                    <option value="HRK">HRK - Croatian Kuna</option>
                    <option value="RUB">RUB - Russian Ruble</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="ARS">ARS - Argentine Peso</option>
                    <option value="CLP">CLP - Chilean Peso</option>
                    <option value="COP">COP - Colombian Peso</option>
                    <option value="PEN">PEN - Peruvian Sol</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="ILS">ILS - Israeli Shekel</option>
                    <option value="KRW">KRW - South Korean Won</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                    <option value="TWD">TWD - Taiwan Dollar</option>
                    <option value="THB">THB - Thai Baht</option>
                    <option value="MYR">MYR - Malaysian Ringgit</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="PHP">PHP - Philippine Peso</option>
                    <option value="VND">VND - Vietnamese Dong</option>
                    <option value="NZD">NZD - New Zealand Dollar</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">Budget and payout currency</p>
                </div>
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
