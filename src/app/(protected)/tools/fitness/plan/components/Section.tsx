import React from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  annotation?: string;
}

export default function Section({ title, subtitle, children, annotation }: SectionProps) {
  return (
    <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm">
      {annotation && (
        <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shadow">
          {annotation}
        </div>
      )}
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
