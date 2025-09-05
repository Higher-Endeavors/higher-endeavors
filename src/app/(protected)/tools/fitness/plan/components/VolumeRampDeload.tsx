import { useState } from 'react';
import Section from './Section';

export default function VolumeRampDeload() {
  const [rampRate, setRampRate] = useState(8);
  const [deloadEvery, setDeloadEvery] = useState(3);
  const [baselineVolume, setBaselineVolume] = useState(360);
  const [peakVolume, setPeakVolume] = useState(540);

  return (
    <Section 
      title="Volume, Ramp & Deload" 
      subtitle="Guardrails for safe progression"
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Max Ramp Rate</label>
            <div className="flex">
              <input 
                type="number"
                className="w-full border rounded-l-md px-2 py-1 text-sm" 
                value={rampRate}
                onChange={(e) => setRampRate(Number(e.target.value))}
                min={4}
                max={12}
              />
              <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Deload Cadence</label>
            <div className="flex">
              <input 
                type="number"
                className="w-full border rounded-l-md px-2 py-1 text-sm" 
                value={deloadEvery}
                onChange={(e) => setDeloadEvery(Number(e.target.value))}
                min={2}
                max={5}
              />
              <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">wks</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Baseline Weekly Volume</label>
            <div className="flex">
              <input 
                type="number"
                className="w-full border rounded-l-md px-2 py-1 text-sm" 
                value={baselineVolume}
                onChange={(e) => setBaselineVolume(Number(e.target.value))}
                min={0}
              />
              <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">min</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Peak Volume Cap</label>
            <div className="flex">
              <input 
                type="number"
                className="w-full border rounded-l-md px-2 py-1 text-sm" 
                value={peakVolume}
                onChange={(e) => setPeakVolume(Number(e.target.value))}
                min={0}
              />
              <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">min</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
