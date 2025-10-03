import { useState } from 'react';
import Section from '(protected)/tools/fitness/plan/components/Section';
import Slider from '(protected)/tools/fitness/plan/components/Slider';

export default function ModalityMix() {
  const [runShare, setRunShare] = useState(55);
  const [bikeShare, setBikeShare] = useState(35);
  const [rowShare, setRowShare] = useState(10);

  return (
    <Section 
      annotation="B4" 
      title="Modality Mix" 
      subtitle="Distribute volume by sport"
    >
      <div className="flex flex-col gap-3">
        <Slider 
          label="Run" 
          value={runShare} 
          onChange={setRunShare} 
          min={0} 
          max={100} 
          step={1} 
          suffix="%" 
        />
        <Slider 
          label="Bike" 
          value={bikeShare} 
          onChange={setBikeShare} 
          min={0} 
          max={100} 
          step={1} 
          suffix="%" 
        />
        <Slider 
          label="Row" 
          value={rowShare} 
          onChange={setRowShare} 
          min={0} 
          max={100} 
          step={1} 
          suffix="%" 
        />
        <div className="text-[11px] text-slate-500">
          (Auto-normalized later to 100%)
        </div>
      </div>
    </Section>
  );
}
