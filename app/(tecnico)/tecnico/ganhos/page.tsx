export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { DollarSign, TrendingUp, Briefcase, Info } from "lucide-react";
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
  city: string;
  module_count: number;
}

function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 100 }}>
      {data.map((d) => {
        const pct = Math.max(Math.round((d.valor / max) * 100), 4);
        return (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
            <span className="text-[9px] font-bold text-brand-dark truncate w-full text-center">
              {d.valor > 0 ? fmt(d.valor).replace("R$ ", "").replace("R$ ", "") : "—"}
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

  const { data: servicos = [] } = await admin
    .from("service_requests")
    .select("id, preferred_date, price_estimate, client_id, city, module_count")
    .eq("technician_id", user.id)
    .eq("status", "completed")
    .order("preferred_date", { ascending: false });

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
    city: s.city ?? "—",
    module_count: s.module_count ?? 0,
  }));

  const now = new Date();
  const yearNow = now.getFullYear();
  const monthNow = now.getMonth();

  const itemsMes = items.filter((r) => {
    if (!r.preferred_date) return false;
    const d = new Date(r.preferred_date);
    return d.getFullYear() === yearNow && d.getMonth() === monthNow;
  });

  const totalAcumulado = items.reduce((s, r) => s + r.price_estimate * 0.75, 0);
  const totalMes = itemsMes.reduce((s, r) => s + r.price_estimate * 0.75, 0);
  const servicosMes = itemsMes.length;
  const ticketMedio = servicosMes > 0 ? totalMes / servicosMes : 0;

  const months6: { mes: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(yearNow, monthNow - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const valor = items
      .filter((r) => {
        if (!r.preferred_date) return false;
        const rd = new Date(r.preferred_date);
        return rd.getFullYear() === y && rd.getMonth() === m;
      })
      .reduce((s, r) => s + r.price_estimate * 0.75, 0);
    months6.push({ mes: MES_LABELS[m], valor: Math.round(valor) });
  }

  const mesAtual = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  const mesCapitalized = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

  const compactStats = [
    { icon: <TrendingUp size={18} className="text-brand-green" />, label: "Total acumulado", value: fmt(totalAcumulado), sub: "Todos os serviços" },
    { icon: <Briefcase size={18} className="text-brand-green" />, label: "Serviços no mês", value: String(servicosMes), sub: mesCapitalized },
    { icon: <DollarSign size={18} className="text-brand-green" />, label: "Ticket médio", value: fmt(ticketMedio), sub: "Neste mês" },
    { icon: <Info size={18} className="text-brand-green" />, label: "Total de serviços", value: String(items.length), sub: "Desde o início" },
  ];

  const steps = [
    { num: 1, t: "Você conclui o serviço", d: "Faz a limpeza, envia fotos e checklist." },
    { num: 2, t: "Cliente confirma", d: "Tem até 24h pra avaliar. Sem resposta = aprovado automaticamente." },
    { num: 3, t: "PIX automático", d: "75% do valor cai na sua conta em até 48h. Você acompanha aqui." },
  ];

  return (
    <div className="page-container space-y-6">

      {/* Header */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Seus ganhos</p>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark leading-tight">
            {mesCapitalized}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {servicosMes} serviço{servicosMes !== 1 ? "s" : ""} concluído{servicosMes !== 1 ? "s" : ""} no mês · repasses via PIX automático em até 48h
          </p>
        </div>
      </div>

      {/* Hero dark */}
      <section className="fade-up rounded-2xl overflow-hidden relative" style={{
        background: "linear-gradient(135deg, #1B3A2D 0%, #0F2A20 100%)",
        padding: "32px 28px",
      }}>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.5)" }}>Recebido no mês</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold" style={{ color: "#3DC45A" }}>R$</span>
              <span className="font-heading font-black leading-none" style={{ fontSize: 56, color: "white", letterSpacing: "-.04em" }}>
                {totalMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,.6)" }}>
              {servicosMes} serviço{servicosMes !== 1 ? "s" : ""} · ticket médio {fmt(ticketMedio)} · repasse 75%
            </p>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.5)" }}>Total acumulado</p>
            <p className="font-heading font-black text-3xl mt-2" style={{ color: "#3DC45A", letterSpacing: "-.03em" }}>
              {fmt(totalAcumulado)}
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,.45)" }}>
              {items.length} serviço{items.length !== 1 ? "s" : ""} concluído{items.length !== 1 ? "s" : ""} no total
            </p>
          </div>
        </div>
      </section>

      {/* 4 compact stats */}
      <section className="fade-up fade-up-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {compactStats.map((s) => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-brand-muted truncate">{s.label}</p>
              <p className="font-heading font-bold text-brand-dark text-base truncate">{s.value}</p>
              <p className="text-[10px] text-brand-muted truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Chart */}
      <div className="fade-up fade-up-2 card space-y-4">
        <div>
          <h2 className="font-heading font-bold text-brand-dark text-base">Ganhos — últimos 6 meses</h2>
          <p className="text-xs text-brand-muted mt-0.5">Repasse líquido (75% do valor do serviço)</p>
        </div>
        {months6.every((m) => m.valor === 0) ? (
          <p className="text-sm text-brand-muted text-center py-8">Nenhum serviço concluído nos últimos 6 meses.</p>
        ) : (
          <BarChart data={months6} />
        )}
      </div>

      {/* Como funciona */}
      <section className="fade-up fade-up-3 card space-y-4">
        <div>
          <h2 className="font-heading font-bold text-brand-dark text-base">Como funciona o repasse</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.num} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
              <div className="h-8 w-8 rounded-full flex items-center justify-center mb-3 font-heading font-extrabold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3DC45A, #2DAF4A)" }}>
                {s.num}
              </div>
              <p className="font-heading font-bold text-brand-dark text-sm">{s.t}</p>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico */}
      <div className="fade-up fade-up-4 card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
          <DollarSign size={16} className="text-brand-green" />
          <h2 className="font-heading font-bold text-brand-dark text-base">Histórico de pagamentos</h2>
          <span className="text-xs text-brand-muted ml-auto">Últimos {Math.min(items.length, 20)} serviços</span>
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
                      <DollarSign size={15} className="text-brand-green" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{s.client_name}</p>
                      <p className="text-xs text-brand-muted mt-0.5">
                        {s.preferred_date ? fmtDate(s.preferred_date) : "—"}
                        {s.city !== "—" ? ` · ${s.city}` : ""}
                        {s.module_count > 0 ? ` · ${s.module_count} módulos` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading font-bold text-brand-green text-base">{fmt(repasse)}</p>
                    <p className="text-[10px] text-brand-muted">75% de {fmt(s.price_estimate)}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-1">
                      Repasse feito
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
