'use client'

import { useState } from 'react'

const UNITS = ['ounces', 'grams', 'milliliters'] as const
type Unit = typeof UNITS[number]

export default function HydrationForm({ onSubmit }: { onSubmit: (amount: number, unit: Unit) => void }) {
  const [amount, setAmount] = useState<number | ''>('')
  const [unit, setUnit] = useState<Unit>('ounces')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount !== '') {
      onSubmit(amount, unit)
      setAmount('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter amount"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="unit" className="block text-sm font-medium text-gray-900 mb-2">
            Unit
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="w-full px-4 py-2 border border-gray-300 bg-slate-400 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 w-full bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-[#9400D3] transition-colors duration-200"
      >
        Add Entry
      </button>
    </form>
  )
} 