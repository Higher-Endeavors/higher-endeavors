import Section from './Section';
import Chip from './Chip';

export default function AvailabilityConstraints() {
  return (
    <Section 
      title="Availability & Constraints" 
      subtitle="Recurring windows, blackout dates, equipment"
    >
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Chip label="Mon: 6–8a" />
          <Chip label="Wed: 6–9a" />
          <Chip label="Sun: long" kind="info" />
        </div>
        <div className="flex items-center gap-2">
          <Chip label="Travel: Thu 10/17" kind="warn" />
          <Chip label="No treadmill" />
        </div>
        <div className="text-[11px] text-slate-500">
          Drag chips onto the calendar to set availability; conflicts will show on the right.
        </div>
      </div>
    </Section>
  );
}
