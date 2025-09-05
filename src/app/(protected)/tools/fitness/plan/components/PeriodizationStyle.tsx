import { useState } from 'react';
import Section from './Section';

export default function PeriodizationStyle() {
  const [periodizationModel, setPeriodizationModel] = useState('Block');

  return (
    <Section 
      title="Periodization Style" 
      subtitle="Structural model for training sequencing"
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Periodization Model</label>
          <select 
            className="w-full border rounded-md px-2 py-1 text-sm"
            value={periodizationModel}
            onChange={(e) => setPeriodizationModel(e.target.value)}
          >
            <option value="Block">Block</option>
            <option value="Reverse">Reverse</option>
            <option value="Undulating">Undulating</option>
            <option value="Linear">Linear</option>
          </select>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
          <strong>{periodizationModel} Periodization:</strong> {
            periodizationModel === 'Block' ? 'Focused blocks on one adaptation in sequence' :
            periodizationModel === 'Reverse' ? 'Early intensity, later volume progression' :
            periodizationModel === 'Undulating' ? 'Varies load/intensity frequently' :
            'Gradual linear progression over time'
          }
        </div>
      </div>
    </Section>
  );
}
