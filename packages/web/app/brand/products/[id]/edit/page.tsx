'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Upload, X, Clock } from 'lucide-react'
import { productsService } from '@/services/products-service'
import { uploadService } from '@/services/upload-service'
import { Product } from '@/types'

interface UploadedImage {
  url: string
  uploading: boolean
  error?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    product_url: '',
    category: '',
    commission_rate: '',
    sku: '',
  })

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setIsLoadingProduct(true)
      setError('')
      const productData = await productsService.getById(productId)
      setProduct(productData)

      setFormData({
        name: productData.name,
        description: productData.description || '',
        price: productData.price?.toString() || '',
        product_url: productData.product_url,
        category: productData.category || '',
        commission_rate: productData.commission_rate?.toString() || '',
        sku: productData.sku || '',
      })

      // Pre-populate images from existing image_urls
      if (productData.image_urls && productData.image_urls.length > 0) {
        setImages(productData.image_urls.map((url) => ({ url, uploading: false })))
      } else if (productData.image_url) {
        setImages([{ url: productData.image_url, uploading: false }])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleFiles = async (files: FileList) => {
    const remaining = 8 - images.filter((i) => !i.error).length
    const toUpload = Array.from(files).slice(0, remaining)

    const placeholders: UploadedImage[] = toUpload.map(() => ({ url: '', uploading: true }))
    setImages((prev) => [...prev, ...placeholders])

    for (let i = 0; i < toUpload.length; i++) {
      try {
        const url = await uploadService.uploadImage(toUpload[i])
        setImages((prev) => {
          const updated = [...prev]
          const idx = updated.findIndex((img, j) => img.uploading && j >= prev.length - toUpload.length + i)
          if (idx !== -1) updated[idx] = { url, uploading: false }
          return updated
        })
      } catch {
        setImages((prev) => {
          const updated = [...prev]
          const idx = updated.findIndex((img, j) => img.uploading && j >= prev.length - toUpload.length + i)
          if (idx !== -1) updated[idx] = { url: '', uploading: false, error: 'Failed to upload' }
          return updated
        })
      }
    }
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.name || !formData.price || !formData.product_url) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      const price = parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        setError('Price must be a valid positive number')
        setIsLoading(false)
        return
      }

      const image_urls = images.filter((i) => i.url && !i.error).map((i) => i.url)

      await productsService.update(productId, {
        name: formData.name,
        description: formData.description || undefined,
        price,
        product_url: formData.product_url,
        image_urls,
        image_url: image_urls[0] || undefined,
        category: formData.category || undefined,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : undefined,
        sku: formData.sku || undefined,
      })

      router.push('/brand/products')
    } catch (err: any) {
      setError(err.message || 'Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const validImages = images.filter((i) => i.url && !i.uploading && !i.error)
  const uploadingCount = images.filter((i) => i.uploading).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600 mt-1">Changes will be submitted for admin review</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/brand/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Review notice */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Edits Require Admin Review</p>
                    <p className="text-xs text-amber-700 mt-0.5">Saving changes will resubmit this product for admin approval before it becomes visible to influencers.</p>
                  </div>
                </div>

                {/* Product Name */}
                <Input
                  label="Product Name *"
                  type="text"
                  placeholder="Enter product name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                {/* Multi-Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images <span className="text-gray-400 font-normal">(up to 8 images)</span>
                  </label>

                  {validImages.length < 8 && (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">Drop images here or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP or GIF — max 5 MB each</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      />
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          {img.uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : img.error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                              <X className="w-5 h-5 text-red-400" />
                              <p className="text-xs text-red-500 mt-1 text-center">Failed</p>
                            </div>
                          ) : (
                            <>
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">Primary</span>
                              )}
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadingCount > 0 && (
                    <p className="text-xs text-gray-500 mt-2">Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Price *"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    leftIcon={<span className="text-gray-500">$</span>}
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                  />
                  <Input
                    label="Commission Rate (Optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="10.00"
                    rightIcon={<span className="text-gray-500">%</span>}
                    value={formData.commission_rate}
                    onChange={(e) => handleChange('commission_rate', e.target.value)}
                    helperText="Override default commission for this product"
                  />
                </div>

                <Input
                  label="Product URL *"
                  type="url"
                  placeholder="https://yourstore.com/products/..."
                  required
                  value={formData.product_url}
                  onChange={(e) => handleChange('product_url', e.target.value)}
                  helperText="The direct link to this product on your store"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Category (Optional)"
                    type="text"
                    placeholder="e.g., Electronics, Fashion"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  />
                  <Input
                    label="SKU (Optional)"
                    type="text"
                    placeholder="e.g., PROD-001"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => router.push('/brand/products')} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading} disabled={uploadingCount > 0}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
