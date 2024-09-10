"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import ListRefLifts from './components/ListRefLifts';
import MasterLift from './components/MasterLift';
import ListBalLifts from './components/ListBalLifts';

type StructuralBalanceProps = {
  // Add any props here if needed
};

const StructuralBalance = (props: StructuralBalanceProps): JSX.Element => {
  const { user } = useUser();
  const [masterLift, setMasterLift] = useState<string>('');
  const [masterWeight, setMasterWeight] = useState<number>(0);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [reps, setReps] = useState<number>(1);
  const [showBalancedLifts, setShowBalancedLifts] = useState(false);

  useEffect(() => {
    // Load user preferences here (masterLift, unit, reps)
    // This is a placeholder for future implementation
  }, [user]);

  const handleCalculate = () => {
    // Calculation logic here
    setShowBalancedLifts(true);
  };

  const handleSave = () => {
    // Saving results logic here
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Structural Balance Calculator</h2>
      <MasterLift
        masterLift={masterLift}
        setMasterLift={setMasterLift}
        masterWeight={masterWeight}
        setMasterWeight={setMasterWeight}
        unit={unit}
        setUnit={setUnit}
        reps={reps}
        setReps={setReps}
        onCalculate={handleCalculate}
        onSave={handleSave}
      />
      {showBalancedLifts && (
        <ListBalLifts
          masterLift={masterLift}
          masterWeight={masterWeight}
          unit={unit}
          reps={reps}
        />
      )}
      <ListRefLifts />
    </div>
  );
};

export default StructuralBalance;