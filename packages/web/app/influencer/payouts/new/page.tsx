'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, ArrowLeft, Send, CreditCard, Building2, Smartphone } from 'lucide-react'
import { payoutsService, AvailableBalanceResponse } from '@/services/payouts-service'

export default function NewPayoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState<AvailableBalanceResponse | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    method: 'BANK_TRANSFER' as 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE',
    payment_details: {
      account_name: '',
      account_number: '',
      bank_name: '',
      routing_number: '',
      paypal_email: '',
      notes: '',
    },
  })

  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    try {
      setIsLoadingBalance(true)
      const balanceRes = await payoutsService.getAvailableBalance()
      setBalance(balanceRes)

      // If there's a balance, pre-fill the amount
      if (balanceRes && balanceRes.available_balance > 0) {
        setFormData((prev) => ({
          ...prev,
          amount: typeof balanceRes.available_balance === 'number' ? balanceRes.available_balance.toFixed(2) : '0.00',
        }))
      }
    } catch (err: any) {
      console.error('Error loading balance:', err)
      setError('Failed to load available balance')
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount')
        setIsLoading(false)
        return
      }

      if (balance && amount > (balance.available_balance || 0)) {
        setError(`Amount cannot exceed available balance of $${typeof balance.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'}`)
        setIsLoading(false)
        return
      }

      // Validate payment details based on method
      if (formData.method === 'BANK_TRANSFER') {
        if (!formData.payment_details.account_name || !formData.payment_details.account_number) {
          setError('Please provide account name and number for bank transfer')
          setIsLoading(false)
          return
        }
      } else if (formData.method === 'PAYPAL') {
        if (!formData.payment_details.paypal_email) {
          setError('Please provide PayPal email')
          setIsLoading(false)
          return
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.payment_details.paypal_email)) {
          setError('Please provide a valid PayPal email')
          setIsLoading(false)
          return
        }
      }

      // Prepare payout data
      const payoutData = {
        amount,
        method: formData.method,
        payment_details: formData.payment_details,
      }

      await payoutsService.create(payoutData)
      router.push('/influencer/payouts')
    } catch (err: any) {
      console.error('Error creating payout request:', err)
      setError(err.message || 'Failed to create payout request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handlePaymentDetailChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      payment_details: {
        ...formData.payment_details,
        [field]: value,
      },
    })
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return <Building2 className="w-5 h-5" />
      case 'PAYPAL':
        return <CreditCard className="w-5 h-5" />
      case 'STRIPE':
        return <Smartphone className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Payout</h1>
              <p className="text-sm text-gray-600 mt-1">
                Withdraw your available earnings
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/influencer/payouts')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingBalance ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Available Balance */}
            {balance && (
              <Card variant="elevated" className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Balance</p>
                    <p className="text-4xl font-bold text-gray-900">
                      ${typeof balance.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Payout Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Amount */}
                <Input
                  label="Payout Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance?.available_balance || 0}
                  placeholder="0.00"
                  required
                  leftIcon={<DollarSign className="w-5 h-5" />}
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  helperText={
                    balance
                      ? `Maximum: $${typeof balance.available_balance === 'number' ? balance.available_balance.toFixed(2) : '0.00'}`
                      : 'Enter the amount you want to withdraw'
                  }
                />

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
                      { value: 'PAYPAL', label: 'PayPal', icon: CreditCard },
                      { value: 'STRIPE', label: 'Stripe', icon: Smartphone },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => handleChange('method', method.value)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.method === method.value
                            ? 'border-secondary-500 bg-secondary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <method.icon className={`w-6 h-6 mx-auto mb-2 ${
                          formData.method === method.value ? 'text-secondary-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          formData.method === method.value ? 'text-secondary-900' : 'text-gray-700'
                        }`}>
                          {method.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Details - Bank Transfer */}
                {formData.method === 'BANK_TRANSFER' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Bank Account Details</h4>

                    <Input
                      label="Account Name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.payment_details.account_name}
                      onChange={(e) => handlePaymentDetailChange('account_name', e.target.value)}
                    />

                    <Input
                      label="Account Number"
                      type="text"
                      placeholder="1234567890"
                      required
                      value={formData.payment_details.account_number}
                      onChange={(e) => handlePaymentDetailChange('account_number', e.target.value)}
                    />

                    <Input
                      label="Bank Name"
                      type="text"
                      placeholder="Chase Bank"
                      value={formData.payment_details.bank_name}
                      onChange={(e) => handlePaymentDetailChange('bank_name', e.target.value)}
                    />

                    <Input
                      label="Routing Number (Optional)"
                      type="text"
                      placeholder="021000021"
                      value={formData.payment_details.routing_number}
                      onChange={(e) => handlePaymentDetailChange('routing_number', e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Details - PayPal */}
                {formData.method === 'PAYPAL' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">PayPal Account Details</h4>

                    <Input
                      label="PayPal Email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.payment_details.paypal_email}
                      onChange={(e) => handlePaymentDetailChange('paypal_email', e.target.value)}
                      helperText="The email associated with your PayPal account"
                    />
                  </div>
                )}

                {/* Payment Details - Stripe */}
                {formData.method === 'STRIPE' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      You will receive payment via Stripe Connect. Make sure your Stripe account is connected in your profile settings.
                    </p>
                  </div>
                )}

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 resize-none"
                    rows={3}
                    placeholder="Add any additional notes or instructions..."
                    value={formData.payment_details.notes}
                    onChange={(e) => handlePaymentDetailChange('notes', e.target.value)}
                  />
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Important:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Payout requests are processed within 3-5 business days</li>
                    <li>• Ensure all payment details are correct to avoid delays</li>
                    <li>• You will receive an email confirmation once processed</li>
                    <li>• Minimum payout amount may apply based on your payment method</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/influencer/payouts')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={!balance || balance.available_balance === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Payout Request
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
