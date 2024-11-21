'use client'

import { useState } from 'react'

export default function WeightManagement() {
  const [weight, setWeight] = useState<number | ''>('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement weight update logic
    console.log('Weight updated:', weight)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Update Body Weight</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (lbs)
          </label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter weight in pounds"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Weight
        </button>
      </form>
    </div>
  )
} 