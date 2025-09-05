import { useMemo } from 'react';
import Section from './Section';
import WeekBar from './WeekBar';

interface WeeklyVolumeProps {
  deloadEvery: number;
}

export default function WeeklyVolume({ deloadEvery }: WeeklyVolumeProps) {
  const weeks = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    label: `W${i + 1}`,
    minutes: 360 + Math.round(i * 18),
  })), [deloadEvery]);

  const maxMin = Math.max(...weeks.map((w) => w.minutes));

  return (
    <Section 
      annotation="C2" 
      title="Weekly Volume (min)" 
      subtitle="Bars reflect ramp & deload; click a week to focus"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {weeks.slice(0, 8).map((w) => (
            <WeekBar key={w.id} label={w.label} value={w.minutes} max={maxMin} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {weeks.slice(8).map((w) => (
            <WeekBar key={w.id} label={w.label} value={w.minutes} max={maxMin} />
          ))}
        </div>
      </div>
    </Section>
  );
}
