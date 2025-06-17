import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useEmailVerification } from '../hooks/useEmailVerification'
import { supabase } from '../lib/supabase'
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  History,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  payment_method: string
  description: string
  created_at: string
}

const Account: React.FC = () => {
  const { user } = useAuth()
  const { sendVerificationEmail, checkVerificationStatus, loading: emailLoading } = useEmailVerification()
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    fetchAccountData()
  }, [user])

  const fetchAccountData = async () => {
    if (!user) return

    try {
      // Check email verification status
      const verified = await checkVerificationStatus()
      setIsEmailVerified(verified)

      // Fetch user balance
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserBalance(userData.balance)
      }

      // Fetch recent transactions
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionData) {
        setTransactions(transactionData)
      }

      // Generate API key (in real app, this would be stored securely)
      setApiKey(`smm_${user.id.slice(0, 8)}_${Date.now().toString(36)}`)
    } catch (error) {
      console.error('Error fetching account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail()
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'order':
        return <History className="h-4 w-4 text-blue-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Account Balance</p>
              <p className="text-2xl font-bold text-gray-900">${userBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Mail className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Email Status</p>
              <div className="flex items-center space-x-2">
                {isEmailVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Unverified</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="text-lg font-semibold text-gray-900">Standard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.user_metadata?.full_name || ''}
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Email Verification */}
      {!isEmailVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-medium text-yellow-800">Email Verification Required</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            Please verify your email address to access all features and ensure account security.
          </p>
          <button
            onClick={handleSendVerification}
            disabled={emailLoading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {emailLoading ? 'Sending...' : 'Send Verification Email'}
          </button>
        </div>
      )}

      {/* API Access */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Access</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex items-center space-x-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="flex-1 block rounded-md border-gray-300 bg-gray-50 shadow-sm font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use this API key to integrate with our services programmatically
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()} via {transaction.payment_method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                  <p className={`text-sm font-medium ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account