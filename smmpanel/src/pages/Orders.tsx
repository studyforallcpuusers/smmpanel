import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSMMOrders } from '../hooks/useSMMOrders'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react'

interface Order {
  id: string
  service_id: string
  link: string
  quantity: number
  charge: number
  start_count: number
  remains: number
  status: string
  external_order_id: string
  created_at: string
  services: {
    name: string
    platform: string
  }
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { updateOrderStatus } = useSMMOrders()

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services(name, platform)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshOrder = async (order: Order) => {
    setRefreshing(order.id)
    
    try {
      await updateOrderStatus(order.id, order.external_order_id)
      await fetchOrders() // Refresh the list
    } catch (error) {
      console.error('Error refreshing order:', error)
    } finally {
      setRefreshing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'in progress':
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'cancelled':
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in progress':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgress = (order: Order) => {
    if (order.status.toLowerCase() === 'completed') return 100
    if (order.quantity === 0) return 0
    return Math.max(0, ((order.quantity - order.remains) / order.quantity) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">Track your social media marketing orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Start by placing your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.services.platform.toUpperCase()} - {order.services.name}
                    </h3>
                    <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => handleRefreshOrder(order)}
                    disabled={refreshing === order.id}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh order status"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing === order.id ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Link</p>
                  <div className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a 
                      href={order.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate max-w-[200px]"
                    >
                      {order.link}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900">{order.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Charge</p>
                  <p className="text-sm font-medium text-gray-900">${order.charge.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {order.status.toLowerCase() !== 'pending' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getProgress(order))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress(order)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Start: {order.start_count.toLocaleString()}</span>
                    <span>Remains: {order.remains.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders