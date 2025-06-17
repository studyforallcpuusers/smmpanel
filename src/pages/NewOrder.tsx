import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSMMOrders } from '../hooks/useSMMOrders'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingCart, ExternalLink, AlertCircle } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  category: string
  platform: string
  price_per_1000: number
  min_quantity: number
  max_quantity: number
}

const NewOrder: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState('')
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const { createOrder, error } = useSMMOrders()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
    fetchUserBalance()
  }, [user])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('platform', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBalance = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching user balance:', error)
    }
  }

  const calculateCharge = () => {
    if (!selectedService || !quantity) return 0
    const qty = parseInt(quantity)
    return (qty / 1000) * selectedService.price_per_1000
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !link || !quantity) {
      return
    }

    const qty = parseInt(quantity)
    const charge = calculateCharge()

    if (qty < selectedService.min_quantity || qty > selectedService.max_quantity) {
      return
    }

    if (charge > userBalance) {
      return
    }

    setSubmitting(true)

    try {
      await createOrder({
        serviceId: selectedService.id,
        link,
        quantity: qty,
        charge
      })

      navigate('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-gray-600">Place a new order for social media marketing services</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Account Balance</h2>
          <span className="text-2xl font-bold text-green-600">${userBalance.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Service
          </label>
          <select
            value={selectedService?.id || ''}
            onChange={(e) => {
              const service = services.find(s => s.id === e.target.value)
              setSelectedService(service || null)
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Choose a service...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.platform.toUpperCase()} - {service.name} (${service.price_per_1000}/1000)
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{selectedService.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{selectedService.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Price per 1000:</span>
                <span className="ml-2 font-medium">${selectedService.price_per_1000}</span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium capitalize">{selectedService.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Min quantity:</span>
                <span className="ml-2 font-medium">{selectedService.min_quantity}</span>
              </div>
              <div>
                <span className="text-gray-500">Max quantity:</span>
                <span className="ml-2 font-medium">{selectedService.max_quantity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link
          </label>
          <div className="relative">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/username"
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={selectedService?.min_quantity || 1}
            max={selectedService?.max_quantity || 1000000}
            placeholder="Enter quantity"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {selectedService && quantity && (
            <div className="mt-2 text-sm">
              {parseInt(quantity) < selectedService.min_quantity && (
                <p className="text-red-600">Minimum quantity is {selectedService.min_quantity}</p>
              )}
              {parseInt(quantity) > selectedService.max_quantity && (
                <p className="text-red-600">Maximum quantity is {selectedService.max_quantity}</p>
              )}
            </div>
          )}
        </div>

        {selectedService && quantity && (
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Charge:</span>
              <span className="text-2xl font-bold text-indigo-600">${calculateCharge().toFixed(2)}</span>
            </div>
            {calculateCharge() > userBalance && (
              <p className="text-red-600 text-sm mt-2">Insufficient balance. Please add funds to your account.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting || 
            !selectedService || 
            !link || 
            !quantity || 
            parseInt(quantity) < (selectedService?.min_quantity || 0) ||
            parseInt(quantity) > (selectedService?.max_quantity || 0) ||
            calculateCharge() > userBalance
          }
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{submitting ? 'Creating Order...' : 'Place Order'}</span>
        </button>
      </form>
    </div>
  )
}

export default NewOrder