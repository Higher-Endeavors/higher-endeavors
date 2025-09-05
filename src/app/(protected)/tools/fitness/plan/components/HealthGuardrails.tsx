import Section from './Section';

export default function HealthGuardrails() {
  return (
    <Section 
      title="Health Guardrails" 
      subtitle="Optional risk controls"
    >
      <div className="flex flex-col gap-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          Min 1 rest day/week
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          Max 2 HI days/week
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" />
          Avoid HI after short sleep
        </label>
      </div>
    </Section>
  );
}
