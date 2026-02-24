'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-20 h-20 text-primary-600 mx-auto mb-6" />

          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
