'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'


const services = [
  {
    title: 'Ebooks',
    price: 25,
    price_type: 'payment',
    price_code: 'price_1QMc64DCooGuySd3OU23ui05',
    features: [
      'Instant digital access',
      'Comprehensive guides',
      'Lifetime updates',
      'Mobile-friendly format'
    ],
    button_label: 'Coming Soon',
    disabled: true
  },
  {
    title: 'Courses',
    price: 250,
    price_type: 'payment',
    price_code: 'price_1QLRawDCooGuySd3sJ0kn09O',
    features: [
      'In-depth video content',
      'Interactive exercises',
      'Progress tracking',
      'Certificate of completion'
    ],
    button_label: 'Coming Soon',
    disabled: true
  },
  {
    title: 'Website Subscription',
    pricing: {
      monthly: {
        price: 5,
        originalPrice: 25,
        price_code: 'price_1QMc91DCooGuySd3EmmAfZOE',
      },
      yearly: {
        price: 50,
        originalPrice: 250,
        price_code: 'price_1QMc91DCooGuySd3EmmAfZOE_yearly',
        savings: 10
      }
    },
    price_type: 'subscription',
    features: [
      'Exclusive content access',
      'Monthly newsletters',
      'Community features',
      'Priority support'
    ],
    button_label: 'Subscribe',
    betaDiscount: true
  },
  {
    title: 'Performance Therapy',
    price: null,
    features: [
      'Personalized assessment',
      'Custom treatment plans',
      'One-on-one sessions',
      'Progress monitoring'
    ],
    button_label: <a href="/contact">Contact Us</a>
  }
]

export default function ServiceCards() {
  const router = useRouter()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = async (priceType: string, priceCode: string) => {
    router.push(`/sales/checkout?type=${priceType}&code=${priceCode}`);
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
            {service.pricing && (
              <div className="mb-4">
                <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg mb-4 text-sm">
                  <button
                    className={`px-3 py-1 rounded-md dark:text-gray-800 ${
                      billingInterval === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    onClick={() => setBillingInterval('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md dark:text-gray-800 ${
                      billingInterval === 'yearly' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    onClick={() => setBillingInterval('yearly')}
                  >
                    Yearly
                  </button>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">
                      ${service.pricing[billingInterval].originalPrice}
                    </span>
                    <span className="text-2xl font-bold">
                      ${service.pricing[billingInterval].price}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-100">
                      /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {service.betaDiscount && (
                    <p className="text-sm text-green-600 mt-1">Beta Testing Discount</p>
                  )}
                  {billingInterval === 'yearly' && (
                    <p className="text-sm text-blue-600 mt-1">
                      Save ${service.pricing.yearly.savings} with annual billing
                    </p>
                  )}
                </div>
              </div>
            )}
            {!service.pricing && (
              <div className="mb-4">
                {service.price ? (
                  <p className="text-2xl font-bold">${service.price}</p>
                ) : (
                  <p className="text-2xl font-bold">Custom Pricing</p>
                )}
              </div>
            )}
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
              onClick={() => {
                if (service.pricing) {
                  handleCheckout('subscription', service.pricing[billingInterval].price_code);
                } else if (service.price_code && !service.disabled) {
                  handleCheckout(service.price_type, service.price_code);
                }
              }}
              className={`w-full py-2 px-4 rounded ${
                service.disabled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={service.disabled}
            >
              {service.button_label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}