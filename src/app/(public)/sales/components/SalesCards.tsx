'use client'

import { useRouter } from 'next/navigation'

const services = [
  {
    title: 'Ebooks',
    price: 25,
    features: [
      'Instant digital access',
      'Comprehensive guides',
      'Lifetime updates',
      'Mobile-friendly format'
    ]
  },
  {
    title: 'Courses',
    price: 250,
    features: [
      'In-depth video content',
      'Interactive exercises',
      'Progress tracking',
      'Certificate of completion'
    ]
  },
  {
    title: 'Website Subscription',
    price: 5,
    features: [
      'Exclusive content access',
      'Monthly newsletters',
      'Community features',
      'Priority support'
    ]
  },
  {
    title: 'Performance Therapy',
    price: null,
    features: [
      'Personalized assessment',
      'Custom treatment plans',
      'One-on-one sessions',
      'Progress monitoring'
    ]
  }
]

export default function ServiceCards() {
  const router = useRouter()

  const handleCheckout = async (serviceTitle: string, price: number | null) => {
    // Placeholder for Stripe checkout integration
    console.log(`Initiating checkout for ${serviceTitle}`)
    // Will implement Stripe redirect here
  }

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.title}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
            <p className="text-2xl font-bold mb-4">
              {service.price ? `$${service.price}` : 'Custom Pricing'}
            </p>
            <ul className="mb-6 space-y-2">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(service.title, service.price)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {service.price ? 'Buy Now' : 'Contact Us'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 