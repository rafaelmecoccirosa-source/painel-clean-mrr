import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, DollarSign, Briefcase, Star, Clock } from "lucide-react";
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

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, lat, city")
    .eq("user_id", user.id)
    .maybeSingle();

  const userName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Técnico";
  const hasLocation = profile?.lat != null;
  const techCity = profile?.city ?? null;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const [completedMonthRes, completedAllRes, proximosRes, disponiveisRes, historicoRes] =
    await Promise.all([
      admin
        .from("service_requests")
        .select("price_estimate")
        .eq("technician_id", user.id)
        .eq("status", "completed")
        .gte("preferred_date", firstOfMonth),
      admin
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("technician_id", user.id)
        .eq("status", "completed"),
      admin
        .from("service_requests")
        .select("id, city, address, module_count, price_estimate, preferred_date, preferred_time, client_id")
        .eq("technician_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .order("preferred_date", { ascending: true })
        .limit(3),
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
  }));

  const mesAtual = now.toLocaleString("pt-BR", { month: "long" });
  const mesCapitalized = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
  const anoAtual = now.getFullYear();

  const resumo = [
    {
      icon: <DollarSign size={20} className="text-brand-green" />,
      label: "Ganhos do mês",
      value: fmt(ganhosMes),
      sub: `${mesCapitalized} · repasse 75%`,
      demo: false,
    },
    {
      icon: <Briefcase size={20} className="text-brand-green" />,
      label: "Serviços realizados",
      value: String(servicosMes),
      sub: `${mesCapitalized} · ${totalServicos} total`,
      demo: false,
    },
    {
      icon: <Star size={20} className="text-brand-muted" />,
      label: "Avaliação média",
      value: "—",
      sub: "disponível em breve",
      demo: true,
    },
    {
      icon: <Clock size={20} className="text-brand-muted" />,
      label: "Tempo médio",
      value: "—",
      sub: "disponível em breve",
      demo: true,
    },
  ];

  const { performance } = MOCK_TECNICO;

  return (
    <div className="page-container space-y-6">

      {/* Header */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">
            {mesCapitalized} {anoAtual} · {techCity ?? "configure sua cidade"}
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark leading-tight">
            Olá, {userName}! 👋
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {disponiveis.length > 0
              ? `${disponiveis.length} chamado${disponiveis.length !== 1 ? "s" : ""} disponíve${disponiveis.length !== 1 ? "is" : "l"} agora.`
              : "Aguardando chamados na sua região."}
          </p>
        </div>
        <DisponibilidadeToggle cidade={techCity ? `${techCity}, SC` : "—"} />
      </div>

      {/* Banners */}
      <div className="fade-up fade-up-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!SUBSCRIPTION_ENABLED && (
          <div className="flex items-start gap-3 bg-brand-light border border-brand-border rounded-2xl px-4 py-3.5">
            <span className="text-2xl flex-shrink-0">💰</span>
            <div>
              <p className="text-sm font-bold text-brand-dark">Sem mensalidade — apenas 25% de comissão</p>
              <p className="text-xs text-brand-muted mt-0.5">Ex: serviço de R$ 600 → você recebe R$ 450 via PIX.</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3 bg-white border border-brand-border rounded-2xl px-4 py-3.5">
          <span className="text-2xl flex-shrink-0">🛡️</span>
          <div>
            <p className="text-sm font-bold text-brand-dark">Seguro contra danos — todos os serviços</p>
            <p className="text-xs text-brand-muted mt-0.5">Cobertura contra danos acidentais durante a limpeza.</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="fade-up fade-up-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {resumo.map(({ icon, label, value, sub, demo }) => (
          <div key={label} className={`card flex flex-col gap-3 ${demo ? "opacity-60" : ""}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${demo ? "bg-brand-bg" : "bg-brand-green/10"}`}>
              {icon}
            </div>
            <div>
              <p className={`font-heading text-2xl font-extrabold leading-tight ${demo ? "text-brand-muted" : "text-brand-dark"}`}>
                {value}
              </p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
              <p className="text-[10px] text-brand-muted mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Próximos chamados */}
      {proximos.length > 0 && (
        <div className="fade-up fade-up-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-brand-dark text-lg">📅 Próximos serviços</h2>
              <p className="text-xs text-brand-muted mt-0.5">{proximos.length} agendado{proximos.length !== 1 ? "s" : ""}</p>
            </div>
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

      {/* Chamados disponíveis */}
      <div className="fade-up fade-up-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-brand-dark text-lg">🔔 Chamados disponíveis</h2>
            <p className="text-xs text-brand-muted mt-0.5">Na sua região</p>
          </div>
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
                    <span className="text-brand-green font-semibold">
                      💰 {fmt((c.price_estimate ?? 0) * 0.75)} repasse
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

      {/* Banner: completar perfil */}
      {!hasLocation && (
        <div className="fade-up bg-brand-light border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-dark">Complete seu perfil</p>
            <p className="text-xs text-brand-muted mt-0.5">Informe seu CEP para aparecer no mapa de cobertura</p>
          </div>
          <a href="/tecnico/perfil" className="text-sm font-medium text-brand-dark underline whitespace-nowrap">
            Adicionar CEP →
          </a>
        </div>
      )}

      {/* Ranking + Meta */}
      <div className="fade-up fade-up-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-brand-dark rounded-2xl p-5 relative overflow-hidden" style={{ minHeight: 180 }}>
          <BannerParticles />
          <div className="relative space-y-4" style={{ zIndex: 2 }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-heading font-bold text-white text-sm">Seu ranking</p>
                  <p className="text-white/50 text-xs">{techCity ?? "—"}, SC</p>
                </div>
              </div>
              <span className="font-heading font-extrabold text-brand-green text-3xl">#—</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-xs text-white/60 leading-relaxed">
              Ranking calculado com dados históricos — disponível em breve.
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-heading font-bold text-brand-dark text-sm">Meta mensal · {mesCapitalized}</p>
              <p className="text-brand-muted text-xs">{servicosMes} de 15 serviços</p>
            </div>
          </div>
          <div>
            <p className="font-heading font-extrabold text-brand-dark text-3xl leading-tight">
              {servicosMes}
              <span className="text-brand-muted text-base font-normal ml-1">chamados</span>
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
                className="h-full bg-brand-green rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((servicosMes / 15) * 100))}%` }}
              />
            </div>
          </div>
          <div className="bg-brand-light rounded-xl px-3 py-2.5">
            <p className="text-xs font-medium text-brand-dark">
              💡 Faltam <strong>{Math.max(15 - servicosMes, 0)} chamados</strong> pra bater a meta esse mês.
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de ganhos */}
      <GanhosChart />

      {/* Desempenho — mock, marcado como estimativa */}
      <div className="fade-up fade-up-5 card opacity-70">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-brand-dark text-lg">🎯 Desempenho</h2>
            <p className="text-xs text-brand-muted mt-0.5">Disponível quando houver histórico real</p>
          </div>
          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-bg text-brand-muted border border-brand-border">
            estimativa
          </span>
        </div>
        <div className="space-y-4">
          {performance.map(({ label, pct, meta }) => {
            const aboveMeta = pct >= meta;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-brand-muted">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-muted">{pct}%</span>
                    <span className="text-[10px] text-brand-muted">meta {meta}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-brand-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-border transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-brand-muted mt-4">* Dados ilustrativos — calculados automaticamente quando houver histórico.</p>
      </div>

      {/* Últimos serviços */}
      <div className="fade-up fade-up-5 card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-brand-dark text-lg">🕘 Últimos serviços</h2>
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
                    {["Data", "Cidade", "Módulos", "Recebido", "Nota"].map((h, i) => (
                      <th key={h} className={`text-xs font-bold uppercase tracking-widest text-brand-muted pb-3 ${i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, i) => (
                    <tr key={i} className="border-b border-brand-border/50 last:border-0">
                      <td className="py-3 text-brand-dark font-medium">{h.data}</td>
                      <td className="py-3 text-brand-dark">{h.cidade}</td>
                      <td className="py-3 text-right text-brand-muted">{h.modulos}</td>
                      <td className="py-3 text-right font-heading font-bold text-brand-green">{fmt(h.recebido)}</td>
                      <td className="py-3 text-right text-brand-muted">—</td>
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
