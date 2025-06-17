import React, { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { stripePromise } from '../lib/payments'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  CreditCard, 
  DollarSign, 
  Bitcoin, 
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import StripePaymentForm from '../components/StripePaymentForm'

const AddFunds: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'coinbase' | 'manual'>('stripe')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const predefinedAmounts = [10, 25, 50, 100, 250, 500]

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString())
  }

  const createTransaction = async (amount: number, method: string, paymentId?: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          payment_method: method,
          payment_id: paymentId,
          status: 'completed',
          description: `Deposit via ${method}`
        })

      if (error) throw error

      // Update user balance
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ balance: userData.balance + amount })
          .eq('id', user.id)
      }

      setSuccess(true)
      setAmount('')
    } catch (error) {
      console.error('Error creating transaction:', error)
      setError('Failed to process payment')
    }
  }

  const handlePayPalSuccess = async (details: any) => {
    const amount = parseFloat(details.purchase_units[0].amount.value)
    await createTransaction(amount, 'paypal', details.id)
  }

  const handleCoinbasePayment = async () => {
    setLoading(true)
    try {
      // Create Coinbase charge
      const response = await fetch('/api/coinbase-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: 'SMM Panel Deposit',
          currency: 'USD'
        })
      })

      const charge = await response.json()
      
      if (charge.hosted_url) {
        window.open(charge.hosted_url, '_blank')
      }
    } catch (error) {
      setError('Failed to create Coinbase payment')
    } finally {
      setLoading(false)
    }
  }

  const handleManualPayment = async () => {
    setLoading(true)
    try {
      // Create pending transaction for manual review
      await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          type: 'deposit',
          amount: parseFloat(amount),
          payment_method: 'manual',
          status: 'pending',
          description: `Manual deposit request - $${amount}`
        })

      setSuccess(true)
      setAmount('')
    } catch (error) {
      setError('Failed to submit manual payment request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-600">Add money to your account wallet</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Payment processed successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Amount</h2>
        
        {/* Predefined amounts */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {predefinedAmounts.map((preAmount) => (
            <button
              key={preAmount}
              onClick={() => handleAmountSelect(preAmount)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                amount === preAmount.toString()
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ${preAmount}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {amount && parseFloat(amount) > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          
          {/* Payment method selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                paymentMethod === 'stripe'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-6 w-6 text-indigo-600" />
              <span className="font-medium">Credit Card</span>
            </button>

            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                paymentMethod === 'paypal'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PP</span>
              </div>
              <span className="font-medium">PayPal</span>
            </button>

            <button
              onClick={() => setPaymentMethod('coinbase')}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                paymentMethod === 'coinbase'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Bitcoin className="h-6 w-6 text-orange-500" />
              <span className="font-medium">Cryptocurrency</span>
            </button>

            <button
              onClick={() => setPaymentMethod('manual')}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                paymentMethod === 'manual'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Plus className="h-6 w-6 text-gray-600" />
              <span className="font-medium">Manual</span>
            </button>
          </div>

          {/* Payment forms */}
          {paymentMethod === 'stripe' && (
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                amount={parseFloat(amount)} 
                onSuccess={(paymentId) => createTransaction(parseFloat(amount), 'stripe', paymentId)}
              />
            </Elements>
          )}

          {paymentMethod === 'paypal' && (
            <PayPalScriptProvider options={{ 
              "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
              currency: "USD"
            }}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        value: amount
                      }
                    }]
                  })
                }}
                onApprove={async (data, actions) => {
                  const details = await actions.order!.capture()
                  await handlePayPalSuccess(details)
                }}
                onError={(err) => {
                  console.error('PayPal error:', err)
                  setError('PayPal payment failed')
                }}
              />
            </PayPalScriptProvider>
          )}

          {paymentMethod === 'coinbase' && (
            <button
              onClick={handleCoinbasePayment}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Payment...' : `Pay $${amount} with Crypto`}
            </button>
          )}

          {paymentMethod === 'manual' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Manual payments require admin approval. Please contact support with your payment details.
                </p>
              </div>
              <button
                onClick={handleManualPayment}
                disabled={loading}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Manual Payment Request'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddFunds