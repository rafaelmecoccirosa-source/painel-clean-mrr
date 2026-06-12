"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { LoginBackground } from "@/components/LoginBackground";
import { SC_MUNICIPIOS } from "@/components/landing-v2/sc-municipios";
import { sugerirPlano, calcularEntrada } from "@/lib/pricing";
import { AlertCircle, CheckCircle2, Plus, Trash2, Clock } from "lucide-react";
import type { User } from "@supabase/supabase-js";

// ── Constants (same as cadastro) ──────────────────────────────────────────────

const CIDADES = SC_MUNICIPIOS.map((m) => m.name).sort();

const MODULE_OPTIONS = [
  { value: "10", label: "10 módulos" },
  { value: "12", label: "12 módulos" },
  { value: "15", label: "15 módulos" },
  { value: "20", label: "20 módulos" },
  { value: "25", label: "25 módulos" },
  { value: "30", label: "30 módulos" },
  { value: "40", label: "40 módulos" },
  { value: "50", label: "50 módulos" },
  { value: "60", label: "60 módulos" },
  { value: "61", label: "Mais de 60 módulos" },
];

const INVERTER_BRANDS = [
  "Fronius", "SolarEdge", "Growatt", "Sungrow", "Hoymiles", "Deye", "Outro",
];

const INSTALL_TYPES = [
  { value: "telhado_ceramico", label: "Telhado cerâmico" },
  { value: "telhado_metalico", label: "Telhado metálico" },
  { value: "laje", label: "Laje" },
  { value: "solo", label: "Solo" },
];

const PLANS = [
  { id: "basic" as const,    name: "Básico",  price: 30,  range: "até 15 módulos",  limpezas: 2, maxModules: 15 },
  { id: "standard" as const, name: "Padrão",  price: 50,  range: "16–30 módulos",   limpezas: 2, maxModules: 30 },
  { id: "plus" as const,     name: "Plus",    price: 100, range: "31–60 módulos",   limpezas: 2, maxModules: 60 },
];

const VEHICLE_OPTIONS = [
  { value: "carro_moto", label: "Sim, tenho carro e/ou moto" },
  { value: "moto",       label: "Só moto" },
  { value: "nao",        label: "Não tenho veículo" },
];

const AVAILABILITY_OPTIONS = [
  { value: "integral", label: "Integral (segunda a sábado)" },
  { value: "fds",      label: "Fins de semana" },
  { value: "manha",    label: "Meio período — manhãs" },
  { value: "tarde",    label: "Meio período — tardes" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Role   = "cliente" | "tecnico";
type PlanId = "basic" | "standard" | "plus";
type Usina  = { modulos: string; inversor: string; tipo: string };

// ── Shared sub-components ─────────────────────────────────────────────────────

function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center mb-6">
      {steps.map((label, i) => {
        const num     = i + 1;
        const isActive = num === current;
        const isDone   = num < current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                isDone   ? "bg-brand-green text-white" :
                isActive ? "bg-brand-dark text-white"  :
                           "bg-brand-border text-brand-muted"
              }`}>
                {isDone ? "✓" : num}
              </div>
              <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                isActive ? "text-brand-dark" : isDone ? "text-brand-green" : "text-brand-muted"
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mb-4 mx-1 ${isDone ? "bg-brand-green" : "bg-brand-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CharCounter({ value, max }: { value: number; max: number }) {
  const warn = value > max * 0.9;
  return (
    <div className={`mt-1 text-[11px] text-right ${warn ? 'text-red-600 font-bold' : 'text-brand-muted'}`}>
      {value}/{max} caracteres
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-brand-muted hover:text-brand-dark mb-4 flex items-center gap-1 transition-colors"
    >
      ← Voltar
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CompletarCadastroPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Step & role
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<Role | null>(null);

  // Usinas (cliente — step 2)
  const [usinas, setUsinas] = useState<Usina[]>([{ modulos: "", inversor: "", tipo: "" }]);

  // Plan (cliente — step 3)
  const [planId, setPlanId] = useState<PlanId | null>(null);

  // Técnico data (step 2)
  const [experiencia,     setExperiencia]     = useState("");
  const [certificacoes,   setCertificacoes]   = useState("");
  const [veiculo,         setVeiculo]         = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [termsAccepted,   setTermsAccepted]   = useState(false);

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  // ── Load current user — bail out if role is already known ─────────────────

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        setLoading(false);
        return;
      }

      // 1. Try to read role from profile. The RLS policy lets the user read
      //    their own row, so this works without service role. If the profile
      //    row already has a role, jump straight to the role-aware redirect.
      let existingRole: string | null = null;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", u.id)
          .maybeSingle();
        existingRole = profile?.role ?? null;
      } catch {
        /* read failed — fall through to JWT fallback below */
      }

      if (existingRole) {
        window.location.href = "/api/auth/redirect";
        return;
      }

      // 2. Fallback: user_metadata.role from the JWT. If present, we don't
      //    need to ask anything — /api/auth/redirect will backfill the
      //    profile row and route the user to the right dashboard.
      const metaRole = (u.user_metadata?.role as string | undefined) ?? null;
      if (metaRole) {
        window.location.href = "/api/auth/redirect";
        return;
      }

      // 3. No role anywhere — show the form.
      setUser(u);
      setLoading(false);
    })();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function totalModulos() {
    return usinas.reduce((sum, u) => sum + (parseInt(u.modulos) || 0), 0);
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function updateUsina(idx: number, field: keyof Usina, value: string) {
    setUsinas((prev) => prev.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  }

  function addUsina() {
    if (usinas.length < 3) setUsinas((prev) => [...prev, { modulos: "", inversor: "", tipo: "" }]);
  }

  function removeUsina(idx: number) {
    setUsinas((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Step 1: Role selection ─────────────────────────────────────────────────

  function selectRole(r: Role) {
    setRole(r);
    setStep(2);
    setError(null);
  }

  // ── Step 2 (cliente): Usina → Step 3 ──────────────────────────────────────

  function handleAdvanceFromUsina(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    for (const u of usinas) {
      if (!u.modulos)  return setError("Informe a quantidade de módulos de cada usina.");
      if (!u.inversor) return setError("Selecione o inversor de cada usina.");
      if (!u.tipo)     return setError("Selecione o tipo de instalação de cada usina.");
    }
    const total = totalModulos();
    if (total > 0 && total <= 60) {
      const suggested = sugerirPlano(total);
      if (suggested === "basic" || suggested === "standard" || suggested === "plus") {
        setPlanId(suggested);
      }
    }
    setStep(3);
  }

  // ── Submit: cliente (step 3) ───────────────────────────────────────────────

  async function handleSubmitCliente(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!planId) return setError("Selecione um plano para continuar.");
    if (!user)   return setError("Sessão expirada. Faça login novamente.");

    setSubmitting(true);

    const supabase  = createClient();
    const fullName  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";

    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id:   user.id,
      full_name: fullName,
      role:      "cliente",
    }, { onConflict: "user_id" });

    if (profileError) console.warn("[completar-cadastro] profile upsert:", profileError.message);

    const plan  = PLANS.find((p) => p.id === planId)!;
    const total = totalModulos();
    const now   = new Date();

    const { error: subError } = await supabase.from("subscriptions").insert({
      client_id:       user.id,
      plan_type:       planId,
      status:          "active",
      price_monthly:   plan.price,
      modules_count:   total,
      inverter_brand:  usinas[0]?.inversor || null,
      started_at:      now.toISOString(),
      next_billing_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_service_at: new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (subError) console.warn("[completar-cadastro] subscription insert:", subError.message);

    // Gera a fatura da taxa de adesão e vincula indicação (cookie /ref/CODIGO)
    if (!subError) {
      await fetch("/api/cliente/pos-assinatura", { method: "POST" }).catch(() => {});
    }

    setSubmitting(false);
    setDone(true);
  }

  // ── Submit: técnico (step 2) ───────────────────────────────────────────────

  async function handleSubmitTecnico(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!veiculo)         return setError("Selecione sua situação de veículo.");
    if (!disponibilidade) return setError("Selecione sua disponibilidade.");
    if (!termsAccepted)   return setError("Você precisa aceitar os Termos de Uso para continuar.");
    if (!user)            return setError("Sessão expirada. Faça login novamente.");

    setSubmitting(true);

    const supabase = createClient();
    const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";

    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id:   user.id,
      full_name: fullName,
      role:      "tecnico",
    }, { onConflict: "user_id" });

    if (profileError) console.warn("[completar-cadastro] profile upsert:", profileError.message);

    setSubmitting(false);
    setDone(true);
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <LoginBackground />
        <div className="min-h-screen flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
        </div>
      </>
    );
  }

  // ── Done: cliente ──────────────────────────────────────────────────────────

  if (done && role === "cliente") {
    const plan = PLANS.find((p) => p.id === planId);
    return (
      <>
        <LoginBackground />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8"><Logo size="lg" inverted /></div>
            <div className="card text-center py-8 px-6">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-brand-green" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-brand-dark mb-1">Tudo pronto!</h2>
              {plan && (
                <p className="text-sm text-brand-muted mb-1">
                  Plano <span className="font-semibold text-brand-dark">{plan.name}</span> — R${plan.price}/mês · {plan.limpezas} limpezas/ano
                </p>
              )}
              <p className="text-xs text-brand-muted mb-6">
                A 1ª limpeza será agendada em breve pela nossa equipe.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => { window.location.href = "/api/auth/redirect"; }}
              >
                Acessar meu dashboard
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Done: técnico ──────────────────────────────────────────────────────────

  if (done && role === "tecnico") {
    return (
      <>
        <LoginBackground />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8"><Logo size="lg" inverted /></div>
            <div className="card py-8 px-6">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-brand-light flex items-center justify-center">
                  <Clock size={32} className="text-brand-green" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-brand-dark mb-2 text-center">Cadastro enviado!</h2>
              <p className="text-sm text-brand-muted text-center mb-6">
                Nossa equipe vai analisar seu perfil. Você receberá um e-mail em até 48h.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Análise do perfil",  active: true  },
                  { label: "Aprovação",           active: false },
                  { label: "Onboarding inicial",  active: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.active ? "bg-brand-green text-white" : "bg-brand-border text-brand-muted"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${item.active ? "text-brand-dark font-medium" : "text-brand-muted"}`}>
                      {item.label}
                    </span>
                    {item.active && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-brand-green bg-brand-light px-2 py-0.5 rounded-full">
                        Em andamento
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="lg" className="w-full"
                onClick={() => { window.location.href = "/login"; }}>
                Voltar para o login
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Step labels ────────────────────────────────────────────────────────────

  const stepsCliente = ["Usina", "Plano"];
  const stepsTecnico = ["Experiência"];
  const currentStepBar = step - 1; // step 2 = pos 1, step 3 = pos 2

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <LoginBackground />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="lg" inverted />
          </div>

          {/* ── Step 1: Role selection ── */}
          {step === 1 && (
            <div className="card">
              <h1 className="text-xl font-bold text-brand-dark mb-1">Completar cadastro</h1>
              {user && (
                <p className="text-sm text-brand-muted mb-1">
                  Olá{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}! Só mais alguns dados.
                </p>
              )}
              <p className="text-sm text-brand-muted mb-6">Como você quer usar a plataforma?</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => selectRole("cliente")}
                  className="w-full text-left border border-brand-border hover:border-brand-green hover:bg-brand-light rounded-xl p-4 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">🏠</span>
                    <div>
                      <p className="font-bold text-brand-dark text-sm group-hover:text-brand-green transition-colors">Sou cliente</p>
                      <p className="text-xs text-brand-muted mt-0.5 leading-snug">Quero assinar e agendar limpeza da minha usina solar</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole("tecnico")}
                  className="w-full text-left border border-brand-border hover:border-brand-green hover:bg-brand-light rounded-xl p-4 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">🔧</span>
                    <div>
                      <p className="font-bold text-brand-dark text-sm group-hover:text-brand-green transition-colors">Sou técnico</p>
                      <p className="text-xs text-brand-muted mt-0.5 leading-snug">Quero receber chamados de limpeza de usinas solares</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2 (cliente): Dados da usina ── */}
          {step === 2 && role === "cliente" && (
            <div className="card">
              <BackButton onClick={goBack} />
              <StepBar steps={stepsCliente} current={currentStepBar} />
              <h1 className="text-xl font-bold text-brand-dark mb-1">Dados da usina</h1>
              <p className="text-sm text-brand-muted mb-5">Informe os dados da sua instalação solar.</p>

              {error && <ErrorBanner msg={error} />}

              <form onSubmit={handleAdvanceFromUsina} className="space-y-4">
                {usinas.map((usina, idx) => (
                  <div key={idx} className="border border-brand-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-dark">Usina {idx + 1}</span>
                        {idx === 0 && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-green bg-brand-light px-2 py-0.5 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      {idx > 0 && (
                        <button type="button" onClick={() => removeUsina(idx)}
                          className="text-brand-muted hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="label-base">Quantidade de módulos</label>
                      <select className="input-base" value={usina.modulos}
                        onChange={(e) => updateUsina(idx, "modulos", e.target.value)} required>
                        <option value="">Selecione</option>
                        {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-base">Marca do inversor</label>
                      <select className="input-base" value={usina.inversor}
                        onChange={(e) => updateUsina(idx, "inversor", e.target.value)} required>
                        <option value="">Selecione</option>
                        {INVERTER_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-base">Tipo de instalação</label>
                      <select className="input-base" value={usina.tipo}
                        onChange={(e) => updateUsina(idx, "tipo", e.target.value)} required>
                        <option value="">Selecione</option>
                        {INSTALL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}

                {usinas.length < 3 && (
                  <button type="button" onClick={addUsina}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-brand-border hover:border-brand-green hover:bg-brand-light text-brand-muted hover:text-brand-green text-sm font-medium rounded-xl py-3 transition-colors">
                    <Plus size={15} />
                    Adicionar outra usina
                  </button>
                )}

                <Button type="submit" size="lg" className="w-full mt-2">
                  Continuar
                </Button>
              </form>
            </div>
          )}

          {/* ── Step 3 (cliente): Plano ── */}
          {step === 3 && role === "cliente" && (
            <div className="card">
              <BackButton onClick={goBack} />
              <StepBar steps={stepsCliente} current={currentStepBar} />
              <h1 className="text-xl font-bold text-brand-dark mb-1">Escolha seu plano</h1>
              <p className="text-sm text-brand-muted mb-5">Selecione o plano que cobre sua usina.</p>

              {error && <ErrorBanner msg={error} />}

              {totalModulos() > 60 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-3 mb-4">
                  Sua usina tem mais de 60 módulos. Os planos Pro e Business estão disponíveis — nossa equipe entrará em contato após o cadastro.
                </div>
              )}

              <form onSubmit={handleSubmitCliente} className="space-y-3">
                {PLANS.map((plan) => {
                  const isSelected = planId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(plan.id)}
                      className={`w-full text-left rounded-xl p-4 border-2 transition-all ${
                        isSelected
                          ? "border-brand-green bg-brand-light"
                          : "border-brand-border hover:border-brand-green/50 hover:bg-brand-light/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-brand-dark text-sm">{plan.name}</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-bold text-brand-dark text-lg">R${plan.price}</span>
                          <span className="text-brand-muted text-xs">/mês</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-brand-muted">
                        <span>{plan.range}</span>
                        <span>·</span>
                        <span>{plan.limpezas} limpezas/ano incluídas</span>
                      </div>
                    </button>
                  );
                })}

                <div className="bg-brand-light border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-muted leading-relaxed">
                  <span className="font-semibold text-brand-dark">Taxa de adesão única
                  {(() => {
                    const total = totalModulos();
                    if (total > 0 && total <= 100) {
                      try { return `: R$ ${calcularEntrada(total).toFixed(2).replace(".", ",")}`; } catch { return ""; }
                    }
                    return "";
                  })()}</span>
                  {" "}— equivale a 50% de uma limpeza avulsa e já inclui sua 1ª limpeza · contrato mínimo de 12 meses
                </div>

                <Button type="submit" size="lg" className="w-full mt-2"
                  loading={submitting} disabled={!planId}>
                  Confirmar plano
                </Button>
              </form>
            </div>
          )}

          {/* ── Step 2 (técnico): Experiência ── */}
          {step === 2 && role === "tecnico" && (
            <div className="card">
              <BackButton onClick={goBack} />
              <StepBar steps={stepsTecnico} current={currentStepBar} />
              <h1 className="text-xl font-bold text-brand-dark mb-1">Experiência</h1>
              <p className="text-sm text-brand-muted mb-5">Conte um pouco sobre seu perfil profissional.</p>

              {error && <ErrorBanner msg={error} />}

              <form onSubmit={handleSubmitTecnico} className="space-y-4">
                <div>
                  <label className="label-base" htmlFor="experiencia">Experiência com energia solar</label>
                  <textarea
                    id="experiencia"
                    placeholder="Ex: Eletricista há 5 anos, já realizei limpezas em usinas residenciais e comerciais em Jaraguá do Sul."
                    className="input-base min-h-[90px] resize-y"
                    maxLength={1000}
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value.slice(0, 1000))}
                  />
                  <CharCounter value={experiencia.length} max={1000} />
                </div>
                <div>
                  <label className="label-base" htmlFor="certificacoes">Certificações (opcional)</label>
                  <input
                    id="certificacoes"
                    type="text"
                    placeholder="Ex: NR10, NR35, SENAI Energia Solar"
                    className="input-base"
                    maxLength={200}
                    value={certificacoes}
                    onChange={(e) => setCertificacoes(e.target.value.slice(0, 200))}
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="veiculo">Você tem veículo próprio?</label>
                  <select id="veiculo" className="input-base" value={veiculo}
                    onChange={(e) => setVeiculo(e.target.value)} required>
                    <option value="">Selecione</option>
                    {VEHICLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-base" htmlFor="disponibilidade">Disponibilidade</label>
                  <select id="disponibilidade" className="input-base" value={disponibilidade}
                    onChange={(e) => setDisponibilidade(e.target.value)} required>
                    <option value="">Selecione</option>
                    {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-brand-green cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-brand-muted cursor-pointer leading-snug">
                    Li e aceito os{" "}
                    <Link href="/termos" target="_blank" className="text-brand-green font-medium hover:underline">
                      Termos de Uso
                    </Link>{" "}
                    da plataforma, incluindo a proibição de contato direto com clientes fora da plataforma.
                  </label>
                </div>
                <Button type="submit" size="lg" className="w-full mt-2" loading={submitting}>
                  Enviar cadastro
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-white/70 mt-6">
            Precisa de ajuda?{" "}
            <Link href="/login" className="text-brand-green font-medium hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
