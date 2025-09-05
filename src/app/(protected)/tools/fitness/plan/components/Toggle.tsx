interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className={`h-5 w-10 rounded-full transition-colors ${checked ? "bg-sky-500" : "bg-slate-300"} relative`}>
        <span className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-1"}`} />
      </span>
      {label && <span className="text-sm text-slate-700">{label}</span>}
      <input 
        className="hidden" 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
    </label>
  );
}
