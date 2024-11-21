interface GoalDisplayProps {
  goalAmount: number
  actualAmount: number
  unit: string
}

export default function GoalDisplay({ goalAmount, actualAmount, unit }: GoalDisplayProps) {
  const percentage = Math.round((actualAmount / goalAmount) * 100)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Daily Progress</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">
            Goal: <span className="text-primary-600">{goalAmount} {unit}</span>
          </p>
          <p className="text-gray-700 font-medium">
            Actual: <span className="text-primary-600">{actualAmount} {unit}</span>
          </p>
        </div>
        <div className="text-3xl font-bold text-primary-600">
          {percentage}%
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
} 