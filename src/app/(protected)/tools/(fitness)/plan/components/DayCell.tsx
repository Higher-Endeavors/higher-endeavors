import Chip from './Chip';

interface DayCellProps {
  day: string;
  items?: string[];
}

export default function DayCell({ day, items = [] }: DayCellProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 min-h-[120px]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-700">{day}</div>
        <Chip label="Avail: 6–8a" kind="info" />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-[11px] text-slate-400">
            Drop a Key Session Placeholder here…
          </div>
        ) : (
          items.map((it, i) => (
            <div key={i} className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
              {it}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
