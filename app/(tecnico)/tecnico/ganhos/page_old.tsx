export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { DollarSign, TrendingUp, Briefcase, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = { title: "Ganhos — Técnico" };

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const MES_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface Servico {
  id: string;
  preferred_date: string;
  price_estimate: number;
  client_name: string;
}

function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 100 }}>
      {data.map((d) => {
        const pct = Math.max(Math.round((d.valor / max) * 100), 4);
        return (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
            <span className="text-[10px] font-bold text-brand-dark truncate w-full text-center">
              {d.valor > 0 ? fmt(d.valor).replace("R$ ", "") : "—"}
            </span>
            <div className="w-full flex items-end flex-1">
              <div className="w-full rounded-t-lg bg-brand-green" style={{ height: `${pct}%` }} />
            </div>
            <span className="text-[9px] text-brand-muted">{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function GanhosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createServiceClient();

  // Fetch all completed services for this tech
  const { data: servicos = [] } = await admin
    .from("service_requests")
    .select("id, preferred_date, price_estimate, client_id")
    .eq("technician_id", user.id)
    .eq("status", "completed")
    .order("preferred_date", { ascending: false });

  // Batch fetch client names
  const clientIds = Array.from(new Set((servicos ?? []).map((s) => s.client_id).filter(Boolean)));
  const nameMap: Record<string, string> = {};
  if (clientIds.length > 0) {
    const { data: profs } = await admin
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", clientIds);
    (profs ?? []).forEach((p) => { if (p.user_id) nameMap[p.user_id] = p.full_name ?? "Cliente"; });
  }

  const items: Servico[] = (servicos ?? []).map((s) => ({
    id: s.id,
    preferred_date: s.preferred_date ?? "",
    price_estimate: s.price_estimate ?? 0,
    client_name: nameMap[s.client_id] ?? "Cliente",
  }));

  // Current month
  const now = new Date();
  const yearNow = now.getFullYear();
  const monthNow = now.getMonth(); // 0-indexed

  const totalAcumulado = items.reduce((s, r) => s + r.price_estimate * 0.75, 0);
  const totalMes = items.filter((r) => {
    if (!r.preferred_date) return false;
    const d = new Date(r.preferred_date);
    return d.getFullYear() === yearNow && d.getMonth() === monthNow;
  }).reduce((s, r) => s + r.price_estimate * 0.75, 0);

  // Monthly breakdown — last 6 months
  const months6: { mes: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(yearNow, monthNow - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const label = MES_LABELS[m];
    const valor = items
      .filter((r) => {
        if (!r.preferred_date) return false;
        const rd = new Date(r.preferred_date);
        return rd.getFullYear() === y && rd.getMonth() === m;
      })
      .reduce((s, r) => s + r.price_estimate * 0.75, 0);
    months6.push({ mes: label, valor: Math.round(valor) });
  }

  const mesAtual = MES_LABELS[monthNow];

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Meus ganhos</h1>
        <p className="text-brand-muted text-sm mt-1">
          {mesAtual} {yearNow} · {items.filter((r) => {
            if (!r.preferred_date) return false;
            const d = new Date(r.preferred_date);
            return d.getFullYear() === yearNow && d.getMonth() === monthNow;
          }).length} serviços concluídos no mês
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-brand-muted mb-0.5">Recebido no mês</p>
            <p className="font-heading text-2xl font-bold text-brand-dark">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={22} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-brand-muted mb-0.5">Total acumulado</p>
            <p className="font-heading text-2xl font-bold text-brand-dark">{fmt(totalAcumulado)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
            <Briefcase size={22} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-brand-muted mb-0.5">Serviços concluídos</p>
            <p className="font-heading text-2xl font-bold text-brand-dark">{items.length}</p>
          </div>
        </div>
      </div>

      {/* Gráfico mensal */}
      <div className="card space-y-4">
        <h2 className="font-heading font-bold text-brand-dark text-base">📊 Ganhos — últimos 6 meses</h2>
        <p className="text-xs text-brand-muted">Repasse líquido (75% do valor do serviço)</p>
        {months6.every((m) => m.valor === 0) ? (
          <p className="text-sm text-brand-muted text-center py-8">Nenhum serviço concluído nos últimos 6 meses.</p>
        ) : (
          <BarChart data={months6} />
        )}
      </div>

      {/* Histórico de pagamentos */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
          <Calendar size={16} className="text-brand-green" />
          <h2 className="font-heading font-bold text-brand-dark text-base">Histórico de pagamentos</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-brand-muted text-center py-10">Nenhum serviço concluído ainda.</p>
        ) : (
          <div className="divide-y divide-brand-border">
            {items.slice(0, 20).map((s) => {
              const repasse = s.price_estimate * 0.75;
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign size={16} className="text-brand-green" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{s.client_name}</p>
                      <p className="text-xs text-brand-muted mt-0.5">
                        {s.preferred_date ? fmtDate(s.preferred_date) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-brand-green text-base">{fmt(repasse)}</p>
                    <p className="text-[10px] text-brand-muted">75% de {fmt(s.price_estimate)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info repasse */}
      <div className="rounded-2xl border border-brand-border bg-brand-bg px-5 py-4 text-xs text-brand-muted space-y-1">
        <p className="font-semibold text-brand-dark text-sm">Como funciona o repasse?</p>
        <p>Você recebe <strong className="text-brand-dark">75%</strong> do valor de cada serviço concluído. A plataforma retém 25% para operação e suporte.</p>
        <p>Repasses são processados semanalmente via PIX após confirmação do serviço.</p>
      </div>
    </div>
  );
}
