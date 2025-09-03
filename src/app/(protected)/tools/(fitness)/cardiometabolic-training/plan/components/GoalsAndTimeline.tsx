import Section from './Section';
import Chip from './Chip';

export default function GoalsAndTimeline() {
  return (
    <Section 
      annotation="B1" 
      title="Goals & Timeline" 
      subtitle="Primary event, A/B/C priorities, finish intent"
    >
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Primary Event</label>
          <input 
            className="w-full border rounded-md px-2 py-1" 
            placeholder="Chicago Marathon — Nov 10, 2025" 
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Start</label>
          <input type="date" className="w-full border rounded-md px-2 py-1" />
        </div>
        <div>
          <label className="text-xs text-slate-600">End</label>
          <input type="date" className="w-full border rounded-md px-2 py-1" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Chip label="A" kind="ok" />
          <Chip label="B" />
          <Chip label="C" />
        </div>
      </div>
    </Section>
  );
}
