import Section from './Section';

export default function ZoneModel() {
  return (
    <Section 
      annotation="B5" 
      title="Zone Model" 
      subtitle="Per sport if needed"
    >
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="text-xs text-slate-600">Model</label>
          <select className="w-full border rounded-md px-2 py-1 text-sm">
            <option>5-Zone (HRmax%)</option>
            <option>7-Zone (Threshold)</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Anchor</label>
          <select className="w-full border rounded-md px-2 py-1 text-sm">
            <option>%HRmax</option>
            <option>%HRR (Karvonen)</option>
            <option>%FTP / Threshold</option>
          </select>
        </div>
      </div>
    </Section>
  );
}
