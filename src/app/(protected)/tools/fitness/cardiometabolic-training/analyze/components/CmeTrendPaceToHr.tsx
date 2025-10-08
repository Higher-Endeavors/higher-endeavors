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

export default function CMETrendPaceToHr({ labels, values, unit, targetPaceMin, names = [], durationsSec = [], distancesMeters = [], distanceUnit = 'miles' as 'miles' | 'km' | 'm' }: { labels: string[]; values: number[]; unit: 'min/mi' | 'min/km'; targetPaceMin: number; names?: string[]; durationsSec?: number[]; distancesMeters?: number[]; distanceUnit?: 'miles' | 'km' | 'm' }) {
  const data = {
    labels,
    datasets: [
      {
        label: `Avg HR @ ${formatMinutes(targetPaceMin)} ${unit === 'min/mi' ? '/mi' : '/km'}`,
        data: values,
        borderColor: '#dc2626',
        backgroundColor: '#fca5a5',
        pointRadius: 4,
        showLine: true,
        tension: 0.2,
      },
    ],
  } as any;

  function formatMinutes(mins: number): string {
    const mm = Math.floor(mins);
    const ss = Math.round((mins - mm) * 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function formatDuration(seconds: number | undefined): string {
    if (!Number.isFinite(seconds)) return '-';
    const s = Math.max(0, Math.floor(seconds as number));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (parts.length === 0) parts.push(`${s % 60}s`);
    return parts.join(' ');
  }

  function formatDistance(meters: number | undefined): string {
    if (!Number.isFinite(meters)) return '-';
    const m = meters as number;
    if (distanceUnit === 'miles') return `${(m / 1609.344).toFixed(2)} mi`;
    if (distanceUnit === 'km') return `${(m / 1000).toFixed(2)} km`;
    return `${Math.round(m)} m`;
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            const i = items[0]?.dataIndex ?? 0;
            return labels[i] || '';
          },
          label: (ctx: any) => {
            const i = ctx.dataIndex ?? 0;
            const hr = `${Math.round(ctx.parsed.y)} bpm`;
            const name = names[i] ? `Session: ${names[i]}` : undefined;
            const dur = durationsSec[i] !== undefined ? `Duration: ${formatDuration(durationsSec[i])}` : undefined;
            const dist = distancesMeters[i] !== undefined ? `Distance: ${formatDistance(distancesMeters[i])}` : undefined;
            const pace = `Pace: ${formatMinutes(targetPaceMin)} ${unit === 'min/mi' ? '/mi' : '/km'}`;
            const parts = [hr, pace, name, dur, dist].filter(Boolean);
            return parts as unknown as string;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Session Date' }, grid: { color: 'rgba(107,114,128,0.22)' } },
      y: {
        title: { display: true, text: 'Heart Rate (bpm)' },
        beginAtZero: false,
        grid: { color: 'rgba(107,114,128,0.22)' },
      },
    },
  };

  return (
    <div className="h-[420px]">
      <Line data={data} options={options} />
    </div>
  );
}


