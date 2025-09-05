interface PhasePillProps {
  label: string;
  color?: string;
  hint?: string;
  isClickable?: boolean;
}

export default function PhasePill({ label, color = "bg-indigo-200", hint, isClickable = false }: PhasePillProps) {
  return (
    <div 
      className={`px-3 py-1 rounded-full text-xs font-medium ${color} text-slate-800 border border-slate-300 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200' : ''
      }`} 
      title={hint}
    >
      {label}
    </div>
  );
}
