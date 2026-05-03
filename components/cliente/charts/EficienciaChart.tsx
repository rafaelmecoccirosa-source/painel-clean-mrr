'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { COLORS } from '@/lib/brand-tokens';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

export default function EficienciaChart() {
  return (
    <div className="pc-mobile-chart-200" style={{ height: 260 }}>
      <Line
        data={{
          labels: ['Mar/25', 'Jun/25', 'Set/25', 'Dez/25', 'Mar/26'],
          datasets: [
            {
              label: 'Eficiência',
              data: [78, 86, 82, 89, 94],
              borderColor: COLORS.green,
              backgroundColor: 'rgba(61,196,90,0.1)',
              borderWidth: 2.5,
              pointRadius: 5,
              pointBackgroundColor: COLORS.green,
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: COLORS.dark,
              padding: 10,
              callbacks: { label: (ctx) => ` ${Number(ctx.parsed.y ?? 0)}%` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: COLORS.muted, font: { size: 11, family: 'Open Sans' } },
            },
            y: {
              min: 70,
              max: 100,
              grid: { color: COLORS.border },
              ticks: {
                color: COLORS.muted,
                font: { size: 11, family: 'Open Sans' },
                callback: (v) => `${v}%`,
              },
            },
          },
        }}
      />
    </div>
  );
}
