"use client";

import { useState } from "react";
import { MOCK_ADMIN } from "@/lib/mock-data";

const semanas = MOCK_ADMIN.receitaSemanal;

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminReceitaChart() {
  const [hover, setHover] = useState<number | null>(null);

  const maxVal = Math.max(...semanas.map((s) => s.valor));
  const total = semanas.reduce((a, s) => a + s.valor, 0);

  // Trend line: simple polyline over bar tops
  // We'll compute relative points: x = (i / (n-1)) * 100%, y = (1 - val/max) * 100%
  const n = semanas.length;
  const chartH = 80; // px, matches bar container height
  const chartW = 300; // approximate; SVG uses viewBox
  const points = semanas
    .map((s, i) => {
      const x = (i / (n - 1)) * chartW;
      const y = chartH - (s.valor / maxVal) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="font-heading font-bold text-brand-dark text-base">
          📈 Receita semanal — últimas 8 semanas
        </h2>
        <span className="text-xs text-brand-muted bg-brand-light px-3 py-1 rounded-full">
          margem plataforma
        </span>
      </div>

      {/* Bars + trend SVG overlay */}
      <div className="relative">
        <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: "100px" }}>
          {semanas.map((s, i) => {
            const pct = Math.max(Math.round((s.valor / maxVal) * 100), 4);
            const isHovered = hover === i;
            return (
              <div
                key={s.label}
                className="flex-1 flex flex-col items-center relative"
                style={{ height: "100%" }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20 shadow-lg">
                    {fmt(s.valor)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark" />
                  </div>
                )}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-150 ${
                      isHovered ? "bg-brand-green/75" : "bg-brand-green"
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend line SVG overlay */}
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full pointer-events-none"
          style={{ height: "100px" }}
        >
          <polyline
            points={points}
            fill="none"
            stroke="#1B3A2D"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.35"
          />
          {semanas.map((s, i) => {
            const x = (i / (n - 1)) * chartW;
            const y = chartH - (s.valor / maxVal) * chartH;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#1B3A2D"
                opacity="0.3"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1.5 sm:gap-2 mt-2">
        {semanas.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="text-[9px] text-brand-muted font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-brand-border flex flex-wrap items-center justify-between gap-2 text-xs text-brand-muted">
        <span>
          Total acumulado:{" "}
          <strong className="text-brand-dark">{fmt(total)}</strong>
        </span>
        <span className="text-emerald-600 font-semibold">
          ↑ Tendência de crescimento
        </span>
      </div>
    </div>
  );
}
