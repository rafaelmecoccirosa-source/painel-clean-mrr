"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, CheckCircle2, TrendingUp, TrendingDown, Minus,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Toast, { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export interface PrevistoData {
  valorServico: number;
  repasse: number;
  custoCombustivel: number;
  custoPedagio: number;
  totalCustos: number;
  lucroLiquido: number;
  margem: number;
}

interface ConclusaoClienteProps {
  servicoId: string;
  modulos: number;
  endereco: string;
  previsto: PrevistoData;
  clienteNome?: string;
  dataServico?: string | null;
}

type GeneralCondition = "excelente" | "bom" | "regular" | "necessita_atencao";

const CHECKLIST_ITEMS = [
  { key: "visual_inspection", label: "Inspeção visual das placas" },
  { key: "connector_check",   label: "Verificação de conectores" },
  { key: "cleaning_complete", label: "Limpeza concluída" },
  { key: "damage_test",       label: "Teste visual de danos" },
  { key: "post_generation",   label: "Teste de geração pós-limpeza" },
] as const;

const CONDITION_OPTIONS: { value: GeneralCondition; label: string; color: string }[] = [
  { value: "excelente",         label: "Excelente",            color: "bg-emerald-500 text-white border-emerald-500" },
  { value: "bom",               label: "Boa",                  color: "bg-brand-green text-white border-brand-green" },
  { value: "regular",           label: "Regular",              color: "bg-yellow-400 text-white border-yellow-400" },
  { value: "necessita_atencao", label: "Necessita manutenção", color: "bg-red-500 text-white border-red-500" },
];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function DeltaBadge({ previsto, realizado }: { previsto: number; realizado: number }) {
  const delta = realizado - previsto;
  if (Math.abs(delta) < 0.01)
    return <span className="text-xs text-brand-muted flex items-center gap-1"><Minus size={11} /> igual</span>;
  if (delta > 0)
    return <span className="text-xs text-red-500 flex items-center gap-1"><TrendingUp size={11} /> +{fmt(delta)}</span>;
  return <span className="text-xs text-brand-green flex items-center gap-1"><TrendingDown size={11} /> {fmt(delta)}</span>;
}

const inputBase =
  "w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-dark " +
  "placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all";

export default function ConclusaoCliente({
  servicoId, modulos, endereco, previsto, clienteNome = "—", dataServico,
}: ConclusaoClienteProps) {
  const router = useRouter();

  const [urlAntes,  setUrlAntes]  = useState("");
  const [urlDepois, setUrlDepois] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.key, false]))
  );
  const [condition,   setCondition]   = useState<GeneralCondition>("bom");
  const [observacoes, setObservacoes] = useState("");
  const [geracaoAntes, setGeracaoAntes] = useState("");

  const [realCombustivel, setRealCombustivel] = useState(previsto.custoCombustivel);
  const [realPedagio,     setRealPedagio]     = useState(previsto.custoPedagio);

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const { toast, show: showToast, hide: hideToast } = useToast();

  const realTotalCustos = realCombustivel + realPedagio;
  const realLucro       = previsto.repasse - realTotalCustos;
  const realMargem      = (realLucro / previsto.valorServico) * 100;
  const perdaSujeira    = 0.20;
  const geracaoDepois   = geracaoAntes
    ? Math.round(parseFloat(geracaoAntes) / (1 - perdaSujeira))
    : null;

  const margemColor = (m: number) =>
    m >= 30 ? "text-brand-green" : m >= 10 ? "text-yellow-600" : "text-red-600";

  const custosForamMenores = realTotalCustos < previsto.totalCustos;
  const custosForamMaiores = realTotalCustos > previsto.totalCustos;

  const toggleChecklist = useCallback((key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        setSubmitting(false);
        return;
      }

      // Optional: insert service_report record if table exists
      await supabase.from("service_reports").insert({
        service_request_id: servicoId,
        photos_before:      urlAntes  ? [urlAntes]  : [],
        photos_after:       urlDepois ? [urlDepois] : [],
        checklist,
        observations:       observacoes.trim() || null,
        general_condition:  condition,
        geracao_antes:      geracaoAntes ? parseFloat(geracaoAntes) : null,
        geracao_depois:     geracaoDepois ?? null,
      }).then(() => {/* ignore error — table may not exist */});

      const { error } = await supabase
        .from("service_requests")
        .update({
          status:     "completed",
          notes:      observacoes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", servicoId)
        .eq("technician_id", user.id);

      if (error) {
        showToast("Erro ao concluir serviço. Tente novamente.", "error");
        setSubmitting(false);
        return;
      }

      setDone(true);
      showToast("Serviço concluído com sucesso!", "success");
      setTimeout(() => router.push("/tecnico/chamados"), 1800);
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card text-center py-12">
        <div className="h-16 w-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} className="text-brand-green" />
        </div>
        <h2 className="font-heading font-bold text-brand-dark text-xl mb-2">Serviço concluído!</h2>
        <p className="text-brand-muted text-sm">Redirecionando para chamados…</p>
      </div>
    );
  }

  const numInput = `${inputBase} [appearance:textfield]`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Resumo do serviço */}
      <div className="card bg-brand-bg border border-brand-border space-y-3">
        <h2 className="font-heading font-bold text-brand-dark text-sm uppercase tracking-wide">Resumo do serviço</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-0.5">Cliente</p>
            <p className="font-medium text-brand-dark">{clienteNome}</p>
          </div>
          <div>
            <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-0.5">Módulos</p>
            <p className="font-medium text-brand-dark">{modulos} módulos</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-0.5">Endereço</p>
            <p className="font-medium text-brand-dark">{endereco}</p>
          </div>
          {dataServico && (
            <div>
              <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-0.5">Data</p>
              <p className="font-medium text-brand-dark">{fmtDate(dataServico)}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-0.5">Repasse</p>
            <p className="font-heading font-bold text-brand-green">{fmt(previsto.repasse)}</p>
          </div>
        </div>
      </div>

      {/* Fotos — URL */}
      <div className="card space-y-4">
        <h2 className="font-heading font-bold text-brand-dark text-base flex items-center gap-2">
          <Camera size={17} className="text-brand-green" />
          Fotos do serviço <span className="text-xs font-normal text-brand-muted">(opcional)</span>
        </h2>
        <div>
          <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
            URL — foto antes da limpeza
          </label>
          <input
            type="url"
            value={urlAntes}
            onChange={(e) => setUrlAntes(e.target.value)}
            placeholder="https://…"
            className={inputBase}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
            URL — foto depois da limpeza
          </label>
          <input
            type="url"
            value={urlDepois}
            onChange={(e) => setUrlDepois(e.target.value)}
            placeholder="https://…"
            className={inputBase}
          />
        </div>
      </div>

      {/* Checklist + Condição + Observações */}
      <div className="card space-y-5">
        <h2 className="font-heading font-bold text-brand-dark text-base flex items-center gap-2">
          <CheckCircle2 size={17} className="text-brand-green" />
          Checklist de inspeção
        </h2>

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleChecklist(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                checklist[key]
                  ? "bg-brand-green/10 border-brand-green/40 text-brand-dark"
                  : "bg-brand-bg border-brand-border text-brand-muted"
              }`}
            >
              <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                checklist[key] ? "bg-brand-green border-brand-green" : "border-brand-border"
              }`}>
                {checklist[key] && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
            Condição geral das placas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONDITION_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCondition(value)}
                className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  condition === value
                    ? color
                    : "bg-white text-brand-dark border-brand-border hover:border-brand-green/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
            Observações da execução
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value.slice(0, 500))}
            placeholder="Descreva condições, problemas encontrados, recomendações…"
            rows={3}
            maxLength={500}
            className={`${inputBase} resize-none`}
          />
          <div className={`mt-1 text-[11px] text-right ${observacoes.length > 450 ? 'text-red-600 font-bold' : 'text-brand-muted'}`}>
            {observacoes.length}/500 caracteres
          </div>
        </div>

        <div className="border-t border-brand-border pt-4">
          <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
            ⚡ Geração antes da limpeza (kWh/mês) — opcional
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={geracaoAntes}
            onChange={(e) => setGeracaoAntes(e.target.value)}
            placeholder="Ex: 850"
            className={numInput}
          />
          {geracaoDepois && (
            <div className="mt-3 bg-brand-light border border-brand-border rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-brand-dark">Geração estimada após limpeza</p>
              <p className="text-brand-green font-heading font-extrabold text-xl">{geracaoDepois} kWh/mês</p>
              <p className="text-xs text-brand-muted mt-0.5">
                +{geracaoDepois - parseInt(geracaoAntes)} kWh/mês
                (+R$ {Math.round((geracaoDepois - parseInt(geracaoAntes)) * 0.85).toLocaleString("pt-BR")}/mês)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Previsto × Realizado */}
      <div className="card space-y-5">
        <div>
          <h2 className="font-heading font-bold text-brand-dark text-base flex items-center gap-2">
            <TrendingUp size={17} className="text-brand-green" />
            Previsto × Realizado
          </h2>
          <p className="text-xs text-brand-muted mt-1">Informe os custos reais para calcular sua margem.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
              Combustível gasto (R$)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={realCombustivel}
              onChange={(e) => setRealCombustivel(parseFloat(e.target.value) || 0)}
              className={numInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
              Pedágio gasto (R$)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={realPedagio}
              onChange={(e) => setRealPedagio(parseFloat(e.target.value) || 0)}
              className={numInput}
            />
          </div>
        </div>

        <div className="rounded-xl border border-brand-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-bg">
              <tr>
                {["Item", "Previsto", "Realizado", "Δ"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide ${h === "Item" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              <tr>
                <td className="px-4 py-3 text-brand-dark">Combustível</td>
                <td className="px-4 py-3 text-right text-brand-muted">{fmt(previsto.custoCombustivel)}</td>
                <td className="px-4 py-3 text-right font-medium text-brand-dark">{fmt(realCombustivel)}</td>
                <td className="px-4 py-3 text-right"><DeltaBadge previsto={previsto.custoCombustivel} realizado={realCombustivel} /></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-brand-dark">Pedágio</td>
                <td className="px-4 py-3 text-right text-brand-muted">{fmt(previsto.custoPedagio)}</td>
                <td className="px-4 py-3 text-right font-medium text-brand-dark">{fmt(realPedagio)}</td>
                <td className="px-4 py-3 text-right"><DeltaBadge previsto={previsto.custoPedagio} realizado={realPedagio} /></td>
              </tr>
              <tr className="bg-brand-bg/60">
                <td className="px-4 py-3 font-semibold text-brand-dark">Total custos</td>
                <td className="px-4 py-3 text-right font-semibold text-brand-muted">{fmt(previsto.totalCustos)}</td>
                <td className="px-4 py-3 text-right font-semibold text-brand-dark">{fmt(realTotalCustos)}</td>
                <td className="px-4 py-3 text-right"><DeltaBadge previsto={previsto.totalCustos} realizado={realTotalCustos} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-bg rounded-xl border border-brand-border px-4 py-4">
            <p className="text-xs text-brand-muted mb-1">Lucro previsto</p>
            <p className={`font-heading font-bold text-xl ${margemColor(previsto.margem)}`}>{fmt(previsto.lucroLiquido)}</p>
            <p className={`text-xs font-semibold mt-0.5 ${margemColor(previsto.margem)}`}>{previsto.margem.toFixed(1)}% margem</p>
          </div>
          <div className="bg-brand-dark rounded-xl px-4 py-4">
            <p className="text-xs text-white/50 mb-1">Lucro real</p>
            <p className={`font-heading font-bold text-xl ${realMargem >= 30 ? "text-brand-green" : realMargem >= 10 ? "text-yellow-400" : "text-red-400"}`}>{fmt(realLucro)}</p>
            <p className={`text-xs font-semibold mt-0.5 ${realMargem >= 30 ? "text-brand-green" : realMargem >= 10 ? "text-yellow-400" : "text-red-400"}`}>{realMargem.toFixed(1)}% margem</p>
          </div>
        </div>

        {(custosForamMenores || custosForamMaiores) && (
          <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ${
            custosForamMenores ? "bg-brand-green/10 border border-brand-green/30" : "bg-yellow-50 border border-yellow-200"
          }`}>
            {custosForamMenores
              ? <TrendingDown size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
              : <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />}
            <p className={`text-sm font-medium ${custosForamMenores ? "text-brand-dark" : "text-yellow-800"}`}>
              {custosForamMenores
                ? `Ótimo! Você gastou ${fmt(previsto.totalCustos - realTotalCustos)} menos do que o previsto.`
                : `Custos ${fmt(realTotalCustos - previsto.totalCustos)} acima do estimado.`}
            </p>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        <CheckCircle2 size={18} />
        {submitting ? "Concluindo…" : "Concluir serviço"}
      </Button>
    </form>
  );
}
