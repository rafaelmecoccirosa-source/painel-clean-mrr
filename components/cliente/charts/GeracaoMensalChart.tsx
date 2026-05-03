'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { COLORS } from '@/lib/brand-tokens';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const LABELS = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];
const DATA = [398, 430, 460, 445, 415, 390, 375, 410, 356, 398, 412, 438];

export default function GeracaoMensalChart() {
  const bgColors = DATA.map((v) => (v >= 420 ? COLORS.green : 'rgba(61,196,90,0.35)'));

  return (
    <div className="pc-mobile-chart-200" style={{ height: 280 }}>
      <Bar
        data={{
          labels: LABELS,
          datasets: [
            {
              label: 'kWh gerados',
              data: DATA,
              backgroundColor: bgColors,
              borderRadius: 6,
              borderSkipped: false,
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
              titleFont: { family: 'Montserrat', weight: 'bold' as const, size: 12 },
              bodyFont: { family: 'Open Sans', size: 12 },
              callbacks: { label: (ctx) => ` ${Number(ctx.parsed.y ?? 0).toLocaleString('pt-BR')} kWh` },
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
