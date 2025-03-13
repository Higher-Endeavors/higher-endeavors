'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'How do I access the ebooks after purchase?',
    answer: 'After purchase, you\'ll receive an email with download instructions and a secure link to access your ebook.'
  },
  {
    question: 'What\'s included in the website subscription?',
    answer: 'The website subscription includes access to the content within "A Guide to Your Ideal Self" along with all of the Tools we have created to help you implement those concepts and achieve your ideal self.'
  },
  {
    question: 'How long do I have access to the courses?',
    answer: 'Once purchased, you have lifetime access to the course content, including any future updates.'
  },
  {
    question: 'How do I schedule a Performance Therapy session?',
    answer: 'After contacting us, we\'ll schedule a consultation to discuss your goals and create a customized plan that meets your needs.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg">
            <button
              className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium">{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-transparent dark:border-t dark:border-gray-500">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 