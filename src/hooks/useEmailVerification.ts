import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const sendVerificationEmail = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate verification token
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours expiry

      // Store verification token
      const { error: dbError } = await supabase
        .from('email_verifications')
        .insert({
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })

      if (dbError) throw dbError

      // Send verification email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: user.email,
          token,
          userName: user.user_metadata?.full_name || user.email
        }
      })

      if (emailError) throw emailError

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification email'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      // Verify token
      const { data: verification, error: verifyError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .is('verified_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (verifyError || !verification) {
        throw new Error('Invalid or expired verification token')
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', verification.id)

      if (updateError) throw updateError

      // Update user verification status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', verification.user_id)

      if (userUpdateError) throw userUpdateError

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify email'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkVerificationStatus = async () => {
    if (!user) return false

    try {
      const { data } = await supabase
        .from('users')
        .select('is_email_verified')
        .eq('id', user.id)
        .single()

      return data?.is_email_verified || false
    } catch (error) {
      console.error('Error checking verification status:', error)
      return false
    }
  }

  return {
    sendVerificationEmail,
    verifyEmail,
    checkVerificationStatus,
    loading,
    error
  }
}