import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEmailVerification } from '../hooks/useEmailVerification'
import { useAuth } from '../contexts/AuthContext'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sendVerificationEmail, verifyEmail, checkVerificationStatus, loading, error } = useEmailVerification()
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending')
  const [isVerified, setIsVerified] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      handleTokenVerification()
    } else {
      checkCurrentStatus()
    }
  }, [token])

  const handleTokenVerification = async () => {
    if (!token) return

    try {
      await verifyEmail(token)
      setVerificationStatus('verified')
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (error) {
      setVerificationStatus('error')
    }
  }

  const checkCurrentStatus = async () => {
    const verified = await checkVerificationStatus()
    setIsVerified(verified)
    if (verified) {
      navigate('/dashboard')
    }
  }

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail()
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }
  }

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {verificationStatus === 'pending' && (
            <div>
              <RefreshCw className="h-12 w-12 text-indigo-600 mx-auto animate-spin" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifying Email</h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {verificationStatus === 'verified' && (
            <div>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been successfully verified. Redirecting to dashboard...
              </p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-600">
                {error || 'The verification link is invalid or has expired.'}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="h-12 w-12 text-indigo-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Please check your email and click the verification link to activate your account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Didn't receive the email?</p>
              <button
                onClick={handleSendVerification}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now (you can verify later)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification