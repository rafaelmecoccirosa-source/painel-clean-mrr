"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Sun, Clock, ArrowRight } from "lucide-react";
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
  const [tab, setTab]           = useState<Tab>("available");
  const [available, setAvailable] = useState<ServiceRequestDB[]>([]);
  const [mine, setMine]         = useState<ServiceRequestDB[]>([]);
  const [done, setDone]         = useState<ServiceRequestDB[]>([]);
  const [loading, setLoading]   = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [missingCity, setMissingCity] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch tech city first so available chamados are filtered
      const { data: profileData } = await supabase
        .from("profiles")
        .select("city")
        .eq("user_id", user.id)
        .maybeSingle();
      const techCity = profileData?.city?.trim() || null;
      setMissingCity(!techCity);

      const availPromise = techCity
        ? supabase
            .from("service_requests")
            .select("*")
            .eq("status", "pending")
            .is("technician_id", null)
            .eq("city", techCity)
            .order("preferred_date", { ascending: true })
        : Promise.resolve({ data: [] as ServiceRequestDB[] });

      const [availRes, mineRes, doneRes] = await Promise.all([
        availPromise,
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

      const mineData = (mineRes.data as ServiceRequestDB[]) ?? [];
      const doneData = (doneRes.data as ServiceRequestDB[]) ?? [];
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
    { key: "done",      label: "Concluídos",  emoji: "✅", count: done.length      },
  ];

  const shown: Record<Tab, ServiceRequestDB[]> = { available, mine, done };

  function renderPaymentBadge(payStatus: PaymentStatus | undefined) {
    const map: Record<string, { label: string; cls: string }> = {
      pending:               { label: "💰 Aguardando pagamento do cliente",      cls: "bg-gray-100 text-gray-600"       },
      awaiting_confirmation: { label: "⏳ Cliente pagou, aguardando confirmação", cls: "bg-amber-100 text-amber-700"     },
      confirmed:             { label: "✅ Pagamento confirmado — repasse em breve", cls: "bg-emerald-100 text-emerald-700" },
      released:              { label: "💸 Repasse realizado!",                    cls: "bg-brand-light text-brand-dark"  },
    };
    const s = map[payStatus ?? "pending"] ?? map["pending"];
    return (
      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
        {s.label}
      </span>
    );
  }

  function renderCard(c: ServiceRequestDB, isAvailable: boolean) {
    const repasse = c.price_estimate * 0.75;
    const horas = estimateHours(c.module_count ?? 0);
    const displayAddress = isAvailable
      ? c.address.split(",")[0] + " (endereço completo após aceitar)"
      : c.address;
    const isDone = c.status === "completed";

    return (
      <Link
        key={c.id}
        href={`/tecnico/chamados/${c.id}`}
        className="card hover:shadow-card-hover transition-shadow flex flex-col gap-3 group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={c.status} />
              <span className="text-xs font-mono text-brand-muted">#{c.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {displayAddress} — {c.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Sun size={13} /> {c.module_count ?? "?"} módulos
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {fmtDate(c.preferred_date)}, {c.preferred_time}
              </span>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-brand-muted">Repasse</p>
              <p className="font-heading font-bold text-brand-dark text-lg">{fmt(repasse)}</p>
              <p className="text-xs text-brand-muted">~{horas}h estimadas</p>
            </div>
            <ArrowRight size={18} className="text-brand-muted group-hover:text-brand-green transition-colors" />
          </div>
        </div>

        {/* Badges row for available chamados */}
        {isAvailable && (
          <div className="flex items-center gap-2 flex-wrap">
            {c.payment_status === "confirmed" && (
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                💰 Pagamento confirmado
              </span>
            )}
            {(!c.payment_status || c.payment_status === "pending") && (
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                ⏳ Aguardando pagamento
              </span>
            )}
            {c.latitude != null && c.longitude != null && (
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                📍 Localização no mapa
              </span>
            )}
          </div>
        )}

        {/* Progress bar for all non-pending statuses */}
        {!isAvailable && (
          <ServiceProgressBar status={c.status} paymentStatus={c.payment_status ?? "pending"} role="tecnico" />
        )}

        {/* Payment status badge for completed chamados */}
        {isDone && renderPaymentBadge(c.payment_status)}

        {/* Repasse detail when confirmed */}
        {isDone && c.payment_status === "confirmed" && (
          <p className="text-xs text-brand-muted">
            O repasse de <strong className="text-brand-green">{fmt(repasse)}</strong> será feito via PIX em até 48h
          </p>
        )}
      </Link>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Chamados</h1>
        <p className="text-brand-muted text-sm mt-1">Gerencie seus chamados disponíveis e em andamento</p>
      </div>

      <div className="flex gap-2 flex-wrap">
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
      ) : tab === "available" && missingCity ? (
        <div className="card text-center py-12 space-y-3">
          <p className="text-2xl">📍</p>
          <p className="text-brand-muted text-sm max-w-md mx-auto">
            Complete seu perfil com a cidade de atuação para ver chamados disponíveis.
          </p>
          <Link
            href="/tecnico/perfil"
            className="inline-block bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark-hover transition-colors"
          >
            Completar perfil →
          </Link>
        </div>
      ) : shown[tab].length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-2xl mb-3">
            {tab === "available" ? "🔔" : tab === "mine" ? "📋" : "✅"}
          </p>
          <p className="text-brand-muted text-sm">
            {tab === "available"
              ? "Nenhum chamado disponível no momento."
              : tab === "mine"
              ? "Você não tem chamados em andamento."
              : "Nenhum chamado concluído ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown[tab].map((c) => renderCard(c, tab === "available"))}
        </div>
      )}
    </div>
  );
}
