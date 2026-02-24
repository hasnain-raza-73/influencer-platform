'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { productsService } from '@/services/products-service'
import { Product } from '@/types'

export default function ProductsPage() {
  const router = useRouter()
  const { user, isAuthenticated, brand } = useAuthStore()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BRAND') {
      router.push('/auth/login')
      return
    }

    loadProducts()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, statusFilter, products])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      setError('')
      if (!brand?.id) {
        setError('Brand profile not found. Please log out and log back in.')
        return
      }
      const response = await productsService.getBrandProducts(brand.id)
      setProducts(response.products || [])
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(err.message || 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.status?.toUpperCase() === statusFilter.toUpperCase())
    }

    setFilteredProducts(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await productsService.delete(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete product')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700'
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your product catalog
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => router.push('/brand/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <Input
                placeholder="Search products..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0
                  ? 'Add your first product to start promoting with influencers'
                  : 'Try adjusting your search or filters'}
              </p>
              {products.length === 0 && (
                <Button variant="primary" onClick={() => router.push('/brand/products/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="elevated" className="hover:shadow-large transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Product Image */}
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${getStatusColor(product.status)}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${product.price?.toLocaleString() || '0'}
                          </p>
                        </div>
                        {product.commission_rate && (
                          <div>
                            <p className="text-xs text-gray-500">Commission</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {product.commission_rate}%
                            </p>
                          </div>
                        )}
                        {product.category && (
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {product.category}
                            </p>
                          </div>
                        )}
                        {product.sku && (
                          <div>
                            <p className="text-xs text-gray-500">SKU</p>
                            <p className="text-sm font-mono text-gray-900">
                              {product.sku}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(product.product_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Product
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/brand/products/${product.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
