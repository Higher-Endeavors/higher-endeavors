'use client';

type BalLift = {
    id: number
    exercise_name: string
    bal_lift_load: number
  };
  type BalLifts = BalLift[];
  

export default function BalancedLiftsList({ balLifts }: { balLifts: BalLifts }) {
  return (
    <div>
      {balLifts.map((lift) => (
        <div key={lift.id}>
          {lift.exercise_name}: {lift.bal_lift_load}
        </div>
      ))}
    </div>
  );
}
