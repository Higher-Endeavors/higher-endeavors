import Section from './Section';

export default function TIZTargets() {
  return (
    <Section 
      annotation="E2" 
      title="TIZ Targets — This Week" 
      subtitle="Hit/miss vs Plan"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 rounded-full border-8 border-slate-200 grid place-items-center">
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">82%</div>
              <div className="text-[11px] text-slate-500">Target Hit</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs">
              <span>Z1</span>
              <span>36 / 40m</span>
            </div>
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-2 bg-slate-700 rounded" style={{ width: "90%" }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Z2</span>
              <span>310 / 340m</span>
            </div>
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-2 bg-slate-700 rounded" style={{ width: "91%" }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Z3</span>
              <span>64 / 70m</span>
            </div>
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-2 bg-slate-700 rounded" style={{ width: "91%" }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Z4–5</span>
              <span>42 / 50m</span>
            </div>
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-2 bg-slate-700 rounded" style={{ width: "84%" }} />
            </div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Tip: as you drag key sessions on the calendar, these bars update live.
        </div>
      </div>
    </Section>
  );
}
