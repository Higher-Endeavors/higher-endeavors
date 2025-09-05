import Section from './Section';
import ProgressRing from './ProgressRing';

export default function PlanHealth() {
  return (
    <Section 
      title="Plan Health" 
      subtitle="Composite score across guardrails"
    >
      <div className="flex items-center gap-4">
        <ProgressRing value={82} />
        <div className="text-sm text-slate-700">
          <div>Ramp adherence: <b>Good</b></div>
          <div>HI spacing: <b>Fair</b></div>
          <div>Deload timing: <b>Good</b></div>
          <div>Zone balance: <b>Needs review</b></div>
        </div>
      </div>
    </Section>
  );
}
