'use client'

import { useState } from 'react'
import HydrationForm from './components/HydrationForm'
import DailyList from './components/DailyList'
import GoalDisplay from './components/GoalDisplay'

export default function HydrationTracker() {
  // Placeholder for user weight and preferred unit
  const userWeight = 150 // This will come from user settings
  const preferredUnit = 'ounces'
  
  // Calculate goal (1 oz per 0.5 lbs of body weight)
  const dailyGoal = userWeight * 2

  const [entries, setEntries] = useState<Array<{
    id: string
    amount: number
    unit: string
    timestamp: string
  }>>([])

  const handleSubmit = (amount: number, unit: string) => {
    const newEntry = {
      id: Date.now().toString(),
      amount,
      unit,
      timestamp: new Date().toISOString(),
    }
    setEntries([...entries, newEntry])
  }

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="container mx-auto px-12 py-8 lg:px-36 xl:px-72">
      <h1 className="text-3xl font-bold mb-6 pb-4">
        Hydration Tracker
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <GoalDisplay
          goalAmount={dailyGoal}
          actualAmount={totalAmount}
          unit={preferredUnit}
        />
        
        <HydrationForm onSubmit={handleSubmit} />
        
        <DailyList entries={entries} />
      </div>
    </div>
  )
} 