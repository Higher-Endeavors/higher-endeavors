import { useState } from 'react';
import Section from './Section';
import Slider from './Slider';

export default function PeriodizationStyle() {
  const [polarized, setPolarized] = useState(80);
  const [z2share, setZ2share] = useState(70);

  return (
    <Section 
      annotation="B2" 
      title="Periodization Style" 
      subtitle="Archetype + phase-specific sliders"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span>Archetype</span>
          <select className="border rounded-md px-2 py-1 text-sm">
            <option>Polarized</option>
            <option>Pyramidal</option>
            <option>Threshold-centric</option>
          </select>
        </div>
        <Slider 
          label="Polarized Balance (Z1–2 share)" 
          value={polarized} 
          onChange={setPolarized} 
          min={60} 
          max={90} 
          step={1} 
          suffix="%" 
        />
        <Slider 
          label="Z2 Emphasis" 
          value={z2share} 
          onChange={setZ2share} 
          min={50} 
          max={85} 
          step={1} 
          suffix="%" 
        />
      </div>
    </Section>
  );
}
