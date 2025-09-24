interface ChipProps {
  label: string;
  kind?: "neutral" | "warn" | "ok" | "info";
}

export default function Chip({ label, kind = "neutral" }: ChipProps) {
  const styles: Record<string, string> = {
    neutral: "bg-slate-100 border-slate-300 text-slate-700",
    warn: "bg-amber-100 border-amber-300 text-amber-800",
    ok: "bg-emerald-100 border-emerald-300 text-emerald-800",
    info: "bg-sky-100 border-sky-300 text-sky-800",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${styles[kind]}`}>
      {label}
    </span>
  );
}
