export default function PRItem({ pr }: { pr: any }) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      {/* Top row: Event and Value */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-slate-900 font-semibold">{pr.event}</span>
        <span className="font-medium dark:text-slate-900">{pr.value}</span>
      </div>
      {/* Bottom row: Date and Notes, after border-top */}
      <div className="mt-3 border-t pt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-slate-600">{pr.date}</span>
        {pr.notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium dark:text-slate-900">Notes: </span>
            <span className="dark:text-slate-900">{pr.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}