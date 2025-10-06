'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  Legend,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useMemo } from 'react';
import type { SessionSeries } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';

ChartJS.register(LineElement, PointElement, LinearScale, TimeSeriesScale, Legend, Tooltip, zoomPlugin, annotationPlugin);

type Props = {
  series: SessionSeries[];
  show: { hr: boolean; pace: boolean; cadence: boolean; elev: boolean; power?: boolean };
  fixedHr?: number;
  paceUnit: 'min/mi' | 'min/km';
};

export default function CMEUnifiedChart({ series, show, fixedHr, paceUnit }: Props) {
  // Distinct palettes per metric to improve comparison
  const hrColors = ['#ef4444', '#dc2626', '#fb7185', '#f97316'];
  const paceColors = ['#2563eb', '#0ea5e9', '#22d3ee', '#3b82f6'];
  const cadenceColors = ['#f59e0b', '#fbbf24', '#d97706', '#eab308'];
  const elevColors = ['#10b981', '#22c55e', '#4ade80', '#059669'];
  const powerColors = ['#a855f7', '#8b5cf6', '#7c3aed', '#c084fc'];
  const formatMMSS = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  const ds = useMemo(() => {
    const datasets: any[] = [];
    series.forEach((s, idx) => {
      const hrColor = hrColors[idx % hrColors.length];
      const pColor = paceColors[idx % paceColors.length];
      const cColor = cadenceColors[idx % cadenceColors.length];
      const eColor = elevColors[idx % elevColors.length];
      if (show.hr) {
        datasets.push({
          label: `${s.label} · HR`,
          data: s.points.map(p => ({ x: p.t, y: p.hr })),
          borderColor: hrColor,
          backgroundColor: hrColor,
          yAxisID: 'y1',
          spanGaps: true,
          pointRadius: 0,
          tension: 0.2,
          order: 1,
        });
      }
      if (show.pace) {
        datasets.push({
          label: `${s.label} · Pace (${paceUnit})`,
          data: s.points.map(p => ({ x: p.t, y: p.pace })),
          borderColor: pColor,
          backgroundColor: pColor,
          yAxisID: 'y2',
          spanGaps: true,
          pointRadius: 0,
          tension: 0.2,
          borderDash: [6, 3],
          order: 2,
        });
      }
      if (show.cadence) {
        datasets.push({
          label: `${s.label} · Cadence`,
          data: s.points.map(p => ({ x: p.t, y: p.cadence })),
          borderColor: cColor,
          backgroundColor: cColor,
          yAxisID: 'y3',
          spanGaps: true,
          pointRadius: 0,
          tension: 0.2,
          borderDash: [2, 2],
          order: 3,
        });
      }
      if (show.elev) {
        datasets.push({
          label: `${s.label} · Elevation`,
          data: s.points.map(p => ({ x: p.t, y: p.elev })),
          borderColor: eColor,
          backgroundColor: eColor,
          yAxisID: 'y4',
          spanGaps: true,
          pointRadius: 0,
          tension: 0.2,
          borderDash: [4, 6],
          order: 4,
        });
      }
      if (show.power) {
        const pwColor = powerColors[idx % powerColors.length];
        const powerData = s.points.map(p => ({ x: p.t, y: typeof p.power === 'number' ? p.power : null }));
        console.log(`Power data for ${s.label}:`, powerData.slice(0, 5), '...');
        datasets.push({
          label: `${s.label} · Power (W)`,
          data: powerData,
          borderColor: pwColor,
          backgroundColor: pwColor,
          yAxisID: 'y5',
          spanGaps: true,
          pointRadius: 0,
          tension: 0.2,
          borderDash: [8, 4],
          order: 5,
        });
      }
    });
    return datasets;
  }, [series, show.hr, show.pace, show.cadence, show.elev, show.power, paceUnit]);

  const data = { datasets: ds } as any;
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          title: (items: any[]) => {
            const x = items && items.length > 0 ? items[0].parsed?.x ?? items[0].raw?.x : undefined;
            return typeof x === 'number' ? `Time ${formatMMSS(x)}` : '';
          },
        }
      },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        limits: { x: { min: 0 } },
      },
      annotation: fixedHr ? {
        annotations: {
          fixedHr: {
            type: 'line',
            yMin: fixedHr,
            yMax: fixedHr,
            yScaleID: 'y1',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderDash: [6, 6],
            label: { enabled: true, content: `HR ${fixedHr} bpm`, position: 'start' },
          },
        },
      } : undefined,
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { 
        type: 'linear', 
        title: { display: true, text: 'Time (mm:ss)' },
        min: 0,
        ticks: {
          stepSize: 60, // one gridline per minute
          callback: (value: any) => {
            const v = typeof value === 'number' ? value : Number(value);
            return Number.isFinite(v) ? formatMMSS(v) : value;
          }
        },
        grid: {
          color: 'rgba(107,114,128,0.22)', // light gray
          lineWidth: 1
        }
      },
      y1: { position: 'left', title: { display: true, text: 'HR (bpm)' }, grid: { drawOnChartArea: true } },
      y2: { position: 'right', title: { display: true, text: `Pace (${paceUnit})` }, grid: { drawOnChartArea: false }, reverse: true },
      y3: { display: show.cadence, position: 'right', title: { display: true, text: 'Cadence (spm)' }, grid: { drawOnChartArea: false } },
      y4: { display: show.elev, position: 'right', title: { display: true, text: 'Elevation (m)' }, grid: { drawOnChartArea: false } },
      y5: { display: show.power, position: 'right', title: { display: true, text: 'Power (W)' }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div className="h-[420px]">
      <Line data={data} options={options} />
    </div>
  );
}


