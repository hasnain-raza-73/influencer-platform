'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { trackingService } from '@/services/tracking-service'

export default function TrackingRedirectPage() {
  const params = useParams()
  const trackingCode = params.code as string

  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    if (!trackingCode) {
      setError('Invalid tracking link')
      setIsRedirecting(false)
      return
    }

    handleTracking()
  }, [trackingCode])

  const handleTracking = async () => {
    try {
      // Record the click and get the redirect URL
      const response = await trackingService.recordClick(trackingCode)

      if (response && response.redirect_url) {
        // Redirect to the product URL
        window.location.href = response.redirect_url
      } else {
        setError('Product URL not found')
        setIsRedirecting(false)
      }
    } catch (err: any) {
      console.error('Error tracking click:', err)

      if (err.response?.status === 404) {
        setError('This tracking link does not exist or has been removed')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Unable to process this tracking link. Please try again later.')
      }

      setIsRedirecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full">
        <CardContent className="p-12 text-center">
          {isRedirecting ? (
            <>
              <Loader2 className="w-16 h-16 text-secondary-600 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Redirecting...
              </h2>
              <p className="text-gray-600">
                Please wait while we redirect you to the product page
              </p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Homepage
              </Link>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
