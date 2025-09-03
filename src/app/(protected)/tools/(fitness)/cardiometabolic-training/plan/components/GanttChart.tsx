import { useMemo } from 'react';
import Section from './Section';
import Chip from './Chip';

interface GanttChartProps {
  deloadEvery: number;
  z2share: number;
}

export default function GanttChart({ deloadEvery, z2share }: GanttChartProps) {
  const weeks = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    label: `W${i + 1}`,
    minutes: 360 + Math.round(i * 18),
    phase: i < 6 ? "Base" : i < 12 ? "Build" : i < 15 ? "Peak" : "Taper",
    deload: (i + 1) % (deloadEvery + 1) === 0,
  })), [deloadEvery]);

  const maxMin = Math.max(...weeks.map((w) => w.minutes));

  return (
    <Section 
      annotation="C1" 
      title="Gantt — Macro → Meso → Micro" 
      subtitle="Drag phase edges; weeks auto-rescale within guardrails"
    >
      <div className="flex flex-col gap-4">
        {/* Macrocycle Band */}
        <div>
          <div className="flex items-center justify-between mb-2 text-xs text-slate-600">
            <span>Macrocycle</span>
            <div className="flex items-center gap-2">
              <Chip label="Lock" />
              <Chip label="Scenario: Polarized" kind="info" />
            </div>
          </div>
          <div className="grid grid-cols-16 gap-1">
            {weeks.map((w) => (
              <div 
                key={w.id} 
                className={`h-4 rounded ${
                  w.phase === "Base" ? "bg-emerald-300" : 
                  w.phase === "Build" ? "bg-indigo-300" : 
                  w.phase === "Peak" ? "bg-fuchsia-300" : "bg-amber-300"
                }`} 
                title={`${w.label} — ${w.phase}`} 
              />
            ))}
          </div>
        </div>

        {/* Mesocycle Band (labels) */}
        <div className="grid grid-cols-16 gap-1 text-[11px] text-slate-700">
          {weeks.map((w) => (
            <div key={w.id} className="text-center">
              {w.deload ? (
                <span className="px-1 rounded bg-amber-100 border border-amber-300">DELOAD</span>
              ) : (
                <span className="opacity-60">&nbsp;</span>
              )}
            </div>
          ))}
        </div>

        {/* Micro: week hover details */}
        <div className="grid grid-cols-16 gap-1">
          {weeks.map((w) => (
            <div key={w.id} className="rounded-lg border border-slate-200 bg-white p-2 group">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>{w.label}</span>
                <span>{w.minutes}m</span>
              </div>
              <div className="mt-2 h-2 rounded bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: `${(w.minutes / maxMin) * 100}%` }} />
              </div>
              <div className="mt-2 hidden group-hover:block">
                <div className="text-[11px] text-slate-500">
                  TIZ target: Z1–2 {z2share}%, Z3 15%, Z4–5 10%
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  <Chip label="Key: Long Run 120'" />
                  <Chip label="Key: Z4 6×3'" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
