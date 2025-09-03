import Section from './Section';
import Chip from './Chip';

export default function ConflictsWarnings() {
  const warnings = [
    "Ramp >10% in W7 vs W6",
    "Two HI days back-to-back (Tue/Wed)",
    "Travel Thu overlaps planned tempo — suggest swap",
  ];

  return (
    <Section 
      annotation="D2" 
      title="Conflicts & Warnings" 
      subtitle="Click a warning to jump to the week"
    >
      <ul className="list-disc ml-5 text-sm text-slate-700">
        {warnings.map((w, i) => (
          <li key={i} className="mb-1">{w}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip label="Conflict: Availability (Wed AM)" kind="warn" />
        <Chip label="Back-to-back hard days" kind="warn" />
      </div>
    </Section>
  );
}
