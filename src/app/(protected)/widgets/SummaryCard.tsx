interface SummaryCardProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SummaryCard({ 
  title = "Today's Summary", 
  className = '',
  children 
}: SummaryCardProps) {
  return (
    <div className={`mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      {children || (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Activity Score:</span>
            <span className="ml-2 font-semibold text-slate-800">8.2/10</span>
          </div>
          <div>
            <span className="text-slate-600">Recovery Score:</span>
            <span className="ml-2 font-semibold text-slate-800">7.5/10</span>
          </div>
          <div>
            <span className="text-slate-600">Sleep Quality:</span>
            <span className="ml-2 font-semibold text-slate-800">Good</span>
          </div>
          <div>
            <span className="text-slate-600">Last Sync:</span>
            <span className="ml-2 font-semibold text-slate-800">2 min ago</span>
          </div>
        </div>
      )}
    </div>
  );
}
