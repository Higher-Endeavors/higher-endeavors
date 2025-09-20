import Section from '(protected)/tools/fitness/plan/components/Section';
import Chip from '(protected)/tools/fitness/plan/components/Chip';
import DayCell from '(protected)/tools/fitness/plan/components/DayCell';

export default function Calendar() {
  const keySessionsPalette = [
    { label: "Run • Long Z2 120'", kind: "neutral" as const },
    { label: "Run • Z4 6×3' (2')", kind: "neutral" as const },
    { label: "Bike • Tempo 2×20'", kind: "neutral" as const },
    { label: "Row • Aerobic 45'", kind: "neutral" as const },
  ];

  const weekDays = [
    { day: "Mon", items: ["Run Z2 45' (AM)"] },
    { day: "Tue", items: [] },
    { day: "Wed", items: ["Run Z4 6×3' (AM)"] },
    { day: "Thu", items: ["Bike Tempo 2×20' (PM)"] },
    { day: "Fri", items: [] },
    { day: "Sat", items: ["Row Aerobic 45'"] },
    { day: "Sun", items: ["Long Run Z2 120'"] },
  ];

  return (
    <Section 
      title="Calendar — Week View" 
      subtitle="Drop Key Session Placeholders; Program will fulfill details"
    >
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((d, i) => (
          <DayCell key={i} day={d.day} items={d.items} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <span>Legend:</span>
        <Chip label="Key Session" />
        <Chip label="Availability" kind="info" />
        <Chip label="Conflict" kind="warn" />
      </div>
      <div className="mt-4">
        <div className="text-xs text-slate-600 mb-2">Key Session Palette</div>
        <div className="flex flex-wrap gap-2">
          {keySessionsPalette.map((k, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 border text-xs">
              {k.label}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
