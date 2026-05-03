'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { COLORS } from '@/lib/brand-tokens';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ImpactoChart() {
  return (
    <div className="pc-mobile-chart-200" style={{ height: 260 }}>
      <Bar
        data={{
          labels: ['mar/25', 'jun/25', 'set/25', 'mar/26'],
          datasets: [
            {
              label: 'Antes',
              data: [320, 345, 358, 392],
              backgroundColor: 'rgba(200,223,192,0.7)',
              borderRadius: 5,
            },
            {
              label: 'Depois',
              data: [346, 393, 390, 438],
              backgroundColor: COLORS.green,
              borderRadius: 5,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: COLORS.muted, font: { size: 11, family: 'Open Sans' }, boxWidth: 12, padding: 14 },
            },
            tooltip: {
              backgroundColor: COLORS.dark,
              padding: 10,
              callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y ?? 0).toLocaleString('pt-BR')} kWh` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: COLORS.muted, font: { size: 11, family: 'Open Sans' } },
            },
            y: {
              grid: { color: COLORS.border },
              ticks: { color: COLORS.muted, font: { size: 11, family: 'Open Sans' } },
            },
          },
        }}
      />
    </div>
  );
}
