import React from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Instant Delivery',
      description: 'Get your orders processed within minutes of placing them.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'All services are 100% secure and compliant with platform guidelines.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any issues.'
    },
    {
      icon: Users,
      title: 'High Quality',
      description: 'Premium quality services from real and active accounts.'
    }
  ]

  const platforms = [
    { icon: Instagram, name: 'Instagram', services: '150+ Services' },
    { icon: Facebook, name: 'Facebook', services: '100+ Services' },
    { icon: Twitter, name: 'Twitter', services: '80+ Services' },
    { icon: Youtube, name: 'YouTube', services: '120+ Services' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Digital Marketer',
      rating: 5,
      comment: 'Amazing service! My Instagram engagement increased by 300% in just one week.'
    },
    {
      name: 'Mike Chen',
      role: 'Content Creator',
      rating: 5,
      comment: 'Fast delivery and excellent customer support. Highly recommend!'
    },
    {
      name: 'Emma Davis',
      role: 'Business Owner',
      rating: 5,
      comment: 'Professional service that actually works. Great value for money.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Boost Your Social Media
              <span className="text-indigo-600"> Presence</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Professional SMM services to grow your followers, likes, views, and engagement across all major social media platforms.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/services"
                className="text-lg font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
              >
                View Services <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Our Platform?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We provide the most reliable and effective SMM services in the industry.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Supported Platforms
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We support all major social media platforms with hundreds of services.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((platform, index) => {
              const Icon = platform.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.services}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of satisfied customers who trust our services.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Grow Your Social Media?
          </h2>
          <p className="mt-6 text-lg leading-8 text-indigo-100">
            Join thousands of users who are already growing their social media presence with our services.
          </p>
          <div className="mt-10">
            <Link
              to="/register"
              className="rounded-lg bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              Start Growing Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home