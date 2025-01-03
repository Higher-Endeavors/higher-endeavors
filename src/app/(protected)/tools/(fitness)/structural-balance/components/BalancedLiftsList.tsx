'use client';

type BalLift = {
    id: number
    exercise_name: string
    bal_lift_load: number
    bal_lift_note: string
  };
  type BalLifts = BalLift[];
  

export default function BalancedLiftsList({ balLifts }: { balLifts: BalLifts }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4 p-4">
        {balLifts.map((lift) => (
          <div key={lift.id} className="flex flex-col p-3 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{lift.exercise_name}</span>
              <span className="text-gray-600">{lift.bal_lift_load} lbs</span>
            </div>
            {lift.bal_lift_note && (
              <span className="text-blue-500 text-sm mt-2">{lift.bal_lift_note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
