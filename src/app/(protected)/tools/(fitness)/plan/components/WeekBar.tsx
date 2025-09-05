interface WeekBarProps {
  label: string;
  value: number;
  max: number;
}

export default function WeekBar({ label, value, max }: WeekBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-16 text-right text-slate-500">{label}</div>
      <div className="flex-1 h-3 rounded-md bg-slate-200 overflow-hidden">
        <div className="h-full bg-sky-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-14 text-slate-700 text-right">{value}m</div>
    </div>
  );
}
