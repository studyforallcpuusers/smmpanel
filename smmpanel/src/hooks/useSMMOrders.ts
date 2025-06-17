import { useState } from 'react'
import { smmApi, SMMOrderRequest } from '../lib/smmApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useSMMOrders = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createOrder = async (orderData: {
    serviceId: string
    link: string
    quantity: number
    charge: number
  }) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    setLoading(true)
    setError(null)

    try {
      // Get service details
      const { data: service } = await supabase
        .from('services')
        .select('external_id')
        .eq('id', orderData.serviceId)
        .single()

      if (!service) {
        throw new Error('Service not found')
      }

      // Check user balance
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (!userData || userData.balance < orderData.charge) {
        throw new Error('Insufficient balance')
      }

      // Create order with SMM API
      const smmOrderRequest: SMMOrderRequest = {
        service: service.external_id,
        link: orderData.link,
        quantity: orderData.quantity
      }

      const smmOrder = await smmApi.createOrder(smmOrderRequest)

      if (!smmOrder) {
        throw new Error('Failed to create order with SMM provider')
      }

      // Save order to database
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_id: orderData.serviceId,
          link: orderData.link,
          quantity: orderData.quantity,
          charge: orderData.charge,
          external_order_id: smmOrder.order,
          start_count: parseInt(smmOrder.start_count) || 0,
          remains: orderData.quantity,
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        throw new Error('Failed to save order to database')
      }

      // Deduct balance
      await supabase
        .from('users')
        .update({ 
          balance: userData.balance - orderData.charge 
        })
        .eq('id', user.id)

      return dbOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, externalOrderId: string) => {
    try {
      const smmOrder = await smmApi.getOrderStatus(externalOrderId)
      
      if (smmOrder) {
        await supabase
          .from('orders')
          .update({
            status: smmOrder.status,
            remains: parseInt(smmOrder.remains) || 0
          })
          .eq('id', orderId)
      }
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  return {
    createOrder,
    updateOrderStatus,
    loading,
    error
  }
}