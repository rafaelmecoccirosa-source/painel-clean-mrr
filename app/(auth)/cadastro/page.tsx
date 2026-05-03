"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { LoginBackground } from "@/components/LoginBackground";
import { SC_MUNICIPIOS } from "@/components/landing-v2/sc-municipios";
import { sugerirPlano } from "@/lib/pricing";
import { AlertCircle, CheckCircle2, Plus, Trash2, Clock } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const CIDADES = SC_MUNICIPIOS.map((m) => m.name).sort();

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

// ── Types ────────────────────────────────────────────────────────────────────

type Role   = "cliente" | "tecnico";
type PlanId = "basic" | "standard" | "plus";
type Usina  = { modulos: string; inversor: string; tipo: string };

// ── StepBar ──────────────────────────────────────────────────────────────────

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
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  isDone   ? "bg-brand-green text-white" :
                  isActive ? "bg-brand-dark text-white"  :
                             "bg-brand-border text-brand-muted"
                }`}
              >
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

// ── GoogleButton ─────────────────────────────────────────────────────────────

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white border border-brand-border hover:border-brand-green hover:bg-brand-light text-brand-dark font-semibold text-sm rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      {loading ? "Redirecionando…" : "Continuar com Google"}
    </button>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-brand-border" />
      <span className="text-xs text-brand-muted">ou</span>
      <div className="flex-1 h-px bg-brand-border" />
    </div>
  );
}

// ── CharCounter ──────────────────────────────────────────────────────────────

function CharCounter({ value, max }: { value: number; max: number }) {
  const warn = value > max * 0.9;
  return (
    <div className={`mt-1 text-[11px] text-right ${warn ? 'text-red-600 font-bold' : 'text-brand-muted'}`}>
      {value}/{max} caracteres
    </div>
  );
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ── BackButton ────────────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

function CadastroInner() {
  const searchParams = useSearchParams();

  // Step & role
  const [step, setStep] = useState<number>(() => {
    const r = searchParams.get("role");
    return r === "cliente" || r === "tecnico" ? 2 : 1;
  });
  const [role, setRole] = useState<Role | null>(() => {
    const r = searchParams.get("role");
    return r === "cliente" || r === "tecnico" ? (r as Role) : null;
  });

  // Step 2 — dados pessoais
  const [nome,     setNome]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade,   setCidade]   = useState("");

  // Step 3 — usinas (cliente)
  const [usinas, setUsinas] = useState<Usina[]>([{ modulos: "", inversor: "", tipo: "" }]);

  // Step 4 — plano (cliente)
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [suggestedPlanId, setSuggestedPlanId] = useState<PlanId | null>(null);

  // Step 3 — técnico
  const [experiencia,    setExperiencia]    = useState("");
  const [certificacoes,  setCertificacoes]  = useState("");
  const [veiculo,        setVeiculo]        = useState("");
  const [disponibilidade,setDisponibilidade]= useState("");
  const [termsAccepted,  setTermsAccepted]  = useState(false);

  // UI
  const [loading,       setLoading]       = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [done,          setDone]          = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function totalModulos() {
    return usinas.reduce((sum, u) => sum + (parseInt(u.modulos) || 0), 0);
  }

  function selectRole(r: Role) {
    setRole(r);
    setStep(2);
    setError(null);
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  // ── Usina helpers ──────────────────────────────────────────────────────────

  function updateUsina(idx: number, field: keyof Usina, value: string) {
    setUsinas((prev) => prev.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  }

  function addUsina() {
    if (usinas.length < 3) setUsinas((prev) => [...prev, { modulos: "", inversor: "", tipo: "" }]);
  }

  function removeUsina(idx: number) {
    setUsinas((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────

  async function handleGoogleSignUp() {
    setLoadingGoogle(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoadingGoogle(false);
    }
  }

  // ── Step 2 → 3 ────────────────────────────────────────────────────────────

  function handleAdvanceFromPersonal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nome.trim())       return setError("Informe seu nome completo.");
    if (!email.trim())      return setError("Informe seu e-mail.");
    if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.");
    if (!cidade)            return setError("Selecione sua cidade.");
    setStep(3);
  }

  // ── Step 3 → 4 (cliente only) ─────────────────────────────────────────────

  function handleAdvanceFromUsina(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    for (const u of usinas) {
      if (!u.modulos)  return setError("Informe a quantidade de módulos de cada usina.");
      if (!u.inversor) return setError("Selecione o inversor de cada usina.");
      if (!u.tipo)     return setError("Selecione o tipo de instalação de cada usina.");
    }
    // Auto-suggest plan based on total modules
    const total = totalModulos();
    if (total > 0 && total <= 60) {
      const suggested = sugerirPlano(total);
      if (suggested === "basic" || suggested === "standard" || suggested === "plus") {
        setPlanId(suggested);
        setSuggestedPlanId(suggested);
      }
    }
    setStep(4);
  }

  // ── Submit: cliente (step 4) ───────────────────────────────────────────────

  async function handleSubmitCliente(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const isLargeUsina = totalModulos() > 60;
    if (!isLargeUsina && !planId) return setError("Selecione um plano para continuar.");

    setLoading(true);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome, role: "cliente" } },
    });

    if (signUpError) {
      setLoading(false);
      return setError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Tente fazer login."
          : signUpError.message
      );
    }

    const user = signUpData.user;
    if (!user) {
      setLoading(false);
      return setError("Erro ao criar conta. Tente novamente.");
    }

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id:   user.id,
      full_name: nome,
      role:      "cliente",
      city:      cidade,
      phone:     telefone || null,
    }, { onConflict: "user_id" });

    if (profileError) console.warn("[cadastro] profile upsert:", profileError.message);

    // Create subscription (skip for large usinaas — admin contact flow)
    const total = totalModulos();
    if (planId) {
      const plan = PLANS.find((p) => p.id === planId)!;
      const now  = new Date();
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
      if (subError) console.warn("[cadastro] subscription insert:", subError.message);
    }

    setLoading(false);
    setDone(true);
  }

  // ── Submit: técnico (step 3) ───────────────────────────────────────────────

  async function handleSubmitTecnico(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!veiculo)         return setError("Selecione sua situação de veículo.");
    if (!disponibilidade) return setError("Selecione sua disponibilidade.");
    if (!termsAccepted)   return setError("Você precisa aceitar os Termos de Uso para continuar.");

    setLoading(true);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:     nome,
          role:          "tecnico",
          status:        "pending_approval",
          veiculo,
          disponibilidade,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      return setError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Tente fazer login."
          : signUpError.message
      );
    }

    const user = signUpData.user;
    if (!user) {
      setLoading(false);
      return setError("Erro ao criar conta. Tente novamente.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id:   user.id,
      full_name: nome,
      role:      "tecnico",
      city:      cidade,
      phone:     telefone || null,
    }, { onConflict: "user_id" });

    if (profileError) console.warn("[cadastro] profile upsert:", profileError.message);

    setLoading(false);
    setDone(true);
  }

  // ── Done screens ───────────────────────────────────────────────────────────

  if (done && role === "cliente") {
    const plan = PLANS.find((p) => p.id === planId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8"><Logo size="lg" inverted /></div>
          <div className="card text-center py-8 px-6">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-brand-green/10 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-brand-green" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-brand-dark mb-1">Conta criada!</h2>
            {plan && (
              <p className="text-sm text-brand-muted mb-1">
                Plano <span className="font-semibold text-brand-dark">{plan.name}</span> — R${plan.price}/mês · {plan.limpezas} limpezas/ano
              </p>
            )}
            <p className="text-xs text-brand-muted mb-6">
              Verifique seu e-mail para confirmar a conta. A 1ª limpeza será agendada em breve.
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
    );
  }

  if (done && role === "tecnico") {
    return (
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
            <Button variant="secondary" size="lg" className="w-full" onClick={() => { window.location.href = "/login"; }}>
              Voltar para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step indicator labels ──────────────────────────────────────────────────

  const stepsCliente = ["Dados", "Usina", "Plano"];
  const stepsTecnico = ["Dados", "Experiência"];
  const currentStepBar = step - 1; // step 2 = pos 1, step 3 = pos 2, etc.

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" inverted />
        </div>

        {/* ── Step 1: Role selection ── */}
        {step === 1 && (
          <div className="card">
            <h1 className="text-xl font-bold text-brand-dark mb-1">Criar conta</h1>
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

        {/* ── Step 2: Dados pessoais ── */}
        {step === 2 && role && (
          <div className="card">
            <BackButton onClick={() => { setStep(1); setError(null); }} />
            <StepBar steps={role === "cliente" ? stepsCliente : stepsTecnico} current={currentStepBar} />
            <h1 className="text-xl font-bold text-brand-dark mb-1">
              {role === "cliente" ? "Seus dados" : "Seus dados"}
            </h1>
            <p className="text-sm text-brand-muted mb-4">
              {role === "cliente" ? "Crie sua conta para assinar um plano." : "Crie sua conta para receber chamados."}
            </p>

            <GoogleButton loading={loadingGoogle} onClick={handleGoogleSignUp} />
            <Divider />
            {error && <ErrorBanner msg={error} />}

            <form onSubmit={handleAdvanceFromPersonal} className="space-y-4">
              <div>
                <label className="label-base" htmlFor="nome">Nome completo</label>
                <input id="nome" type="text" placeholder="Seu nome completo" className="input-base"
                  autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div>
                <label className="label-base" htmlFor="email">E-mail</label>
                <input id="email" type="email" placeholder="seu@email.com" className="input-base"
                  autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label-base" htmlFor="password">Senha</label>
                <input id="password" type="password" placeholder="Mínimo 8 caracteres" className="input-base"
                  autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="label-base" htmlFor="telefone">Telefone / WhatsApp</label>
                <input id="telefone" type="tel" placeholder="(47) 9 9999-9999" className="input-base"
                  autoComplete="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
              <div>
                <label className="label-base" htmlFor="cidade">Cidade</label>
                <select id="cidade" className="input-base" value={cidade}
                  onChange={(e) => setCidade(e.target.value)} required>
                  <option value="">Selecione sua cidade</option>
                  {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button type="submit" size="lg" className="w-full mt-2">
                Continuar
              </Button>
            </form>
          </div>
        )}

        {/* ── Step 3 (cliente): Usinas ── */}
        {step === 3 && role === "cliente" && (
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
                    <input
                      type="number"
                      min={1}
                      max={500}
                      placeholder="Ex: 20"
                      className="input-base"
                      value={usina.modulos}
                      onChange={(e) => updateUsina(idx, "modulos", e.target.value)}
                      required
                    />
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

        {/* ── Step 4 (cliente): Plano ── */}
        {step === 4 && role === "cliente" && (
          <div className="card">
            <BackButton onClick={goBack} />
            <StepBar steps={stepsCliente} current={currentStepBar} />
            <h1 className="text-xl font-bold text-brand-dark mb-1">Escolha seu plano</h1>
            <p className="text-sm text-brand-muted mb-5">
              Selecione o plano que cobre sua usina.
            </p>

            {totalModulos() > 60 ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-4">
                  <p className="font-semibold mb-1">Usina grande detectada</p>
                  <p className="text-xs leading-relaxed">
                    Sua usina de <strong>{totalModulos()} módulos</strong> se encaixa nos planos <strong>Pro</strong> ou <strong>Business</strong>, que são customizados. Nossa equipe entrará em contato em até 24h para criar o melhor plano para você.
                  </p>
                </div>
                <form onSubmit={handleSubmitCliente}>
                  {error && <ErrorBanner msg={error} />}
                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    Criar conta e aguardar contato
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSubmitCliente} className="space-y-3">
                {error && <ErrorBanner msg={error} />}
                {PLANS.map((plan) => {
                  const isSelected = planId === plan.id;
                  const isRecommended = suggestedPlanId === plan.id;
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-dark text-sm">{plan.name}</span>
                          {isRecommended && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-green bg-brand-light px-2 py-0.5 rounded-full border border-brand-green/20">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-bold text-brand-dark text-lg">R${plan.price}</span>
                          <span className="text-brand-muted text-xs">/mês</span>
                        </div>
                      </div>
                      {isRecommended && totalModulos() > 0 && (
                        <p className="text-xs text-brand-green mb-1">
                          Seu sistema de {totalModulos()} módulos se encaixa neste plano
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-brand-muted">
                        <span>{plan.range}</span>
                        <span>·</span>
                        <span>{plan.limpezas} limpezas/ano incluídas</span>
                      </div>
                    </button>
                  );
                })}

                <div className="bg-brand-light border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-muted">
                  1ª limpeza com <span className="font-semibold text-brand-dark">50% off</span> · contrato mínimo de 12 meses
                </div>

                <Button type="submit" size="lg" className="w-full mt-2" loading={loading}
                  disabled={!planId}>
                  Confirmar plano e criar conta
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 3 (técnico): Experiência ── */}
        {step === 3 && role === "tecnico" && (
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

              <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
                Enviar cadastro
              </Button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-white/70 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-green font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function CadastroPage() {
  return (
    <>
      <LoginBackground />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CadastroInner />
      </Suspense>
    </>
  );
}
