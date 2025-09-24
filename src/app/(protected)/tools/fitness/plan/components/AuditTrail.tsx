import Section from '(protected)/tools/fitness/plan/components/Section';

export default function AuditTrail() {
  return (
    <Section 
      annotation="D4" 
      title="Audit Trail" 
      subtitle="What the engine changed & why"
    >
      <div className="text-xs text-slate-700 space-y-1">
        <div>• Moved Z4 run Wed→Thu (availability)</div>
        <div>• Reduced W7 8% (ramp guardrail)</div>
        <div>• Marked W12 as deload (cadence)</div>
      </div>
    </Section>
  );
}
