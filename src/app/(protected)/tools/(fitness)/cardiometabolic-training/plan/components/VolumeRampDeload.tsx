import { useState } from 'react';
import Section from './Section';
import Slider from './Slider';

export default function VolumeRampDeload() {
  const [ramp, setRamp] = useState(8);
  const [deloadEvery, setDeloadEvery] = useState(3);

  return (
    <Section 
      annotation="B3" 
      title="Volume, Ramp & Deload" 
      subtitle="Guardrails for safe progression"
    >
      <div className="flex flex-col gap-3">
        <Slider 
          label="Max Ramp Rate / Week" 
          value={ramp} 
          onChange={setRamp} 
          min={4} 
          max={12} 
          step={1} 
          suffix="%" 
        />
        <Slider 
          label="Deload Cadence" 
          value={deloadEvery} 
          onChange={setDeloadEvery} 
          min={2} 
          max={5} 
          step={1} 
          suffix=" wks" 
        />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-slate-600">Baseline Weekly Volume</label>
            <input 
              className="w-full border rounded-md px-2 py-1" 
              placeholder="360 min" 
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Peak Volume Cap</label>
            <input 
              className="w-full border rounded-md px-2 py-1" 
              placeholder="540 min" 
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
