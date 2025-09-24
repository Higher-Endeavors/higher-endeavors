import Section from '(protected)/tools/fitness/plan/components/Section';

export default function QuickFixes() {
  const quickFixes = [
    "Shift Z4 run from Wed→Thu",
    "Convert Thu bike tempo to Z3",
    "Reduce W7 volume by 8%",
  ];

  return (
    <Section 
      annotation="D3" 
      title="One‑click Quick Fixes" 
      subtitle="Automated safe edits"
    >
      <div className="flex flex-col gap-2">
        {quickFixes.map((q, i) => (
          <button 
            key={i} 
            className="text-left px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </Section>
  );
}
