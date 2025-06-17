import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Filter, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  category: string
  platform: string
  price_per_1000: number
  min_quantity: number
  max_quantity: number
  is_active: boolean
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const platforms = [
    { value: 'all', label: 'All Platforms', icon: null },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'youtube', label: 'YouTube', icon: Youtube },
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'followers', label: 'Followers' },
    { value: 'likes', label: 'Likes' },
    { value: 'views', label: 'Views' },
    { value: 'comments', label: 'Comments' },
    { value: 'shares', label: 'Shares' },
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, selectedPlatform, selectedCategory])

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

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(service => service.platform === selectedPlatform)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    setFilteredServices(filtered)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />
      default:
        return null
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
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Browse our extensive catalog of social media marketing services</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(service.platform)}
                <span className="text-sm font-medium text-gray-600 capitalize">{service.platform}</span>
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full capitalize">
                {service.category}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per 1000:</span>
                <span className="font-medium text-gray-900">${service.price_per_1000}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min quantity:</span>
                <span className="font-medium text-gray-900">{service.min_quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max quantity:</span>
                <span className="font-medium text-gray-900">{service.max_quantity.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Order Now
            </button>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Services