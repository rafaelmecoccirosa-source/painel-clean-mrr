"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileBarChart, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type SubOption = {
  id: string;
  client_id: string;
  clientName: string;
  plan_type: string;
  modules_count: number;
};

type RecentReport = {
  id: string;
  clientName: string;
  period_month: number;
  period_year: number;
  kwh_generated: number;
  efficiency_pct: number;
  sent_at: string | null;
};

const inputBase =
  "w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-dark " +
  "placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all";

export default function RelatorioMensalAdminPage() {
  const now = new Date();
  // Por padrão o relatório é do mês anterior (fechado)
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [subs, setSubs]       = useState<SubOption[]>([]);
  const [recent, setRecent]   = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [subscriptionId, setSubscriptionId] = useState("");
  const [month, setMonth]   = useState(prevMonth);
  const [year, setYear]     = useState(prevYear);
  const [kwhGen, setKwhGen] = useState("");
  const [kwhExp, setKwhExp] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: subRows } = await supabase
        .from("subscriptions")
        .select("id, client_id, plan_type, modules_count")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const clientIds = Array.from(new Set((subRows ?? []).map((s) => s.client_id)));
      const nameMap: Record<string, string> = {};
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", clientIds);
        (profiles ?? []).forEach((p) => { nameMap[p.user_id] = p.full_name ?? "—"; });
      }

      setSubs((subRows ?? []).map((s) => ({
        id: s.id,
        client_id: s.client_id,
        clientName: nameMap[s.client_id] ?? "Cliente sem nome",
        plan_type: s.plan_type,
        modules_count: s.modules_count,
      })));

      const { data: reports } = await supabase
        .from("monthly_reports")
        .select("id, client_id, period_month, period_year, kwh_generated, efficiency_pct, sent_at")
        .order("created_at", { ascending: false })
        .limit(10);

      const reportClientIds = Array.from(new Set((reports ?? []).map((r) => r.client_id)));
      const missing = reportClientIds.filter((id) => !nameMap[id]);
      if (missing.length > 0) {
        const { data: extra } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", missing);
        (extra ?? []).forEach((p) => { nameMap[p.user_id] = p.full_name ?? "—"; });
      }

      setRecent((reports ?? []).map((r) => ({
        id: r.id,
        clientName: nameMap[r.client_id] ?? "—",
        period_month: r.period_month,
        period_year: r.period_year,
        kwh_generated: Number(r.kwh_generated ?? 0),
        efficiency_pct: Number(r.efficiency_pct ?? 0),
        sent_at: r.sent_at,
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const efficiency = (() => {
    const g = parseFloat(kwhGen);
    const e = parseFloat(kwhExp);
    if (!g || !e || e <= 0) return null;
    return Math.round((g / e) * 100);
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!subscriptionId) return setFeedback({ ok: false, msg: "Selecione a assinatura." });
    const g = parseFloat(kwhGen);
    const exp = parseFloat(kwhExp);
    if (!(g >= 0)) return setFeedback({ ok: false, msg: "Informe o kWh gerado." });
    if (!(exp > 0)) return setFeedback({ ok: false, msg: "Informe o kWh esperado." });

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/monthly-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          period_month: month,
          period_year: year,
          kwh_generated: g,
          kwh_expected: exp,
          alert_message: alertMsg.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, msg: data.error ?? "Erro ao enviar relatório." });
      } else {
        setFeedback({ ok: true, msg: `Relatório de ${MONTHS[month - 1]}/${year} enviado — eficiência ${data.efficiency_pct?.toFixed?.(0) ?? "—"}%. O cliente foi notificado.` });
        setKwhGen(""); setKwhExp(""); setAlertMsg("");
        load();
      }
    } catch {
      setFeedback({ ok: false, msg: "Erro de rede. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-brand-muted hover:text-brand-dark transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Relatórios</p>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark leading-tight">Relatório mensal</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Preencha a performance do mês de cada usina — o cliente vê em Relatórios e recebe notificação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-heading font-bold text-brand-dark text-base flex items-center gap-2">
            <FileBarChart size={17} className="text-brand-green" />
            Novo relatório
          </h2>

          {feedback && (
            <div className={`text-sm rounded-xl px-4 py-3 border ${
              feedback.ok
                ? "bg-brand-light border-brand-border text-brand-dark"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {feedback.msg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
              Assinatura / cliente
            </label>
            <select className={inputBase} value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)} required>
              <option value="">{loading ? "Carregando…" : "Selecione"}</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.clientName} — {s.plan_type} · {s.modules_count} módulos
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Mês</label>
              <select className={inputBase} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Ano</label>
              <select className={inputBase} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                {[prevYear + 1, prevYear, prevYear - 1].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
                kWh gerado
              </label>
              <input type="number" min={0} step="0.01" placeholder="Ex: 720"
                className={inputBase} value={kwhGen} onChange={(e) => setKwhGen(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
                kWh esperado
              </label>
              <input type="number" min={1} step="0.01" placeholder="Ex: 780"
                className={inputBase} value={kwhExp} onChange={(e) => setKwhExp(e.target.value)} required />
            </div>
          </div>

          {efficiency !== null && (
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold border ${
              efficiency >= 85
                ? "bg-brand-light border-brand-border text-brand-dark"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              Eficiência calculada: {efficiency}%
              {efficiency < 85 && " — abaixo de 85%, o hero do cliente mostrará alerta de queda"}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
              Mensagem de alerta (opcional)
            </label>
            <textarea rows={2} maxLength={300}
              placeholder="Ex: Detectamos queda de 8% na geração — recomendamos limpeza antecipada."
              className={`${inputBase} resize-none`}
              value={alertMsg} onChange={(e) => setAlertMsg(e.target.value.slice(0, 300))} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-brand-green text-white hover:bg-brand-green/90 rounded-xl py-3 transition-colors disabled:opacity-50">
            <CheckCircle2 size={16} />
            {submitting ? "Enviando…" : "Enviar relatório ao cliente"}
          </button>
        </form>

        {/* Recent */}
        <div className="card space-y-3">
          <h2 className="font-heading font-bold text-brand-dark text-base">Últimos relatórios enviados</h2>
          {loading ? (
            <p className="text-sm text-brand-muted">Carregando…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-brand-muted py-6 text-center">Nenhum relatório enviado ainda.</p>
          ) : (
            <div className="divide-y divide-brand-border">
              {recent.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark truncate">{r.clientName}</p>
                    <p className="text-xs text-brand-muted">
                      {MONTHS[r.period_month - 1]} {r.period_year} · {Math.round(r.kwh_generated)} kWh
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    r.efficiency_pct >= 85 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {Math.round(r.efficiency_pct)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
