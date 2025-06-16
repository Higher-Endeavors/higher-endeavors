import PRItem from "./PRItem";

export default function PRList({ prs }: { prs: any[] }) {
  // Group by modality
  const grouped = prs.reduce((acc: Record<string, any[]>, pr) => {
    acc[pr.modality] = acc[pr.modality] || [];
    acc[pr.modality].push(pr);
    return acc;
  }, {});

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      {Object.entries(grouped).map(([modality, items]) => (
        <section key={modality} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">{modality}</h2>
          <div className="space-y-4">
            {items.map((pr) => (
              <PRItem key={pr.id} pr={pr} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}