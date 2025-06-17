import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export { stripePromise }

// Payment method types
export type PaymentMethod = 'stripe' | 'paypal' | 'coinbase' | 'manual'

export interface PaymentIntent {
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  userId: string
}

// Stripe payment processing
export const createStripePaymentIntent = async (amount: number, currency = 'usd') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Coinbase Commerce integration
export const createCoinbaseCharge = async (amount: number, description: string) => {
  try {
    const response = await fetch('/api/coinbase-charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        description,
        currency: 'USD',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Coinbase charge')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Coinbase charge:', error)
    throw error
  }
}