interface SMMProvider {
  name: string
  apiUrl: string
  apiKey: string
  isActive: boolean
}

interface SMMService {
  service: string
  name: string
  type: string
  rate: string
  min: string
  max: string
  category: string
}

interface SMMOrder {
  order: string
  charge: string
  start_count: string
  status: string
  remains: string
}

interface SMMOrderRequest {
  service: string
  link: string
  quantity: number
}

class SMMProvidersClient {
  private providers: SMMProvider[] = [
    {
      name: 'JustAnotherPanel',
      apiUrl: 'https://justanotherpanel.com/api/v2',
      apiKey: import.meta.env.VITE_SMM_PROVIDER1_API_KEY || '',
      isActive: true
    },
    {
      name: 'Peakerr',
      apiUrl: 'https://peakerr.com/api/v2',
      apiKey: import.meta.env.VITE_SMM_PROVIDER2_API_KEY || '',
      isActive: true
    },
    {
      name: 'SMM Heaven',
      apiUrl: 'https://smmheaven.com/api/v2',
      apiKey: import.meta.env.VITE_SMM_PROVIDER3_API_KEY || '',
      isActive: true
    }
  ]

  private async makeRequest(provider: SMMProvider, action: string, params: Record<string, any> = {}) {
    const formData = new FormData()
    formData.append('key', provider.apiKey)
    formData.append('action', action)
    
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    try {
      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle API error responses
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data
    } catch (error) {
      console.error(`Error with ${provider.name}:`, error)
      throw error
    }
  }

  async getServices(): Promise<SMMService[]> {
    const allServices: SMMService[] = []

    for (const provider of this.providers) {
      if (!provider.isActive || !provider.apiKey) continue

      try {
        const services = await this.makeRequest(provider, 'services')
        if (Array.isArray(services)) {
          // Add provider info to services
          const servicesWithProvider = services.map(service => ({
            ...service,
            provider: provider.name
          }))
          allServices.push(...servicesWithProvider)
        }
      } catch (error) {
        console.error(`Failed to fetch services from ${provider.name}:`, error)
      }
    }

    return allServices
  }

  async createOrder(orderData: SMMOrderRequest): Promise<SMMOrder | null> {
    for (const provider of this.providers) {
      if (!provider.isActive || !provider.apiKey) continue

      try {
        const result = await this.makeRequest(provider, 'add', {
          service: orderData.service,
          link: orderData.link,
          quantity: orderData.quantity
        })

        if (result && result.order) {
          return {
            ...result,
            provider: provider.name
          }
        }
      } catch (error) {
        console.error(`Failed to create order with ${provider.name}:`, error)
        continue
      }
    }

    throw new Error('Failed to create order with any provider')
  }

  async getOrderStatus(orderId: string): Promise<SMMOrder | null> {
    for (const provider of this.providers) {
      if (!provider.isActive || !provider.apiKey) continue

      try {
        const result = await this.makeRequest(provider, 'status', {
          order: orderId
        })

        if (result && result.status) {
          return result
        }
      } catch (error) {
        console.error(`Failed to get order status from ${provider.name}:`, error)
        continue
      }
    }

    return null
  }

  async getBalance(providerName?: string): Promise<{ provider: string; balance: number }[]> {
    const balances: { provider: string; balance: number }[] = []

    const providersToCheck = providerName 
      ? this.providers.filter(p => p.name === providerName)
      : this.providers

    for (const provider of providersToCheck) {
      if (!provider.isActive || !provider.apiKey) continue

      try {
        const result = await this.makeRequest(provider, 'balance')
        if (result && result.balance) {
          balances.push({
            provider: provider.name,
            balance: parseFloat(result.balance)
          })
        }
      } catch (error) {
        console.error(`Failed to get balance from ${provider.name}:`, error)
      }
    }

    return balances
  }

  // Get provider status
  getProviderStatus() {
    return this.providers.map(provider => ({
      name: provider.name,
      isActive: provider.isActive,
      hasApiKey: !!provider.apiKey
    }))
  }
}

export const smmProviders = new SMMProvidersClient()
export type { SMMService, SMMOrder, SMMOrderRequest }