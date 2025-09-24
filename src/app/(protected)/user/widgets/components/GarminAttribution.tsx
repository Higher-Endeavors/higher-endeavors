interface GarminAttributionProps {
  attribution?: string;
  className?: string;
}

export default function GarminAttribution({ 
  attribution, 
  className = '' 
}: GarminAttributionProps) {
  if (!attribution) {
    return null;
  }

  return (
    <div className={`text-xs text-slate-500 ${className}`}>
      {attribution}
    </div>
  );
}
