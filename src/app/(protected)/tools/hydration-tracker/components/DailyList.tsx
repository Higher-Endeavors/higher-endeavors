interface Entry {
  id: string
  amount: number
  unit: string
  timestamp: string
}

export default function DailyList({ entries }: { entries: Entry[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">
        Today's Entries
      </h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span className="font-medium text-gray-900">
              {entry.amount} {entry.unit}
            </span>
            <span className="text-gray-500">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 