'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'

import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import RelatedContent from '../../(components)/RelatedContent'

const questions = [
  'Do you have trouble falling asleep at night?',
  'Do you have difficulty waking up in the morning?',
  'Do you sleep less than 8 hours a night?',
  'Do you wake up once or more in the middle of the night?',
  'Do you sleep in a room with any light or noise in it? (White noise doesn\'t count)',
  'Do you wake up feeling tired?',
  'Do you wake up only with an alarm?',
  'Do you go to bed later than 11 PM?',
  'Do you get up earlier than 6 AM?',
  'Do you use medications (OTC or Rx) to help sleep?',
  'Are there electronic devices within six feet of your bed?'
]

export default function SleepQuiz() {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }))
    setError('')
  }

  const calculateScore = (answers) => {
    return Object.values(answers).reduce((total, answer) => {
      switch (answer) {
        case 'yes': return total + 1
        case 'sometimes': return total + 0.5
        default: return total
      }
    }, 0)
  }

  const calculatePriority = (score) => {
    if (score <= 1) return { level: 'Low', color: 'text-green-600' }
    if (score <= 4) return { level: 'Moderate', color: 'text-yellow-500' }
    return { level: 'High', color: 'text-red-600' }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    // TODO: Save results to user profile when database is ready
    // await saveQuizResults(answers)

    setSubmitted(true)
  }

  const score = calculateScore(answers)
  const priority = calculatePriority(score)

  const relatedArticles = [
    {
      title: "Sleep Overview",
      description: "Learn the fundamentals of sleep",
      href: "/guide/sleep-overview",
      category: "Guide",
      icon: "📖",
    },
  ];

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Sleep Quality Assessment</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="bg-white dark:bg-[#e0e0e0] text-gray-800 p-4 rounded-lg shadow">
            <p className="mb-3">{question}</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="yes"
                  onChange={() => handleChange(index, 'yes')}
                  checked={answers[index] === 'yes'}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="no"
                  onChange={() => handleChange(index, 'no')}
                  checked={answers[index] === 'no'}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="sometimes"
                  onChange={() => handleChange(index, 'sometimes')}
                  checked={answers[index] === 'sometimes'}
                  className="mr-2"
                />
                Sometimes
              </label>
            </div>
          </div>
        ))}

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      </form>

      {submitted && (
        <div className="mt-8 p-6 rounded-lg shadow">
          <div className={`p-6 rounded-lg ${
            priority.level === 'Low' ? 'bg-green-500' : 
            priority.level === 'Moderate' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Your Results</h2>
            <p className="mb-2">Score: {score.toFixed(1)} points</p>
            <p className="mb-4">
              Priority Level: <span className="font-semibold">{priority.level}</span>
            </p>
            <div className={`${
              priority.level === 'Low' ? 'text-green-800' : 
              priority.level === 'Moderate' ? 'text-yellow-800' : 
              'text-red-800'
            }`}>
              <p className="mb-2">What this means:</p>
              {priority.level === 'Low' && (
                <p>Your sleep habits appear to be generally healthy. Continue maintaining these good practices!</p>
              )}
              {priority.level === 'Moderate' && (
                <p>There are some areas where your sleep quality could be improved. Consider addressing these factors to enhance your sleep.</p>
              )}
              {priority.level === 'High' && (
                <p>Several factors are potentially affecting your sleep quality. You should prioritize addressing these issues and improving your sleep.</p>
              )}
            </div>
            <div className="mt-4">
              <p>Explanation of Scoring:</p>
              <p>Yes: 1 point / Sometimes: 0.5 points / No: 0 points</p>
              <p className="mt-2">High Priority: 4-5 points / Moderate Priority: 2-3 points / Low Priority: 0-1 point</p>
              <p className="mt-2">The score is a simple way to understand your sleep quality based on your answers. A higher score indicates a greater need for attention to your sleep habits.</p>
            </div>
          </div>
        </div>
      )}
          </div>
          
          <aside className="w-full md:w-[600px] lg:w-[500px] mx-auto lg:mx-0 flex-shrink-0 lg:pr-24">
            <div className="p-6 lg:sticky lg:top-6">
              <RelatedContent articles={relatedArticles} />
            </div>
          </aside>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  )
} 