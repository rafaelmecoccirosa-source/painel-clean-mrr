import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import DisponibilidadeToggle from "@/components/tecnico/DisponibilidadeToggle";
import GanhosChart from "@/components/tecnico/GanhosChart";
import { MOCK_TECNICO } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SUBSCRIPTION_ENABLED } from "@/lib/config";
import { BannerParticles } from "@/components/BannerParticles";

export const metadata: Metadata = { title: "Dashboard — Técnico | Painel Clean" };

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });
}

export default async function TecnicoDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createServiceClient();

  // ── Profile ──────────────────────────────────────────────────────────────
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, lat, city")
    .eq("user_id", user.id)
    .maybeSingle();

  const userName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Técnico";
  const hasLocation = profile?.lat != null;
  const techCity = profile?.city ?? null;

  // ── Month boundaries ──────────────────────────────────────────────────────
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [completedMonthRes, completedAllRes, proximosRes, disponiveisRes, historicoRes] =
    await Promise.all([
      // Ganhos do mês: completed this month
      admin
        .from("service_requests")
        .select("price_estimate")
        .eq("technician_id", user.id)
        .eq("status", "completed")
        .gte("preferred_date", firstOfMonth),

      // Total completed all time
      admin
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("technician_id", user.id)
        .eq("status", "completed"),

      // Próximos chamados confirmados (aceitos por mim)
      admin
        .from("service_requests")
        .select("id, city, address, module_count, price_estimate, preferred_date, preferred_time, client_id")
        .eq("technician_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .order("preferred_date", { ascending: true })
        .limit(3),

      // Chamados disponíveis na minha cidade
      techCity
        ? admin
            .from("service_requests")
            .select("id, city, address, module_count, price_estimate, preferred_date, preferred_time")
            .eq("status", "pending")
            .is("technician_id", null)
            .eq("city", techCity)
            .order("created_at", { ascending: true })
            .limit(3)
        : Promise.resolve({ data: [] as any[] }),

      // Últimos 5 serviços concluídos para historico
      admin
        .from("service_requests")
        .select("id, city, module_count, price_estimate, preferred_date, client_id")
        .eq("technician_id", user.id)
        .eq("status", "completed")
        .order("preferred_date", { ascending: false })
        .limit(5),
    ]);

  const ganhosMes = Math.round(
    (completedMonthRes.data ?? []).reduce((s, r) => s + (r.price_estimate ?? 0) * 0.75, 0),
  );
  const servicosMes = completedMonthRes.data?.length ?? 0;
  const totalServicos = completedAllRes.count ?? 0;
  const proximos = proximosRes.data ?? [];
  const disponiveis = (disponiveisRes as any).data ?? [];
  const historicoRaw = historicoRes.data ?? [];

  const historico = historicoRaw.map((s) => ({
    data:     s.preferred_date ? fmtDate(s.preferred_date) : "—",
    cidade:   s.city ?? "—",
    modulos:  s.module_count ?? 0,
    recebido: Math.round((s.price_estimate ?? 0) * 0.75),
    nota:     null as number | null,
  }));

  const mesAtual = now.toLocaleString("pt-BR", { month: "long" });
  const mesCapitalized = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
  const anoAtual = now.getFullYear();

  const resumo = [
    {
      emoji: "💰",
      label: "Ganhos do mês",
      value: fmt(ganhosMes),
      trend: null,
      up: true,
      sub: `${mesCapitalized} · repasse 75%`,
    },
    {
      emoji: "📋",
      label: "Serviços realizados",
      value: String(servicosMes),
      trend: null,
      up: true,
      sub: `${mesCapitalized} · ${totalServicos} total`,
    },
    {
      emoji: "⭐",
      label: "Avaliação média",
      value: MOCK_TECNICO.avaliacaoMedia.toFixed(1),
      trend: null,
      up: true,
      sub: "últimos 30 dias",
    },
    {
      emoji: "⏱️",
      label: "Tempo médio",
      value: `${MOCK_TECNICO.tempoMedio}h`,
      trend: null,
      up: true,
      sub: "por serviço",
    },
  ];

  const { performance } = MOCK_TECNICO;

  return (
    <div className="page-container space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-dark">
            Olá, {userName}! 👋
          </h1>
          <p className="text-brand-muted text-sm mt-0.5">
            {mesCapitalized} {anoAtual} · {techCity ?? "configure sua cidade"}
          </p>
        </div>
        <DisponibilidadeToggle cidade={techCity ? `${techCity}, SC` : "—"} />
      </div>

      {/* ── Banner sem mensalidade ── */}
      {!SUBSCRIPTION_ENABLED && (
        <div className="flex items-start gap-3 bg-brand-light border border-brand-border rounded-2xl px-4 py-3.5">
          <span className="text-2xl flex-shrink-0">💰</span>
          <div>
            <p className="text-sm font-bold text-brand-dark">
              ✅ Sem mensalidade — apenas 25% de comissão por serviço realizado
            </p>
            <p className="text-xs text-brand-muted mt-0.5">
              Exemplo: num serviço de R$ 600, você recebe R$ 450 via PIX automático.
            </p>
          </div>
        </div>
      )}

      {/* ── Banner seguro ── */}
      <div className="flex items-start gap-3 bg-white border border-brand-border rounded-2xl px-4 py-3.5">
        <span className="text-2xl flex-shrink-0">🛡️</span>
        <div>
          <p className="text-sm font-bold text-brand-dark">Seguro contra danos — todos os serviços</p>
          <p className="text-xs text-brand-muted mt-0.5">
            Todos os serviços realizados pela plataforma incluem cobertura contra danos acidentais durante a limpeza.
          </p>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {resumo.map(({ emoji, label, value, trend, up, sub }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-2xl leading-none">{emoji}</span>
            <div className="mt-1">
              <p className="font-heading text-[22px] font-bold text-brand-dark leading-tight">{value}</p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
            </div>
            {trend ? (
              <div className="flex items-center gap-1">
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                  {up ? "↑" : "↓"} {trend}
                </span>
                <span className="text-[10px] text-brand-muted">{sub}</span>
              </div>
            ) : (
              <p className="text-[10px] text-brand-muted">{sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Próximos chamados confirmados ── */}
      {proximos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-brand-dark text-base">📅 Próximos chamados</h2>
            <Link href="/tecnico/chamados" className="text-xs text-brand-green font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {proximos.map((c) => (
              <div key={c.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="font-heading font-bold text-brand-dark text-sm">📍 {c.city ?? "—"}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
                    <span>📅 {c.preferred_date ? fmtDate(c.preferred_date) : "—"} · {c.preferred_time ?? "—"}</span>
                    <span>🔋 {c.module_count ?? 0} módulos</span>
                    <span className="text-brand-green font-semibold">💰 {fmt((c.price_estimate ?? 0) * 0.75)} repasse</span>
                  </div>
                </div>
                <Link
                  href={`/tecnico/chamados/${c.id}`}
                  className="flex-shrink-0 text-xs font-semibold text-brand-dark border border-brand-border rounded-xl px-4 py-2 hover:bg-brand-light transition-colors flex items-center gap-1"
                >
                  Ver detalhe <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chamados disponíveis na cidade ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-brand-dark text-base">🔔 Chamados disponíveis</h2>
          <Link href="/tecnico/chamados" className="text-xs text-brand-green font-semibold hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {disponiveis.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center gap-3">
            <span className="text-4xl">📭</span>
            <p className="font-heading font-bold text-brand-dark text-sm">Nenhum chamado disponível</p>
            <p className="text-xs text-brand-muted max-w-xs">Fique online para receber novos chamados na sua região!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disponiveis.map((c: any) => (
              <div key={c.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <span className="font-heading font-bold text-brand-dark text-sm">📍 {c.city ?? techCity}</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
                    <span>📅 {c.preferred_date ? fmtDate(c.preferred_date) : "—"} · {c.preferred_time ?? "—"}</span>
                    <span>🔋 {c.module_count ?? 0} módulos</span>
                    <span>
                      💰 {fmt(c.price_estimate ?? 0)}{" "}
                      <span className="text-brand-green font-semibold">(repasse: {fmt((c.price_estimate ?? 0) * 0.75)})</span>
                    </span>
                  </div>
                </div>
                <Link
                  href={`/tecnico/chamados/${c.id}`}
                  className="flex-shrink-0 text-xs font-semibold text-brand-dark border border-brand-border rounded-xl px-4 py-2 hover:bg-brand-light transition-colors flex items-center gap-1"
                >
                  Ver detalhes <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Banner: completar perfil ── */}
      {!hasLocation && (
        <div className="bg-brand-light border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-dark">Complete seu perfil</p>
            <p className="text-xs text-brand-muted mt-0.5">Informe seu CEP para aparecer no mapa de cobertura</p>
          </div>
          <a href="/tecnico/perfil" className="text-sm font-medium text-brand-dark underline whitespace-nowrap">
            Adicionar CEP →
          </a>
        </div>
      )}

      {/* ── Ranking + Meta ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-brand-dark rounded-2xl p-5 relative overflow-hidden">
          <BannerParticles />
          <div className="relative space-y-4" style={{ zIndex: 2 }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-heading font-bold text-white text-sm">Seu ranking</p>
                  <p className="text-white/50 text-xs">{techCity ?? "—"}</p>
                </div>
              </div>
              <span className="font-heading font-extrabold text-brand-green text-2xl">#—</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-xs text-white/50">
              Ranking calculado com dados históricos — disponível em breve.
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-heading font-bold text-brand-dark text-sm">Chamados este mês</p>
              <p className="text-brand-muted text-xs">{mesCapitalized} {anoAtual}</p>
            </div>
          </div>
          <div>
            <p className="font-heading font-extrabold text-brand-dark text-3xl">
              {servicosMes}
              <span className="text-brand-muted text-base font-normal ml-1">chamados</span>
            </p>
            <p className="text-xs text-brand-muted mt-1">
              Meta: <span className="font-semibold text-brand-dark">15 chamados/mês</span>
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-brand-muted">Progresso</span>
              <span className="font-semibold text-brand-dark">
                {servicosMes}/15 ({Math.min(100, Math.round((servicosMes / 15) * 100))}%)
              </span>
            </div>
            <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full"
                style={{ width: `${Math.min(100, Math.round((servicosMes / 15) * 100))}%` }}
              />
            </div>
          </div>
          <div className="bg-brand-light rounded-xl px-3 py-2.5">
            <p className="text-xs font-medium text-brand-dark">
              💡 Fique online para receber mais chamados automaticamente
            </p>
          </div>
        </div>
      </div>

      {/* ── Gráfico de ganhos ── */}
      <GanhosChart />

      {/* ── Desempenho ── */}
      <div className="card">
        <h2 className="font-heading font-bold text-brand-dark text-base mb-5">🎯 Desempenho — métricas vs meta</h2>
        <div className="space-y-4">
          {performance.map(({ label, pct, meta }) => {
            const aboveMeta = pct >= meta;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-brand-dark">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${aboveMeta ? "text-emerald-600" : "text-amber-500"}`}>{pct}%</span>
                    <span className="text-[10px] text-brand-muted">meta {meta}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-brand-light rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${aboveMeta ? "bg-brand-green" : "bg-amber-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-brand-muted mt-4">✅ Acima da meta &nbsp;|&nbsp; ⚠️ Abaixo da meta</p>
      </div>

      {/* ── Últimos serviços ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-brand-dark text-base">🕘 Últimos serviços</h2>
          <Link href="/tecnico/ganhos" className="text-xs text-brand-green font-semibold hover:underline flex items-center gap-1">
            Ver histórico completo <ArrowRight size={12} />
          </Link>
        </div>

        {historico.length === 0 ? (
          <p className="text-brand-muted text-sm text-center py-6">Nenhum serviço concluído ainda.</p>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left text-xs font-semibold text-brand-muted pb-2">Data</th>
                    <th className="text-left text-xs font-semibold text-brand-muted pb-2">Cidade</th>
                    <th className="text-right text-xs font-semibold text-brand-muted pb-2">Módulos</th>
                    <th className="text-right text-xs font-semibold text-brand-muted pb-2">Recebido</th>
                    <th className="text-right text-xs font-semibold text-brand-muted pb-2">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, i) => (
                    <tr key={i} className="border-b border-brand-border/50 last:border-0">
                      <td className="py-2.5 text-brand-dark font-medium">{h.data}</td>
                      <td className="py-2.5 text-brand-dark">{h.cidade}</td>
                      <td className="py-2.5 text-right text-brand-muted">{h.modulos}</td>
                      <td className="py-2.5 text-right font-bold text-brand-green">{fmt(h.recebido)}</td>
                      <td className="py-2.5 text-right text-brand-muted">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3">
              {historico.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-brand-border/50 last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-brand-dark">{h.cidade}</p>
                    <p className="text-[11px] text-brand-muted">{h.data} · {h.modulos} módulos</p>
                  </div>
                  <p className="font-bold text-brand-green text-sm">{fmt(h.recebido)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
