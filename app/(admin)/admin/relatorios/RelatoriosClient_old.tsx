"use client";

import { Download } from "lucide-react";
import type { MRRPonto, StatusCount, TopTecnico, TopCidade } from "./page";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:     { label: "Aguardando",   color: "#F59E0B" },
  accepted:    { label: "Aceito",       color: "#3B82F6" },
  in_progress: { label: "Em andamento", color: "#8B5CF6" },
  completed:   { label: "Concluído",    color: "#3DC45A" },
  cancelled:   { label: "Cancelado",    color: "#EF4444" },
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BarChart({ data, color = "#3DC45A" }: { data: { mes: string; valor: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 110 }}>
      {data.map((d) => {
        const pct = Math.max(Math.round((d.valor / max) * 100), 4);
        return (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
            <span className="text-[10px] font-bold text-brand-dark">{d.valor > 0 ? fmt(d.valor).replace("R$ ", "") : "—"}</span>
            <div className="w-full flex items-end flex-1">
              <div className="w-full rounded-t-lg" style={{ height: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-[9px] text-brand-muted">{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

function HBar({ label, value, max, color = "#3DC45A" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-brand-dark font-medium">{label}</span>
        <span className="text-brand-muted font-bold">{value}</span>
      </div>
      <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

interface Props {
  mrr: MRRPonto[];
  statusCounts: StatusCount[];
  topTecnicos: TopTecnico[];
  topCidades: TopCidade[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  servicosCSV: any[];
}

export default function RelatoriosClient({ mrr, statusCounts, topTecnicos, topCidades, servicosCSV }: Props) {
  const mrrAtual = mrr[mrr.length - 1]?.valor ?? 0;
  const mrrAnterior = mrr[mrr.length - 2]?.valor ?? 0;
  const mrrVar = mrrAnterior > 0 ? Math.round(((mrrAtual - mrrAnterior) / mrrAnterior) * 100) : 0;

  const totalServicos = statusCounts.reduce((s, c) => s + c.count, 0);
  const completed = statusCounts.find((c) => c.status === "completed")?.count ?? 0;
  const completionRate = totalServicos > 0 ? Math.round((completed / totalServicos) * 100) : 0;

  const maxTech  = Math.max(...topTecnicos.map((t) => t.total), 1);
  const maxCity  = Math.max(...topCidades.map((c) => c.total), 1);

  function exportCSV() {
    const header = "id,status,city,preferred_date,price_estimate\n";
    const rows = servicosCSV.map((s) =>
      `${s.id ?? ""},${s.status ?? ""},${s.city ?? ""},${s.preferred_date ?? ""},${s.price_estimate ?? ""}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-servicos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* MRR */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h2 className="font-heading font-bold text-brand-dark text-base">💰 MRR — Receita Mensal Recorrente</h2>
            <p className="text-brand-muted text-xs mt-0.5">Baseado em assinaturas ativas (últimos 6 meses)</p>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-brand-dark text-xl">{fmt(mrrAtual)}</p>
            {mrrVar !== 0 && (
              <p className={`text-xs font-semibold ${mrrVar > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {mrrVar > 0 ? "↑" : "↓"} {Math.abs(mrrVar)}% vs mês anterior
              </p>
            )}
          </div>
        </div>
        <BarChart data={mrr} />
      </div>

      {/* Serviços por status */}
      <div className="card space-y-4">
        <h2 className="font-heading font-bold text-brand-dark text-base">📋 Serviços por status</h2>
        {totalServicos === 0 ? (
          <p className="text-sm text-brand-muted text-center py-6">Nenhum serviço cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {statusCounts.map((s) => {
              const meta = STATUS_LABELS[s.status] ?? { label: s.status, color: "#7A9A84" };
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-brand-dark">{meta.label}</span>
                    <span className="text-brand-muted font-bold">{s.count} ({Math.round((s.count / totalServicos) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / totalServicos) * 100}%`, backgroundColor: meta.color }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-brand-border flex gap-6 text-xs text-brand-muted">
              <span>Total: <strong className="text-brand-dark">{totalServicos}</strong></span>
              <span>Concluídos: <strong className="text-brand-dark">{completed}</strong></span>
              <span>Taxa: <strong className="text-brand-green">{completionRate}%</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Top técnicos */}
        <div className="card space-y-4">
          <h2 className="font-heading font-bold text-brand-dark text-base">🔧 Top técnicos</h2>
          {topTecnicos.length === 0 ? (
            <p className="text-sm text-brand-muted text-center py-6">Nenhum serviço concluído.</p>
          ) : (
            <div className="space-y-3">
              {topTecnicos.map((t, i) => (
                <div key={t.nome} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-brand-muted text-center">{i + 1}</span>
                  <div className="flex-1">
                    <HBar label={t.nome} value={t.total} max={maxTech} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top cidades */}
        <div className="card space-y-4">
          <h2 className="font-heading font-bold text-brand-dark text-base">📍 Top cidades</h2>
          {topCidades.length === 0 ? (
            <p className="text-sm text-brand-muted text-center py-6">Sem dados de cidade.</p>
          ) : (
            <div className="space-y-3">
              {topCidades.map((c, i) => (
                <div key={c.cidade} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-brand-muted text-center">{i + 1}</span>
                  <div className="flex-1">
                    <HBar label={c.cidade} value={c.total} max={maxCity} color="#1B3A2D" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-border text-sm font-semibold text-brand-dark bg-white hover:bg-brand-bg transition-colors"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>
    </div>
  );
}
