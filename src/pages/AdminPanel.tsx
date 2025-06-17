import React, { useState, useEffect } from 'react'
import { useSMMServices } from '../hooks/useSMMServices'
import { supabase } from '../lib/supabase'
import { 
  RefreshCw, 
  Database, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  Eye,
  Trash2
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingTransactions: number
}

interface User {
  id: string
  email: string
  full_name: string
  balance: number
  is_email_verified: boolean
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  status: string
  payment_method: string
  description: string
  created_at: string
  users: {
    email: string
  }
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'services'>('overview')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingTransactions: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [providerBalances, setProviderBalances] = useState<{ provider: string; balance: number }[]>([])
  const [loading, setLoading] = useState(true)

  const { syncServicesWithDatabase, getProviderBalances, getProviderStatus, loading: servicesLoading, error } = useSMMServices()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersData, ordersData, transactionsData] = await Promise.all([
        supabase.from('users').select('id, balance'),
        supabase.from('orders').select('id, charge'),
        supabase.from('transactions').select('amount, status').eq('type', 'deposit')
      ])

      const totalUsers = usersData.data?.length || 0
      const totalOrders = ordersData.data?.length || 0
      const totalRevenue = transactionsData.data
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      const pendingTransactions = transactionsData.data
        ?.filter(t => t.status === 'pending').length || 0

      setStats({ totalUsers, totalOrders, totalRevenue, pendingTransactions })

      // Fetch users
      const { data: usersFullData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (usersFullData) setUsers(usersFullData)

      // Fetch transactions
      const { data: transactionsFullData } = await supabase
        .from('transactions')
        .select(`
          *,
          users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsFullData) setTransactions(transactionsFullData)

      // Fetch provider balances
      const balances = await getProviderBalances()
      setProviderBalances(balances)

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncServices = async () => {
    await syncServicesWithDatabase()
    await fetchAdminData()
  }

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId)

      await fetchAdminData()
    } catch (error) {
      console.error('Error approving transaction:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      await fetchAdminData()
    } catch (error) {
      console.error('Error deleting user:', error)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage your SMM panel platform</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Database },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'transactions', name: 'Transactions', icon: CreditCard },
            { id: 'services', name: 'Services', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Balances */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providerBalances.map((provider) => (
                <div key={provider.provider} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">{provider.provider}</p>
                  <p className="text-xl font-bold text-gray-900">${provider.balance.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${user.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_email_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transactions Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.users?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {transaction.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleApproveTransaction(transaction.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Service Sync */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Service Synchronization</h2>
                <p className="text-sm text-gray-600">Sync services from SMM API providers to your database</p>
              </div>
              <button
                onClick={handleSyncServices}
                disabled={servicesLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${servicesLoading ? 'animate-spin' : ''}`} />
                <span>{servicesLoading ? 'Syncing...' : 'Sync Services'}</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Provider Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getProviderStatus().map((provider) => (
                <div key={provider.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{provider.name}</p>
                    <div className="flex items-center space-x-2">
                      {provider.isActive && provider.hasApiKey ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {provider.isActive && provider.hasApiKey ? 'Active' : 'Inactive'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Environment Variables Required</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Add the following environment variables to your .env file:
              </p>
              <div className="bg-yellow-100 rounded p-3 font-mono text-sm space-y-1">
                <div>VITE_SMM_PROVIDER1_API_KEY=your_jap_api_key_here</div>
                <div>VITE_SMM_PROVIDER2_API_KEY=your_peakerr_api_key_here</div>
                <div>VITE_SMM_PROVIDER3_API_KEY=your_smm_heaven_api_key_here</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel