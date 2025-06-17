import { useState, useEffect } from 'react'
import { smmApi, SMMService } from '../lib/smmApi'
import { supabase } from '../lib/supabase'

export const useSMMServices = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const syncServicesWithDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch services from SMM API
      const apiServices = await smmApi.getServices()
      
      // Transform API services to match our database schema
      const transformedServices = apiServices.map(service => ({
        external_id: service.service,
        name: service.name,
        description: service.name,
        category: service.category || 'other',
        platform: service.type || 'instagram',
        price_per_1000: parseFloat(service.rate),
        min_quantity: parseInt(service.min),
        max_quantity: parseInt(service.max),
        is_active: true
      }))

      // Batch insert/update services in database
      for (const service of transformedServices) {
        await supabase
          .from('services')
          .upsert(service, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
      }

      console.log(`Synced ${transformedServices.length} services`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync services'
      setError(errorMessage)
      console.error('Error syncing services:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    syncServicesWithDatabase,
    loading,
    error
  }
}