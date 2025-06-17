import React, { useState } from 'react'
import { useSMMServices } from '../hooks/useSMMServices'
import { smmApi } from '../lib/smmApi'
import { RefreshCw, Database, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

const AdminPanel: React.FC = () => {
  const [providerBalance, setProviderBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const { syncServicesWithDatabase, loading, error } = useSMMServices()

  const handleSyncServices = async () => {
    await syncServicesWithDatabase()
  }

  const handleCheckBalance = async () => {
    setBalanceLoading(true)
    try {
      const balance = await smmApi.getBalance()
      setProviderBalance(balance)
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setBalanceLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage SMM API integration and services</p>
      </div>

      {/* Provider Balance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Provider Balance</h2>
          <button
            onClick={handleCheckBalance}
            disabled={balanceLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <DollarSign className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
            <span>{balanceLoading ? 'Checking...' : 'Check Balance'}</span>
          </button>
        </div>
        
        {providerBalance !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Provider Balance: ${providerBalance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Service Sync */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Service Synchronization</h2>
            <p className="text-sm text-gray-600">Sync services from SMM API providers to your database</p>
          </div>
          <button
            onClick={handleSyncServices}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Services'}</span>
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

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Fetches all available services from configured SMM API providers</li>
            <li>• Transforms service data to match your database schema</li>
            <li>• Updates existing services or creates new ones</li>
            <li>• Maintains service pricing and availability information</li>
          </ul>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Environment Variables Required</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Add the following environment variables to your .env file:
            </p>
            <div className="bg-yellow-100 rounded p-3 font-mono text-sm">
              <div>VITE_SMM_PROVIDER1_API_KEY=your_api_key_here</div>
              <div>VITE_SMM_PROVIDER2_API_KEY=your_api_key_here</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Supported Providers</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Generic SMM Panel APIs (most common format)</li>
              <li>• Supports standard endpoints: services, add, status, balance</li>
              <li>• Automatic failover between multiple providers</li>
              <li>• Real-time order status updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel