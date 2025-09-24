interface LegendItemProps {
  code: string;
  text: string;
}

export default function LegendItem({ code, text }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
        {code}
      </span>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}
