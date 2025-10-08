'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip);

type FamilySeries = { label: string; values: number[] };

export default function CMETrendWeeklyVolume({ labels, values, familySeries = [], yLabel = 'Minutes', unitSuffix = 'min' }: { labels: string[]; values: number[]; familySeries?: FamilySeries[]; yLabel?: string; unitSuffix?: string }) {
  const palette: Record<string, string> = {
    Total: '#111827',
    Running: '#2563eb',
    Cycling: '#16a34a',
    Swimming: '#0891b2',
    Rowing: '#f97316',
    Walking: '#6b7280',
    'Nordic & Snow': '#7c3aed',
    Watersport: '#06b6d4',
  };

  const datasets: any[] = [];
  // Total line (thicker)
  datasets.push({
    label: `Total (${unitSuffix})`,
    data: values,
    borderColor: palette.Total,
    backgroundColor: palette.Total,
    pointRadius: 2,
    tension: 0.2,
    borderWidth: 2,
  });
  // Add each family if it has any data
  for (const fs of familySeries) {
    if (fs.values.some((v) => v > 0)) {
      const color = palette[fs.label] || '#9ca3af';
      datasets.push({
        label: `${fs.label} (${unitSuffix})`,
        data: fs.values,
        borderColor: color,
        backgroundColor: color,
        pointRadius: 1.5,
        tension: 0.2,
        borderWidth: 1.5,
      });
    }
  }

  const data = { labels, datasets } as any;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { title: { display: true, text: 'Week' }, grid: { color: 'rgba(107,114,128,0.22)' } },
      y: { title: { display: true, text: yLabel }, beginAtZero: true, grid: { color: 'rgba(107,114,128,0.22)' } },
    },
  };

  return (
    <div className="h-[420px]">
      <Line data={data} options={options} />
    </div>
  );
}


