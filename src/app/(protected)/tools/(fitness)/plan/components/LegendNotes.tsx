import Section from './Section';
import LegendItem from './LegendItem';

export default function LegendNotes() {
  return (
    <Section 
      annotation="F" 
      title="Legend & Notes" 
      subtitle="Reference for the annotations on this wireframe"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LegendItem code="A" text="Top Bar: phase pills, Plan Profile, Scenario Compare, Recalculate, Export" />
          <LegendItem code="B1" text="Goals & Timeline: event info, dates, A/B/C priority chips" />
          <LegendItem code="B2" text="Periodization Style: archetype and intensity distribution sliders" />
          <LegendItem code="B3" text="Volume, Ramp & Deload: baseline, caps, ramp %, deload cadence" />
          <LegendItem code="B4" text="Modality Mix: per-sport shares (run/bike/row)" />
          <LegendItem code="B5" text="Zone Model: model + anchor selection" />
          <LegendItem code="B6" text="Availability & Constraints: recurring windows, blackout dates, equipment" />
          <LegendItem code="B7" text="Health Guardrails: rest day, HI spacing, sleep-aware option" />
        </div>
        <div className="space-y-2">
          <LegendItem code="C1" text="Gantt: Macro/Meso/Micro with phase colors and deload labels; hover reveals week details" />
          <LegendItem code="C2" text="Weekly Volume Bars: ramp & deload visualization" />
          <LegendItem code="D1" text="Plan Health: composite score ring + subscores" />
          <LegendItem code="D2" text="Conflicts & Warnings: clickable items highlight problematic weeks" />
          <LegendItem code="D3" text="Quick Fixes: one‑click safe adjustments" />
          <LegendItem code="D4" text="Audit Trail: transparent auto-edits and reasons" />
          <LegendItem code="E1" text="Calendar: drop Key Session Placeholders; availability chips in headers" />
          <LegendItem code="E2" text="TIZ Targets: hit/miss vs planned per zone; weekly target ring" />
        </div>
      </div>
    </Section>
  );
}
