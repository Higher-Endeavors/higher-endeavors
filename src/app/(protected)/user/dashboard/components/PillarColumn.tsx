interface PillarColumnProps {
  title: 'Lifestyle' | 'Health' | 'Nutrition' | 'Fitness';
  children: React.ReactNode;
}

export default function PillarColumn({ title, children }: PillarColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
} 