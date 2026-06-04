"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  MapPin, Calendar, Clock, Sun, AlertTriangle,
  ArrowRight, Play, CheckCircle2, Info,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Toast, { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { ServiceRequestDB, ServiceReport, Review } from "@/lib/types";
import ChatBox, { insertSystemMessage } from "@/components/shared/ChatBox";
import { REPASSE_MINIMO_TECNICO } from "@/lib/pricing";

const CHECKLIST_LABELS: Record<string, string> = {
  visual_inspection: "Verificação visual das placas",
  connector_check:   "Verificação de conectores",
  cleaning_complete: "Limpeza com escova profissional",
  damage_test:       "Verificação de conexões",
  post_generation:   "Teste de geração pós-limpeza",
};

// Leaflet map (no SSR)
const MapViewLeaflet = dynamic(
  () => import("@/components/shared/MapViewLeaflet"),
  { ssr: false, loading: () => <div className="w-full h-full bg-brand-bg animate-pulse rounded-xl" /> }
);

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function tempoByModulos(n: number): number {
  if (n <= 10) return 1.5;
  if (n <= 30) return 2.5;
  if (n <= 60) return 3.5;
  return 5;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card space-y-4">
        <div className="h-5 bg-brand-bg rounded-full w-1/3" />
        <div className="h-4 bg-brand-bg rounded-full w-2/3" />
        <div className="h-4 bg-brand-bg rounded-full w-1/2" />
      </div>
      <div className="bg-brand-dark rounded-2xl p-6 space-y-4">
        <div className="h-5 bg-white/10 rounded-full w-1/3" />
        <div className="h-4 bg-white/10 rounded-full w-full" />
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
      </div>
    </div>
  );
}

// ── Location section (map + navigation links) ─────────────────────────────────

function LocationSection({ service }: { service: ServiceRequestDB }) {
  const hasPin = service.latitude != null && service.longitude != null;
  const lat = service.latitude as number;
  const lng = service.longitude as number;

  const gmapsUrl = hasPin
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.address + ", " + service.city)}`;

  const wazeUrl = hasPin
    ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    : null;

  return (
    <div className="space-y-3">
      {/* Map (only when lat/lng available) */}
      {hasPin && (
        <div
          className="w-full rounded-xl overflow-hidden border border-brand-border"
          style={{ height: "220px" }}
        >
          <MapViewLeaflet lat={lat} lng={lng} zoom={14} />
        </div>
      )}

      {/* Address + description */}
      {service.location_description && (
        <div className="bg-brand-bg rounded-xl px-4 py-3 text-sm text-brand-muted">
          <span className="font-semibold text-brand-dark">📍 Referência: </span>
          {service.location_description}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          🗺️ Google Maps
        </a>
        {wazeUrl && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            📍 Abrir no Waze
          </a>
        )}
        {!wazeUrl && (
          <div className="flex items-center justify-center gap-1.5 bg-brand-bg text-brand-muted text-xs font-semibold py-2.5 rounded-xl border border-brand-border">
            📍 Endereço textual
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers for new fields ────────────────────────────────────────────────────

function tipoLabel(t: string | null | undefined) {
  switch (t) {
    case "solo":            return "☀️ Solo";
    case "telhado_padrao":  return "🏠 Telhado padrão";
    case "telhado_dificil": return "🏗️ Telhado difícil";
    default:                return "—";
  }
}

function sujeiraLabel(s: string | null | undefined) {
  return s === "pesada" ? "🟠 Pesada" : "🟢 Normal";
}

function acessoLabel(a: string | null | undefined) {
  return a === "dificil" ? "🟠 Difícil" : "🟢 Normal";
}

// ── Service details grid (new fields) ─────────────────────────────────────────

function ServiceDetailsGrid({ service }: { service: ServiceRequestDB }) {
  const hasDetails =
    service.tipo_instalacao || service.nivel_sujeira || service.nivel_acesso;
  if (!hasDetails) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {service.tipo_instalacao && (
        <div className="bg-brand-bg rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-brand-muted mb-0.5">Tipo de instalação</p>
          <p className="text-sm font-medium text-brand-dark">{tipoLabel(service.tipo_instalacao)}</p>
        </div>
      )}
      {service.nivel_sujeira && (
        <div className="bg-brand-bg rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-brand-muted mb-0.5">Nível de sujeira</p>
          <p className="text-sm font-medium text-brand-dark">{sujeiraLabel(service.nivel_sujeira)}</p>
        </div>
      )}
      {service.nivel_acesso && (
        <div className="bg-brand-bg rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-brand-muted mb-0.5">Acesso ao local</p>
          <p className="text-sm font-medium text-brand-dark">{acessoLabel(service.nivel_acesso)}</p>
        </div>
      )}
      {(service.distancia_km != null && service.distancia_km > 0) && (
        <div className="bg-brand-bg rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-brand-muted mb-0.5">Distância estimada</p>
          <p className="text-sm font-medium text-brand-dark">📏 {service.distancia_km} km</p>
        </div>
      )}
    </div>
  );
}

// ── Service info card (for accepted / in_progress) ────────────────────────────

function ServiceInfoCard({ service }: { service: ServiceRequestDB }) {
  const tempo = tempoByModulos(service.module_count);
  const repasse = service.price_estimate * 0.75;

  const statusLabel: Record<string, string> = {
    accepted:    "🔵 Técnico confirmado",
    in_progress: "🟠 Em andamento",
    completed:   "🟢 Concluído",
  };

  const statusBg: Record<string, string> = {
    accepted:    "bg-blue-100 text-blue-700",
    in_progress: "bg-orange-100 text-orange-700",
    completed:   "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-brand-muted mb-1">
            Serviço #{service.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="font-heading font-bold text-brand-dark text-lg">{service.city}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${statusBg[service.status] ?? "bg-brand-bg text-brand-dark"}`}>
          {statusLabel[service.status] ?? service.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="flex items-start gap-2.5">
          <MapPin size={16} className="text-brand-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-brand-dark">{service.address}</p>
            <p className="text-xs text-brand-muted">{service.city}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Calendar size={16} className="text-brand-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-brand-dark">{fmtDate(service.preferred_date)}</p>
            <p className="text-xs text-brand-muted">{service.preferred_time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Sun size={16} className="text-brand-muted flex-shrink-0" />
          <p className="text-sm text-brand-dark">
            <span className="font-semibold">{service.module_count}</span> placas
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-brand-muted flex-shrink-0" />
          <p className="text-sm text-brand-dark">
            ~<span className="font-semibold">{tempo}h</span> estimadas
          </p>
        </div>
      </div>

      {/* New service conditions */}
      <ServiceDetailsGrid service={service} />

      {service.notes && (
        <div className="bg-brand-bg rounded-xl px-4 py-3 text-sm text-brand-muted">
          <span className="font-semibold text-brand-dark">Obs: </span>
          {service.notes}
        </div>
      )}

      {/* Map / Navigation */}
      <LocationSection service={service} />

      {/* Repasse highlight */}
      <div className="bg-brand-dark rounded-xl px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 mb-0.5">Seu repasse (75%)</p>
            <p className="font-heading font-extrabold text-2xl text-brand-green">{fmt(repasse)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50 mb-0.5">Valor total</p>
            <p className="text-white font-semibold">{fmt(service.price_estimate)}</p>
          </div>
        </div>
        {repasse < REPASSE_MINIMO_TECNICO * 1.2 && (
          <p className="text-xs text-brand-green/70">
            💰 Ganho mínimo garantido: R$ {REPASSE_MINIMO_TECNICO.toFixed(0)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Calculator (only shown for pending chamados) ───────────────────────────────

function Calculator({
  valorServico,
  modulos,
  distanciaKm,
}: {
  valorServico: number;
  modulos: number;
  distanciaKm: number;
}) {
  const repasse  = valorServico * 0.75;
  const comissao = valorServico * 0.25;
  const tempo    = tempoByModulos(modulos);

  const [distancia, setDistancia]       = useState(distanciaKm);
  const [consumo, setConsumo]           = useState(10);
  const [precoComb, setPrecoComb]       = useState(6.0);
  const [pracas, setPracas]             = useState(0);
  const [valorPraca, setValorPraca]     = useState(8.0);

  const custoCombustivel = ((distancia * 2) / consumo) * precoComb;
  const custoPedagio     = pracas * valorPraca * 2;
  const totalCustos      = custoCombustivel + custoPedagio;
  const lucroLiquido     = repasse - totalCustos;
  const margem           = (lucroLiquido / (valorServico || 1)) * 100;

  const margemColor      = margem >= 30 ? "text-brand-green" : margem >= 10 ? "text-yellow-400" : "text-red-400";
  const margemRingColor  = margem >= 30 ? "ring-brand-green/40" : margem >= 10 ? "ring-yellow-400/40" : "ring-red-400/40";

  const numInput =
    "w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-brand-green placeholder:text-white/40";

  return (
    <div className="bg-brand-dark rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="font-heading font-bold text-white text-lg">⚡ Simule seu lucro real</h2>
        <p className="text-white/50 text-xs mt-1">
          Edite os campos para ver se o chamado compensa antes de aceitar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Distância estimada (km)",    value: distancia,  setter: setDistancia, step: 0.5  },
          { label: "Consumo do veículo (km/l)",  value: consumo,    setter: setConsumo,   step: 0.5  },
          { label: "Preço do combustível (R$/l)", value: precoComb, setter: setPrecoComb, step: 0.01 },
          { label: "Praças de pedágio (qtd)",    value: pracas,     setter: setPracas,    step: 1    },
        ].map(({ label, value, setter, step }) => (
          <div key={label}>
            <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
            <input
              type="number" min={0} step={step} value={value}
              onChange={(e) => setter(parseFloat(e.target.value) || 0)}
              className={numInput}
            />
          </div>
        ))}
        {pracas > 0 && (
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Valor por praça (R$)</label>
            <input
              type="number" min={0} step={0.5} value={valorPraca}
              onChange={(e) => setValorPraca(parseFloat(e.target.value) || 0)}
              className={numInput}
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">Tempo estimado</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <Clock size={14} className="text-white/40" />
            <span className="text-white text-sm font-medium">{tempo}h</span>
            <span className="text-white/40 text-xs">({modulos} placas)</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Combustível (ida + volta)</span>
          <span className="text-white font-medium">{fmt(custoCombustivel)}</span>
        </div>
        {custoPedagio > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Pedágio (ida + volta)</span>
            <span className="text-white font-medium">{fmt(custoPedagio)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm border-t border-white/10 pt-3">
          <span className="text-white/70">Total de custos</span>
          <span className="text-red-400 font-semibold">− {fmt(totalCustos)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Repasse bruto (75%)</span>
          <span className="text-white font-medium">{fmt(repasse)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Comissão plataforma (25%)</span>
          <span className="text-red-400 font-medium">− {fmt(comissao)}</span>
        </div>

        <div className={`flex items-center justify-between bg-white/5 ring-1 ${margemRingColor} rounded-xl px-4 py-4 mt-2`}>
          <div>
            <p className="text-xs text-white/50 mb-0.5">Lucro líquido estimado</p>
            <p className={`font-heading font-extrabold text-2xl ${margemColor}`}>{fmt(lucroLiquido)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50 mb-0.5">Margem</p>
            <p className={`font-heading font-extrabold text-2xl ${margemColor}`}>{margem.toFixed(1)}%</p>
          </div>
        </div>

        {margem < 10 && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm font-medium">⚠️ Margem baixa — avalie antes de aceitar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  id: string;
}

export default function ChamadoDetalheCliente({ id }: Props) {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [service,       setService]       = useState<ServiceRequestDB | null>(null);
  const [userId,        setUserId]        = useState<string | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [busy,          setBusy]          = useState(false);
  const [finalPrice,    setFinalPrice]    = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [report,        setReport]        = useState<ServiceReport | null>(null);
  const [review,        setReview]        = useState<Review | null>(null);
  const [takenByOther,  setTakenByOther]  = useState(false);

  const fetchService = useCallback(async () => {
    try {
      const res = await fetch(`/api/tecnico/chamado/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setService(null);
        return;
      }
      if (!res.ok) {
        console.error("fetch chamado failed", res.status);
        setService(null);
        return;
      }
      const payload = (await res.json()) as {
        service: ServiceRequestDB | null;
        report:  ServiceReport | null;
        review:  Review | null;
        userId:  string;
        takenByOther: boolean;
      };
      setUserId(payload.userId);
      setService(payload.service);
      setReport(payload.report);
      setReview(payload.review);
      setTakenByOther(payload.takenByOther);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchService(); }, [fetchService]);

  // Initialize finalPrice to price_estimate when service loads
  useEffect(() => {
    if (service && finalPrice === null) {
      setFinalPrice(service.price_estimate);
    }
  }, [service, finalPrice]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function handleAccept() {
    if (!userId) { showToast("Sessão expirada. Faça login novamente.", "error"); return; }
    if (!service) return;
    const priceToSave = finalPrice ?? service.price_estimate;
    const precoMin = service.preco_min ?? 0;
    const precoMax = service.preco_max ?? Infinity;
    const fora = precoMin > 0 && (priceToSave < precoMin || priceToSave > precoMax);
    if (fora && !justificativa.trim()) {
      showToast("Informe a justificativa para o preço fora da faixa aprovada.", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("service_requests")
        .update({
          technician_id:  userId,
          status:         "accepted",
          accepted_at:    new Date().toISOString(),
          price_estimate: priceToSave,
          ...(justificativa.trim() ? { notes: `[Ajuste de preço] ${justificativa.trim()}` } : {}),
        })
        .eq("id", id)
        .eq("status", "pending"); // race-condition guard

      if (error) {
        showToast("Este chamado já foi aceito por outro técnico.", "error");
        setTimeout(() => router.push("/tecnico/chamados"), 1800);
      } else {
        showToast("Chamado aceito! O cliente foi notificado.", "success");
        await insertSystemMessage(id, userId ?? "", "✅ Técnico aceitou o chamado. Em breve entrará em contato.");
        setTimeout(() => router.push(`/tecnico/chamados/${id}`), 1600);
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "in_progress" })
        .eq("id", id)
        .eq("status", "accepted");

      if (error) {
        showToast("Erro ao iniciar serviço.", "error");
      } else {
        // Update local state so the UI transitions immediately
        setService((prev) => prev ? { ...prev, status: "in_progress" } : prev);
        showToast("Serviço iniciado!", "success");
        await insertSystemMessage(id, userId ?? "", "🔧 Serviço iniciado. O técnico está a caminho.");
      }
    } catch {
      showToast("Erro inesperado.", "error");
    } finally {
      setBusy(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />;

  if (!service) {
    return (
      <div className="card text-center py-16">
        <p className="text-brand-muted">Chamado não encontrado.</p>
      </div>
    );
  }

  if (takenByOther && service.technician_id !== userId) {
    return (
      <div className="card text-center py-16 space-y-2">
        <p className="text-2xl">🔒</p>
        <p className="text-brand-dark font-semibold">Este chamado já foi aceito por outro técnico.</p>
        <p className="text-brand-muted text-sm">
          Volte para a lista para ver os chamados ainda disponíveis na sua região.
        </p>
      </div>
    );
  }

  const { status, module_count, price_estimate, city } = service;
  const isMyService = service.technician_id === userId;
  const currentFinalPrice = finalPrice ?? price_estimate;
  const precoMin = service.preco_min ?? 0;
  const precoMax = service.preco_max ?? 0;
  const hasFaixa = precoMin > 0 && precoMax > 0;
  const foraFaixa = hasFaixa && (currentFinalPrice < precoMin || currentFinalPrice > precoMax);

  return (
    <div className="space-y-6">
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="mb-2">
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Detalhe do chamado</h1>
        <p className="text-brand-muted text-sm mt-1">
          {city} · {module_count} placas · #{id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* ── PENDING: show service info + calculator + accept/decline ── */}
      {status === "pending" && (
        <>
          {/* Basic info card */}
          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-brand-muted mb-1">Serviço #{id.slice(0, 8).toUpperCase()}</p>
                <p className="font-heading font-bold text-brand-dark text-lg">{city}</p>
              </div>
              <span className="flex-shrink-0 bg-brand-green/10 text-brand-green text-xs font-semibold px-3 py-1.5 rounded-full">
                {fmt(price_estimate)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-brand-muted mt-0.5 flex-shrink-0" />
                <div>
                  {/* For privacy, show only partial address until accepted */}
                  <p className="text-sm font-medium text-brand-dark">
                    {service.address.split(",")[0]} (endereço completo após aceitar)
                  </p>
                  <p className="text-xs text-brand-muted">{city}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-brand-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-brand-dark">{fmtDate(service.preferred_date)}</p>
                  <p className="text-xs text-brand-muted">{service.preferred_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Sun size={16} className="text-brand-muted flex-shrink-0" />
                <p className="text-sm text-brand-dark">
                  <span className="font-semibold">{module_count}</span> placas
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-brand-muted flex-shrink-0" />
                <p className="text-sm text-brand-dark">
                  ~<span className="font-semibold">{tempoByModulos(module_count)}h</span> estimadas
                </p>
              </div>
            </div>

            {/* New service conditions */}
            <ServiceDetailsGrid service={service} />

            {service.notes && (
              <div className="bg-brand-bg rounded-xl px-4 py-3 text-sm text-brand-muted">
                <span className="font-semibold text-brand-dark">Obs: </span>
                {service.notes}
              </div>
            )}
          </div>

          {/* Price range approved */}
          {hasFaixa && (
            <div className="bg-brand-dark rounded-2xl px-5 py-4 space-y-1">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">
                💰 Faixa de preço aprovada pelo cliente
              </p>
              <p className="font-heading font-extrabold text-brand-green text-2xl">
                {fmt(precoMin)} – {fmt(precoMax)}
              </p>
              <p className="text-white/40 text-xs">
                Valor estimado: {fmt(price_estimate)}
              </p>
            </div>
          )}

          <Calculator valorServico={currentFinalPrice} modulos={module_count} distanciaKm={service.distancia_km ?? 10} />

          {/* Price adjustment */}
          <div className="card space-y-4">
            <div>
              <label className="label-base flex items-center gap-1.5">
                <Info size={13} className="text-brand-muted" />
                💵 Preço final que você irá cobrar
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={currentFinalPrice}
                onChange={(e) => setFinalPrice(parseFloat(e.target.value) || price_estimate)}
                className="input-base mt-1"
              />
              {hasFaixa && (
                <p className={`text-xs mt-2 font-semibold ${foraFaixa ? "text-red-600" : "text-emerald-600"}`}>
                  {foraFaixa
                    ? `⚠️ Fora da faixa aprovada (${fmt(precoMin)} – ${fmt(precoMax)})`
                    : `✅ Dentro da faixa aprovada (${fmt(precoMin)} – ${fmt(precoMax)})`}
                </p>
              )}
            </div>

            {foraFaixa && (
              <div>
                <label className="label-base text-red-700">
                  ⚠️ Justificativa obrigatória (preço fora da faixa) *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explique o motivo do preço estar fora da faixa aprovada…"
                  className="input-base resize-none border-red-300 focus:ring-red-400"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center justify-between bg-brand-bg rounded-xl px-4 py-3">
              <div>
                <span className="text-sm text-brand-muted">Seu repasse (75%)</span>
                {currentFinalPrice * 0.75 < REPASSE_MINIMO_TECNICO * 1.2 && (
                  <p className="text-[10px] text-brand-muted mt-0.5">
                    💰 Mínimo garantido: R$ {REPASSE_MINIMO_TECNICO.toFixed(0)}
                  </p>
                )}
              </div>
              <span className="font-heading font-extrabold text-xl text-brand-green">
                {fmt(currentFinalPrice * 0.75)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" className="w-full" onClick={() => router.back()} disabled={busy}>
                Recusar
              </Button>
              <Button variant="primary" size="lg" className="w-full" loading={busy} onClick={handleAccept}>
                {busy ? "Aceitando…" : "✓ Aceitar chamado"}
                {!busy && <ArrowRight size={16} />}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Insurance badge ── */}
      {["accepted", "in_progress", "completed"].includes(status) && isMyService && (
        <div className="flex items-center gap-2 bg-brand-light border border-brand-border rounded-xl px-4 py-2.5">
          <span className="text-base">🛡️</span>
          <p className="text-xs font-medium text-brand-dark">Serviço coberto por seguro contra danos</p>
        </div>
      )}

      {/* ── ACCEPTED (my service): show full info + Start button ── */}
      {status === "accepted" && isMyService && (
        <>
          <ServiceInfoCard service={service} />
          <div className="card">
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              loading={busy}
              onClick={handleStart}
            >
              <Play size={16} />
              {busy ? "Iniciando…" : "Iniciar Serviço"}
            </Button>
          </div>
        </>
      )}

      {/* ── IN PROGRESS (my service): show full info + Complete button ── */}
      {status === "in_progress" && isMyService && (
        <>
          <ServiceInfoCard service={service} />
          <div className="card">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push(`/tecnico/conclusao/${id}`)}
            >
              <CheckCircle2 size={16} />
              Concluir Serviço →
            </Button>
          </div>
        </>
      )}

      {/* ── COMPLETED ── */}
      {status === "completed" && (
        <>
          {isMyService && <ServiceInfoCard service={service} />}
          {!isMyService && (
            <div className="card text-center py-8 space-y-2">
              <CheckCircle2 size={36} className="text-brand-green mx-auto" />
              <p className="font-semibold text-brand-dark">Serviço concluído</p>
            </div>
          )}

          {/* Report section */}
          <div className="card space-y-4">
            <h2 className="font-heading font-bold text-brand-dark text-base">📄 Relatório do serviço</h2>

            {report ? (
              <div className="space-y-4">
                {/* Checklist */}
                {report.checklist && Object.keys(report.checklist).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Checklist</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {Object.entries(report.checklist).map(([key, done]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="flex-shrink-0">{done ? "✅" : "⬜"}</span>
                          <span className={done ? "text-brand-dark" : "text-brand-muted"}>
                            {CHECKLIST_LABELS[key] ?? key}
                          </span>
                        </div>
                      ))}
                    </div>
                    {report.general_condition && (
                      <p className="text-xs text-brand-muted mt-2">
                        Condição geral: <strong className="text-brand-dark">{report.general_condition.replace(/_/g, " ")}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Photos before */}
                {report.photos_before?.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Fotos — Antes</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {report.photos_before.filter(Boolean).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`Antes ${i+1}`} className="w-full aspect-square object-cover rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos after */}
                {report.photos_after?.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Fotos — Depois</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {report.photos_after.filter(Boolean).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`Depois ${i+1}`} className="w-full aspect-square object-cover rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Observations */}
                {report.observations && (
                  <div className="bg-brand-bg rounded-xl px-4 py-3 text-sm text-brand-muted">
                    <span className="font-semibold text-brand-dark">Observações: </span>
                    {report.observations}
                  </div>
                )}

                {/* Client rating */}
                {review && (
                  <div className="bg-brand-light rounded-xl px-4 py-3 space-y-1">
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">Avaliação do cliente</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < review.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                      <span className="text-sm font-bold text-brand-dark ml-1">{review.rating}/5</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-brand-muted italic">"{review.comment}"</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-6 text-center text-sm text-brand-muted">
                Nenhum relatório registrado para este serviço.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ACCEPTED/IN_PROGRESS but not this technician's service ── */}
      {(status === "accepted" || status === "in_progress") && !isMyService && (
        <div className="card text-center py-8">
          <p className="text-brand-muted text-sm">Este chamado foi aceito por outro técnico.</p>
        </div>
      )}

      {/* ── CHAT (available when accepted/in_progress/completed and this is my service) ── */}
      {["accepted", "in_progress", "completed"].includes(status) && isMyService && userId && (
        <ChatBox
          serviceId={id}
          currentUserId={userId}
          currentUserName="Técnico"
          otherUserName="Cliente"
        />
      )}
    </div>
  );
}
