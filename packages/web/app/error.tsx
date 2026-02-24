'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            We encountered an unexpected error. Please try again or contact support if the problem
            persists.
          </p>

          {error.message && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-mono">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => (window.location.href = '/')}>
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <Button variant="primary" size="lg" onClick={() => reset()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
