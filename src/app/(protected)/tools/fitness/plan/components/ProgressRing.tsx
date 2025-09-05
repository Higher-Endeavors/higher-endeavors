interface ProgressRingProps {
  value: number;
}

export default function ProgressRing({ value }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28">
      <circle 
        cx="50" 
        cy="50" 
        r={radius} 
        stroke="#e2e8f0" 
        strokeWidth="10" 
        fill="transparent" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r={radius} 
        stroke="#0ea5e9" 
        strokeWidth="10" 
        fill="transparent" 
        strokeDasharray={`${circumference} ${circumference}`} 
        strokeDashoffset={offset} 
        strokeLinecap="round" 
      />
      <text 
        x="50" 
        y="50" 
        textAnchor="middle" 
        dominantBaseline="central" 
        className="fill-slate-800 text-lg font-semibold"
      >
        {clamped}%
      </text>
    </svg>
  );
}
