"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Sun, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type ServiceRequestDB, type ServiceRequestStatus, type PaymentStatus, STATUS_BADGE, estimateHours } from "@/lib/types";
import ServiceProgressBar from "@/components/shared/ServiceProgressBar";
import { countUnreadMessages } from "@/components/shared/ChatBox";

type Tab = "available" | "mine" | "done";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function fmtDateShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return { day, month: monthNames[d.getMonth()] };
}

function isToday(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function StatusBadge({ status }: { status: ServiceRequestStatus }) {
  const labels: Record<string, string> = {
    pending:     "Disponível",
    accepted:    "Aceito",
    in_progress: "Em andamento",
    completed:   "Concluído",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[status]}`}>
      {labels[status] ?? status}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-brand-border rounded-2xl p-5 animate-pulse space-y-3">
          <div className="h-4 bg-brand-bg rounded-full w-1/3" />
          <div className="h-3 bg-brand-bg rounded-full w-2/3" />
          <div className="h-3 bg-brand-bg rounded-full w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function ChamadosPage() {
  const [tab, setTab]             = useState<Tab>("available");
  const [available, setAvailable] = useState<ServiceRequestDB[]>([]);
  const [mine, setMine]           = useState<ServiceRequestDB[]>([]);
  const [done, setDone]           = useState<ServiceRequestDB[]>([]);
  const [loading, setLoading]     = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      let techCity: string | null = null;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("city")
          .eq("user_id", user.id)
          .maybeSingle();
        techCity = profileData?.city?.trim() || null;
      } catch { /* RLS recursion — try metadata */ }
      if (!techCity) {
        const metaCity = (user.user_metadata?.city as string | undefined)?.trim();
        techCity = metaCity || null;
      }

      let availQuery = supabase
        .from("service_requests")
        .select("*")
        .eq("status", "pending")
        .is("technician_id", null)
        .order("preferred_date", { ascending: true });
      if (techCity) availQuery = availQuery.eq("city", techCity);

      const [availRes, mineRes, doneRes] = await Promise.all([
        availQuery,
        supabase
          .from("service_requests")
          .select("*")
          .eq("technician_id", user.id)
          .in("status", ["accepted", "in_progress"])
          .order("preferred_date", { ascending: true }),
        supabase
          .from("service_requests")
          .select("*")
          .eq("technician_id", user.id)
          .eq("status", "completed")
          .order("preferred_date", { ascending: false })
          .limit(20),
      ]);

      const mineData  = (mineRes.data  as ServiceRequestDB[]) ?? [];
      const doneData  = (doneRes.data  as ServiceRequestDB[]) ?? [];
      setAvailable((availRes.data as ServiceRequestDB[]) ?? []);
      setMine(mineData);
      setDone(doneData);

      const allMineIds = [...mineData, ...doneData].map((s) => s.id);
      const unread = await countUnreadMessages(allMineIds, user.id);
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabs: { key: Tab; label: string; emoji: string; count: number; unread?: boolean }[] = [
    { key: "available", label: "Disponíveis", emoji: "🔔", count: available.length },
    { key: "mine",      label: "Meus",        emoji: "📋", count: mine.length, unread: unreadCount > 0 },
    { key: "done",      label: "Concluídos",  emoji: "✅", count: done.length },
  ];

  function renderPaymentBadge(payStatus: PaymentStatus | undefined) {
    const map: Record<string, { label: string; cls: string }> = {
      pending:               { label: "💰 Aguardando pagamento",        cls: "bg-amber-100 text-amber-700" },
      awaiting_confirmation: { label: "⏳ Aguardando confirmação",      cls: "bg-amber-100 text-amber-700" },
      confirmed:             { label: "✅ Pagamento confirmado",        cls: "bg-emerald-100 text-emerald-700" },
      released:              { label: "💸 Repasse realizado!",          cls: "bg-brand-light text-brand-dark" },
    };
    const s = map[payStatus ?? "pending"] ?? map["pending"];
    return (
      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
        {s.label}
      </span>
    );
  }

  function renderAvailableCard(c: ServiceRequestDB) {
    const repasse = (c.module_count ?? 0) * 13;
    const horas = estimateHours(c.module_count ?? 0);
    const shortAddress = c.address.split(",")[0] + " (endereço completo após aceitar)";

    return (
      <Link key={c.id} href={`/tecnico/chamados/${c.id}`}
        className="card hover:shadow-card-hover transition-shadow group flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Disponível
              </span>
              <span className="text-xs font-mono text-brand-muted">#{c.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {shortAddress} — {c.city}</span>
              <span className="flex items-center gap-1.5"><Sun size={13} /> {c.module_count ?? "?"} módulos</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {fmtDate(c.preferred_date)}, {c.preferred_time}</span>
              <span className="flex items-center gap-1.5 text-brand-muted">~{horas}h estimadas</span>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Repasse</p>
              <p className="font-heading font-bold text-brand-green text-xl">{fmt(repasse)}</p>
              <p className="text-xs text-brand-muted">~{horas}h estimadas</p>
            </div>
            <ArrowRight size={18} className="text-brand-muted group-hover:text-brand-green transition-colors" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {c.payment_status === "confirmed" ? (
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              💰 Pagamento confirmado
            </span>
          ) : (
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              ⏳ Aguardando pagamento
            </span>
          )}
        </div>
      </Link>
    );
  }

  function renderMineCard(c: ServiceRequestDB) {
    const repasse = (c.module_count ?? 0) * 13;
    const today = isToday(c.preferred_date);
    const { day, month } = fmtDateShort(c.preferred_date);

    return (
      <Link key={c.id} href={`/tecnico/chamados/${c.id}`}
        className="card hover:shadow-card-hover transition-shadow group"
        style={{ borderColor: today ? "#3DC45A" : undefined, borderWidth: today ? 1.5 : undefined }}>
        <div className="flex gap-4 items-start">
          {/* Date block */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-heading font-extrabold leading-tight"
            style={{
              background: today ? "linear-gradient(135deg, #3DC45A, #2DAF4A)" : "#EBF3E8",
              color: today ? "white" : "#1B3A2D",
            }}>
            {today ? (
              <><span className="text-[9px] font-bold uppercase tracking-wide opacity-80">Hoje</span><span className="text-xl">–</span></>
            ) : (
              <><span className="text-xl">{day}</span><span className="text-[10px] uppercase opacity-70">{month}</span></>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={c.status} />
              <span className="text-xs font-mono text-brand-muted">#{c.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {c.address} — {c.city}</span>
              <span className="flex items-center gap-1.5"><Sun size={13} /> {c.module_count ?? "?"} módulos</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {c.preferred_time}</span>
            </div>
            <ServiceProgressBar status={c.status} paymentStatus={c.payment_status ?? "pending"} role="tecnico" />
          </div>

          {/* Repasse */}
          <div className="flex-shrink-0 text-right space-y-1">
            <p className="font-heading font-bold text-brand-green text-lg">{fmt(repasse)}</p>
            <p className="text-[10px] text-brand-muted">R$ 13/módulo</p>
            <ArrowRight size={16} className="text-brand-muted group-hover:text-brand-green transition-colors ml-auto" />
          </div>
        </div>
      </Link>
    );
  }

  function renderDoneCard(c: ServiceRequestDB) {
    const repasse = (c.module_count ?? 0) * 13;

    return (
      <Link key={c.id} href={`/tecnico/chamados/${c.id}`}
        className="flex items-center justify-between px-5 py-4 gap-4 border-b border-brand-border last:border-0 hover:bg-brand-bg transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="text-brand-green" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-dark">{c.city ?? "—"}</p>
            <p className="text-xs text-brand-muted mt-0.5">
              {fmtDate(c.preferred_date)} · {c.module_count ?? 0} módulos · #{c.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {renderPaymentBadge(c.payment_status)}
          <div className="text-right">
            <p className="font-heading font-bold text-brand-green text-base">{fmt(repasse)}</p>
            <p className="text-[10px] text-brand-muted">{c.module_count ?? 0} módulos × R$ 13</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="fade-up">
        <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Gerenciar chamados</p>
        <h1 className="font-heading text-3xl font-extrabold text-brand-dark">Chamados</h1>
        <p className="text-brand-muted text-sm mt-1">
          Veja chamados disponíveis na sua região, gerencie os aceitos e revise o histórico.
        </p>
      </div>

      <div className="fade-up fade-up-1 flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-brand-dark text-white"
                : "bg-white border border-brand-border text-brand-muted hover:text-brand-dark"
            }`}
          >
            <span>{t.emoji}</span> {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-brand-bg"}`}>
              {t.count}
            </span>
            {t.unread && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton />
      ) : tab === "available" ? (
        available.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-3">🔔</p>
            <p className="font-heading font-bold text-brand-dark text-sm">Nenhum chamado disponível no momento</p>
            <p className="text-xs text-brand-muted mt-2">Fique online — a gente avisa quando aparecer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {available.map((c) => renderAvailableCard(c))}
          </div>
        )
      ) : tab === "mine" ? (
        mine.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-3">📋</p>
            <p className="font-heading font-bold text-brand-dark text-sm">Nenhum chamado em andamento</p>
            <p className="text-xs text-brand-muted mt-2">Aceite chamados disponíveis para eles aparecerem aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mine.map((c) => renderMineCard(c))}
          </div>
        )
      ) : (
        done.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-3">✅</p>
            <p className="font-heading font-bold text-brand-dark text-sm">Nenhum chamado concluído ainda</p>
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            {done.map((c) => renderDoneCard(c))}
          </div>
        )
      )}
    </div>
  );
}
