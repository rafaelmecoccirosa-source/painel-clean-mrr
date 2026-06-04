"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ServiceRequestDB, PaymentStatus } from "@/lib/types";

const SLA_MINUTOS = 15; // SLA de confirmação em minutos

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function minutesSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function SlaTimer({ reportedAt }: { reportedAt: string | null | undefined }) {
  if (!reportedAt) return null;
  const mins = minutesSince(reportedAt);
  if (mins === null) return null;
  const slaEstourado = mins > SLA_MINUTOS;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
      slaEstourado
        ? "bg-red-50 border border-red-300 text-red-700"
        : "bg-amber-50 border border-amber-200 text-amber-700"
    }`}>
      <span>{slaEstourado ? "🚨" : "⏳"}</span>
      <span>
        {slaEstourado
          ? `SLA estourado — ${mins}min aguardando confirmação (SLA: ${SLA_MINUTOS}min)`
          : `Cliente reportou há ${mins}min — confirmar em até ${SLA_MINUTOS - mins}min`}
      </span>
    </div>
  );
}

// ── Mock data (fallback when table/columns don't exist) ───────────────────────

const MOCK_PAYMENTS: ServiceRequestDB[] = [
  {
    id:             "pay-demo-0001-0000-0000-000000000001",
    client_id:      "cli-1",
    technician_id:  "tec-1",
    city:           "Jaraguá do Sul",
    address:        "Rua das Palmeiras, 420",
    module_count:   20,
    price_estimate: 300,
    preferred_date: "2026-03-28",
    preferred_time: "Manhã (8h-12h)",
    status:         "completed",
    notes:          null,
    created_at:     "2026-03-26T09:00:00Z",
    updated_at:     "2026-03-28T12:00:00Z",
    accepted_at:    "2026-03-27T10:00:00Z",
    completed_at:   "2026-03-28T11:45:00Z",
    cancelled_at:   null,
    cancellation_reason: null,
    payment_status: "awaiting_confirmation",
    payment_method: "pix",
    paid_at:        "2026-03-28T13:30:00Z",
  },
  {
    id:             "pay-demo-0002-0000-0000-000000000002",
    client_id:      "cli-2",
    technician_id:  "tec-2",
    city:           "Pomerode",
    address:        "Av. Hermann Weege, 55",
    module_count:   12,
    price_estimate: 300,
    preferred_date: "2026-03-25",
    preferred_time: "Tarde (13h-17h)",
    status:         "completed",
    notes:          null,
    created_at:     "2026-03-23T08:00:00Z",
    updated_at:     "2026-03-25T16:00:00Z",
    accepted_at:    "2026-03-24T09:00:00Z",
    completed_at:   "2026-03-25T15:30:00Z",
    cancelled_at:   null,
    cancellation_reason: null,
    payment_status: "confirmed",
    payment_method: "pix",
    paid_at:        "2026-03-25T17:00:00Z",
  },
  {
    id:             "pay-demo-0003-0000-0000-000000000003",
    client_id:      "cli-3",
    technician_id:  "tec-1",
    city:           "Florianópolis",
    address:        "Rua do Sol, 77",
    module_count:   8,
    price_estimate: 180,
    preferred_date: "2026-03-20",
    preferred_time: "Manhã (8h-12h)",
    status:         "completed",
    notes:          null,
    created_at:     "2026-03-18T10:00:00Z",
    updated_at:     "2026-03-20T12:00:00Z",
    accepted_at:    "2026-03-19T08:00:00Z",
    completed_at:   "2026-03-20T11:00:00Z",
    cancelled_at:   null,
    cancellation_reason: null,
    payment_status: "released",
    payment_method: "pix",
    paid_at:        "2026-03-20T14:00:00Z",
    released_at:    "2026-03-21T09:00:00Z",
  },
];

type Tab = "awaiting" | "confirmed" | "all";

function PaymentStatusBadge({ status }: { status: PaymentStatus | undefined }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:               { label: "💰 Aguardando",   cls: "bg-gray-100 text-gray-600"    },
    awaiting_confirmation: { label: "⏳ Em análise",   cls: "bg-amber-100 text-amber-700"  },
    confirmed:             { label: "✅ Confirmado",   cls: "bg-emerald-100 text-emerald-700" },
    released:              { label: "💸 Repasse feito", cls: "bg-brand-light text-brand-dark" },
  };
  const s = map[status ?? "pending"] ?? map["pending"];
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function PagamentosAdminPage() {
  const [services, setServices] = useState<ServiceRequestDB[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [isReal,   setIsReal]   = useState(false);
  const [tab, setTab]           = useState<Tab>("awaiting");
  const [busy, setBusy]         = useState<string | null>(null); // serviceId being processed
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setServices(MOCK_PAYMENTS); setLoading(false); return; }

      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .in("payment_status", ["awaiting_confirmation", "confirmed", "released"])
        .order("payment_reported_at", { ascending: true, nullsFirst: false });

      if (error || !data || data.length === 0) {
        setServices(MOCK_PAYMENTS);
      } else {
        setServices(data as ServiceRequestDB[]);
        setIsReal(true);
      }
    } catch {
      setServices(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleConfirm(id: string) {
    setBusy(id);
    try {
      const supabase = createClient();
      await supabase
        .from("service_requests")
        .update({ payment_status: "confirmed" })
        .eq("id", id);

      setServices((prev) => prev.map((s) =>
        s.id === id ? { ...s, payment_status: "confirmed" as PaymentStatus } : s
      ));
      showToast("✅ Pagamento confirmado! O técnico será notificado.");
    } catch {
      showToast("Erro ao confirmar. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(id: string) {
    setBusy(id);
    try {
      const supabase = createClient();
      await supabase
        .from("service_requests")
        .update({ payment_status: "pending", paid_at: null })
        .eq("id", id);

      setServices((prev) => prev.map((s) =>
        s.id === id ? { ...s, payment_status: "pending" as PaymentStatus, paid_at: null } : s
      ));
      showToast("❌ Pagamento rejeitado. O cliente será notificado para refazer o PIX.");
    } catch {
      showToast("Erro ao rejeitar. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRelease(id: string) {
    setBusy(id);
    try {
      const supabase = createClient();
      await supabase
        .from("service_requests")
        .update({ payment_status: "released", released_at: new Date().toISOString() })
        .eq("id", id);

      setServices((prev) => prev.map((s) =>
        s.id === id ? { ...s, payment_status: "released" as PaymentStatus, released_at: new Date().toISOString() } : s
      ));
      showToast("💸 Repasse marcado como realizado!");
    } catch {
      showToast("Erro ao marcar repasse. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  const awaiting  = services.filter((s) => s.payment_status === "awaiting_confirmation");
  const confirmed = services.filter((s) => s.payment_status === "confirmed");
  const allDone   = services;

  const shown: Record<Tab, ServiceRequestDB[]> = { awaiting, confirmed, all: allDone };

  const tabs: { key: Tab; label: string; count: number; dot?: boolean }[] = [
    { key: "awaiting",  label: "Aguardando confirmação", count: awaiting.length,  dot: awaiting.length > 0 },
    { key: "confirmed", label: "Confirmados",            count: confirmed.length                           },
    { key: "all",       label: "Todos",                  count: allDone.length                             },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-brand-dark text-white text-sm font-semibold rounded-2xl px-5 py-3 shadow-xl max-w-sm">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-brand-muted hover:text-brand-dark transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-dark">💰 Pagamentos</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Confirme pagamentos PIX e libere repasses aos técnicos
          </p>
        </div>
      </div>

      {/* Urgency notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
        <span className="text-amber-500 text-lg">⚠️</span>
        <p className="text-sm font-medium text-amber-800">
          <strong>Confirme pagamentos rapidamente</strong> — o agendamento do cliente só é ativado após a confirmação. Técnicos também ficam aguardando.
        </p>
      </div>

      {!isReal && !loading && (
        <div className="flex justify-end">
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            📊 Dados demonstrativos
          </span>
        </div>
      )}

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { emoji: "⏳", label: "Aguardando",   value: String(awaiting.length),  cls: "text-amber-600"   },
            { emoji: "✅", label: "Confirmados",  value: String(confirmed.length), cls: "text-emerald-600" },
            { emoji: "💸", label: "Repasses",     value: String(services.filter(s => s.payment_status === "released").length), cls: "text-brand-green" },
            { emoji: "💰", label: "Total PIX",    value: fmt(confirmed.reduce((a, s) => a + s.price_estimate, 0)), cls: "text-brand-dark" },
          ].map(({ emoji, label, value, cls }) => (
            <div key={label} className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm">
              <span className="text-2xl">{emoji}</span>
              <p className={`font-heading font-bold text-xl mt-2 ${cls}`}>{value}</p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
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
            {t.dot && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white" />
            )}
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-brand-bg"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white border border-brand-border rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-brand-bg rounded-full w-1/3" />
              <div className="h-3 bg-brand-bg rounded-full w-2/3" />
              <div className="h-3 bg-brand-bg rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : shown[tab].length === 0 ? (
        <div className="card text-center py-14">
          <p className="text-3xl mb-3">💸</p>
          <p className="text-brand-muted text-sm">
            {tab === "awaiting" ? "Nenhum pagamento aguardando confirmação." : "Nenhum registro encontrado."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown[tab].map((s) => (
            <PaymentRow
              key={s.id}
              service={s}
              busy={busy === s.id}
              onConfirm={() => handleConfirm(s.id)}
              onReject={() => handleReject(s.id)}
              onRelease={() => handleRelease(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Payment Row Card ──────────────────────────────────────────────────────────

function PaymentRow({
  service: s,
  busy,
  onConfirm,
  onReject,
  onRelease,
}: {
  service: ServiceRequestDB;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onRelease: () => void;
}) {
  const repasse = s.price_estimate * 0.75;
  const comissao = s.price_estimate * 0.25;

  function fmt(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
      {/* Top info */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-brand-muted font-mono mb-1">#{s.id.slice(0, 8).toUpperCase()}</p>
            <p className="font-semibold text-brand-dark">{s.city} — {s.module_count ?? "?"} módulos</p>
            <p className="text-xs text-brand-muted mt-0.5">{s.address}</p>
          </div>
          <PaymentStatusBadge status={s.payment_status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-brand-bg rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-brand-muted uppercase tracking-wide">Valor total</p>
            <p className="font-bold text-brand-dark text-sm mt-0.5">{fmt(s.price_estimate)}</p>
          </div>
          <div className="bg-brand-bg rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-brand-muted uppercase tracking-wide">Repasse técnico</p>
            <p className="font-bold text-brand-green text-sm mt-0.5">{fmt(repasse)}</p>
          </div>
          <div className="bg-brand-bg rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-brand-muted uppercase tracking-wide">Comissão</p>
            <p className="font-bold text-brand-dark text-sm mt-0.5">{fmt(comissao)}</p>
          </div>
          <div className="bg-brand-bg rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-brand-muted uppercase tracking-wide">
              {s.payment_status === "awaiting_confirmation" ? "Informado em" : "Concluído em"}
            </p>
            <p className="font-medium text-brand-dark text-xs mt-0.5">
              {s.paid_at ? fmtDateTime(s.paid_at) : (s.completed_at ? fmtDateTime(s.completed_at) : "—")}
            </p>
          </div>
        </div>

        {/* SLA timer */}
        {s.payment_status === "awaiting_confirmation" && (
          <SlaTimer reportedAt={s.payment_reported_at} />
        )}

        {/* Proof link */}
        {s.payment_proof_url && (
          <a
            href={s.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:underline"
          >
            <ExternalLink size={12} />
            Ver comprovante
          </a>
        )}
      </div>

      {/* Action buttons */}
      {s.payment_status === "awaiting_confirmation" && (
        <div className="px-5 pb-5 flex gap-3 flex-wrap">
          <button
            onClick={onReject}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            <XCircle size={15} />
            {busy ? "Aguarde…" : "❌ Rejeitar (pedir novo PIX)"}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-brand-green text-white hover:bg-brand-green/90 rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={15} />
            {busy ? "Confirmando…" : "✅ Confirmar pagamento"}
          </button>
        </div>
      )}

      {s.payment_status === "confirmed" && (
        <div className="px-5 pb-5">
          <button
            onClick={onRelease}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-brand-dark text-white hover:bg-brand-dark/90 rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            <Banknote size={15} />
            {busy ? "Processando…" : "💸 Marcar repasse como realizado"}
          </button>
        </div>
      )}

      {s.payment_status === "released" && s.released_at && (
        <div className="px-5 pb-4">
          <p className="text-xs text-brand-muted flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-brand-green" />
            Repasse liberado em {fmtDateTime(s.released_at)}
          </p>
        </div>
      )}
    </div>
  );
}
