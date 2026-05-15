import Link from "next/link";
import Logo from "@/components/layout/Logo";
import HeroSection from "@/components/home/HeroSection";
import CalculadoraEconomia from "@/components/home/CalculadoraEconomia";
import ScrollAnimations from "@/components/home/ScrollAnimations";
import { TecnicoParticles } from "@/components/TecnicoParticles";
import { BannerParticles } from "@/components/BannerParticles";
import FAQ from "@/components/home/FAQ";
import AnimatedCounter from "@/components/home/AnimatedCounter";

// ── Seção 2 — Como se paga em 4 dias ──────────────────────────────────────

const IconPanelBasico = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="32" height="20" rx="2" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="4" y1="17" x2="36" y2="17" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="4" y1="24" x2="36" y2="24" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="15" y1="10" x2="15" y2="30" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="25" y1="10" x2="25" y2="30" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="20" y1="30" x2="20" y2="36" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="14" y1="36" x2="26" y2="36" stroke="#3DC45A" strokeWidth="2"/>
  </svg>
);

const IconPanelPadrao = () => (
  <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="20" height="14" rx="2" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="2" y1="15" x2="22" y2="15" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="2" y1="20" x2="22" y2="20" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="9" y1="10" x2="9" y2="24" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="15" y1="10" x2="15" y2="24" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="12" y1="24" x2="12" y2="30" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="7" y1="30" x2="17" y2="30" stroke="#3DC45A" strokeWidth="2"/>
    <rect x="26" y="10" width="20" height="14" rx="2" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="26" y1="15" x2="46" y2="15" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="26" y1="20" x2="46" y2="20" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="33" y1="10" x2="33" y2="24" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="39" y1="10" x2="39" y2="24" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="36" y1="24" x2="36" y2="30" stroke="#3DC45A" strokeWidth="2"/>
    <line x1="31" y1="30" x2="41" y2="30" stroke="#3DC45A" strokeWidth="2"/>
  </svg>
);

const IconPanelPlus = () => (
  <svg width="48" height="44" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L44 16V38H4V16L24 4Z" stroke="#3DC45A" strokeWidth="2" fill="none"/>
    <rect x="8" y="18" width="10" height="8" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="8" y1="22" x2="18" y2="22" stroke="#3DC45A" strokeWidth="1"/>
    <line x1="13" y1="18" x2="13" y2="26" stroke="#3DC45A" strokeWidth="1"/>
    <rect x="19" y="18" width="10" height="8" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="19" y1="22" x2="29" y2="22" stroke="#3DC45A" strokeWidth="1"/>
    <line x1="24" y1="18" x2="24" y2="26" stroke="#3DC45A" strokeWidth="1"/>
    <rect x="30" y="18" width="10" height="8" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="30" y1="22" x2="40" y2="22" stroke="#3DC45A" strokeWidth="1"/>
    <line x1="35" y1="18" x2="35" y2="26" stroke="#3DC45A" strokeWidth="1"/>
    <rect x="13" y="28" width="10" height="8" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="13" y1="32" x2="23" y2="32" stroke="#3DC45A" strokeWidth="1"/>
    <line x1="18" y1="28" x2="18" y2="36" stroke="#3DC45A" strokeWidth="1"/>
    <rect x="25" y="28" width="10" height="8" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
    <line x1="25" y1="32" x2="35" y2="32" stroke="#3DC45A" strokeWidth="1"/>
    <line x1="30" y1="28" x2="30" y2="36" stroke="#3DC45A" strokeWidth="1"/>
  </svg>
);

const paybackCards = [
  { Icon: IconPanelBasico, plano: "Plano Básico", modulos: "até 15 módulos",   prejuizoMes: "R$ 218", mensalidade: "R$ 30/mês"  },
  { Icon: IconPanelPadrao, plano: "Plano Padrão", modulos: "16 a 30 módulos",  prejuizoMes: "R$ 365", mensalidade: "R$ 50/mês"  },
  { Icon: IconPanelPlus,   plano: "Plano Plus",   modulos: "31 a 60 módulos",  prejuizoMes: "R$ 729", mensalidade: "R$ 100/mês" },
];

// ── Seção 4 — Como funciona (v2 — assinatura) ─────────────────────────────

const passos = [
  {
    num: "1",
    emoji: "📋",
    titulo: "Escolha seu plano",
    texto: "Selecione o plano conforme o tamanho da sua usina. Básico, Padrão ou Plus — todos incluem 2 limpezas/ano e relatório mensal.",
  },
  {
    num: "2",
    emoji: "🧹",
    titulo: "1ª limpeza com 50% off",
    texto: "Um técnico certificado agenda em até 48h. Você paga metade do valor de uma limpeza avulsa para entrar no plano.",
  },
  {
    num: "3",
    emoji: "📊",
    titulo: "Acompanhe todo mês",
    texto: "Receba seu relatório mensal de performance diretamente no app. Saiba exatamente quanto sua usina está gerando vs. o esperado.",
  },
  {
    num: "4",
    emoji: "😌",
    titulo: "Relaxe",
    texto: "As próximas limpezas são agendadas automaticamente. Se precisar de uma limpeza extra, assinantes têm desconto especial.",
  },
];

// ── Planos de assinatura ──────────────────────────────────────────────────

const itensBase = [
  "2 limpezas/ano",
  "Relatório mensal",
  "Checkup técnico",
  "Seguro na limpeza",
  "1ª limpeza com 50% off",
];

// ─────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Mounts single IntersectionObserver for all .animate-on-scroll elements */}
      <ScrollAnimations />

      {/* ── Header fixo ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-brand-light border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Link
              href="/login"
              className="text-brand-dark/70 hover:text-brand-dark text-[12px] sm:text-sm font-medium transition-colors px-2 py-1.5 sm:px-3 whitespace-nowrap"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-brand-green text-white font-heading font-bold text-[12px] sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl whitespace-nowrap hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
              style={{ transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
            >
              Cadastrar-se
            </Link>
          </div>
        </div>
      </header>

      {/* ── Seção 1: Hero ────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Seção 2: Como se paga em 4 dias ──────────────────────────────── */}
      <section style={{ background: "#E8F0E4", paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <p className="text-brand-green uppercase tracking-widest mb-3" style={{ fontSize: "11px", letterSpacing: "0.1em", fontWeight: 600 }}>
              💡 Investimento que se paga rápido
            </p>
            <h2 className="font-heading font-extrabold text-brand-dark" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              Por que R$ 30/mês é o melhor investimento da sua usina?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paybackCards.map(({ Icon, plano, modulos, prejuizoMes, mensalidade }, idx) => (
              <div
                key={plano}
                className="flex flex-col animate-on-scroll overflow-hidden"
                style={{
                  border: "1px solid #C8DFC0",
                  borderRadius: "16px",
                  transitionDelay: `${idx * 150}ms`,
                }}
              >
                {/* Topo escuro — ícone + título + faixa */}
                <div
                  className="relative overflow-hidden"
                  style={{ background: "#1B3A2D", padding: "1.5rem" }}
                >
                  <BannerParticles />
                  <div className="relative flex items-center gap-3" style={{ zIndex: 2 }}>
                    <Icon />
                    <div>
                      <h3 className="font-heading font-bold" style={{ fontSize: "20px", color: "#ffffff", lineHeight: 1.2 }}>
                        {plano}
                      </h3>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>{modulos}</p>
                    </div>
                  </div>
                </div>

                {/* Base branca — valores + CTA */}
                <div className="flex flex-col gap-4 flex-1 bg-white" style={{ padding: "1.5rem" }}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#7A9A84" }}>Prejuízo/mês por sujeira</span>
                      <span className="font-bold" style={{ color: "#E24B4A" }}>{prejuizoMes}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#7A9A84" }}>Mensalidade</span>
                      <span className="font-bold" style={{ color: "#1B3A2D" }}>{mensalidade}</span>
                    </div>
                  </div>
                  <div
                    className="mt-auto rounded-xl px-4 py-2.5 text-center"
                    style={{ background: "#3DC45A1A" }}
                  >
                    <span className="font-heading font-bold text-sm" style={{ color: "#3DC45A" }}>
                      ✅ Se paga em ~4 dias
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 3: Calculadora — slide from left ───────────────────────── */}
      <div className="animate-on-scroll animate-slide-left">
        <CalculadoraEconomia />
      </div>

      <div style={{ width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #3DC45A, transparent)' }} />

      {/* ── Seção de planos ──────────────────────────────────────────────── */}
      <section id="planos" className="pt-20 pb-20 animate-on-scroll bg-brand-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-brand-dark mb-3" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              Escolha o plano ideal para sua usina
            </h2>
            <p className="max-w-xl mx-auto text-brand-muted" style={{ fontSize: "1.1rem", fontWeight: 400, maxWidth: "600px" }}>
              Todos os planos incluem 2 limpezas/ano, relatório mensal, checkup técnico e seguro na limpeza.
            </p>
          </div>

          {/* Cards — todos iguais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* Básico */}
            <div
              className="bg-white flex flex-col gap-5 animate-on-scroll hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(27,58,45,0.12)]"
              style={{ border: "1px solid #C8DFC0", borderRadius: "20px", padding: "2.5rem", transitionDelay: "0ms", transition: "transform 200ms ease-out, box-shadow 200ms ease-out" }}
            >
              <div>
                <p className="font-heading font-semibold text-brand-dark" style={{ fontSize: "20px" }}>Básico</p>
                <p className="text-brand-muted" style={{ fontSize: "14px", marginTop: "2px" }}>até 15 módulos</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-brand-dark" style={{ fontSize: "52px", lineHeight: 1 }}>R$ 30</span>
                <span className="text-brand-muted" style={{ fontSize: "18px" }}>/mês</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #C8DFC0" }} />
              <ul className="flex flex-col gap-2.5 flex-1">
                {itensBase.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-green font-bold mt-0.5">✓</span>
                    <span className="text-brand-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className="block w-full text-center font-heading font-bold text-sm px-6 py-3.5 rounded-xl hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ background: "#3DC45A", color: "#1B3A2D", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Começar com Básico
              </Link>
            </div>

            {/* Padrão */}
            <div
              className="bg-white flex flex-col gap-5 animate-on-scroll hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(27,58,45,0.12)]"
              style={{ border: "1px solid #C8DFC0", borderRadius: "20px", padding: "2.5rem", transitionDelay: "150ms", transition: "transform 200ms ease-out, box-shadow 200ms ease-out" }}
            >
              <div>
                <p className="font-heading font-semibold text-brand-dark" style={{ fontSize: "20px" }}>Padrão</p>
                <p className="text-brand-muted" style={{ fontSize: "14px", marginTop: "2px" }}>16 a 30 módulos</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-brand-dark" style={{ fontSize: "52px", lineHeight: 1 }}>R$ 50</span>
                <span className="text-brand-muted" style={{ fontSize: "18px" }}>/mês</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #C8DFC0" }} />
              <ul className="flex flex-col gap-2.5 flex-1">
                {itensBase.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-green font-bold mt-0.5">✓</span>
                    <span className="text-brand-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className="block w-full text-center font-heading font-bold text-sm px-6 py-3.5 rounded-xl hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ background: "#3DC45A", color: "#1B3A2D", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Começar com Padrão
              </Link>
            </div>

            {/* Plus */}
            <div
              className="bg-white flex flex-col gap-5 animate-on-scroll hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(27,58,45,0.12)]"
              style={{ border: "1px solid #C8DFC0", borderRadius: "20px", padding: "2.5rem", transitionDelay: "300ms", transition: "transform 200ms ease-out, box-shadow 200ms ease-out" }}
            >
              <div>
                <p className="font-heading font-semibold text-brand-dark" style={{ fontSize: "20px" }}>Plus</p>
                <p className="text-brand-muted" style={{ fontSize: "14px", marginTop: "2px" }}>31 a 60 módulos</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-brand-dark" style={{ fontSize: "52px", lineHeight: 1 }}>R$ 100</span>
                <span className="text-brand-muted" style={{ fontSize: "18px" }}>/mês</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #C8DFC0" }} />
              <ul className="flex flex-col gap-2.5 flex-1">
                {[...itensBase, "Alertas de queda de performance"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-green font-bold mt-0.5">✓</span>
                    <span className="text-brand-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className="block w-full text-center font-heading font-bold text-sm px-6 py-3.5 rounded-xl hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ background: "#3DC45A", color: "#1B3A2D", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Começar com Plus
              </Link>
            </div>
          </div>

          {/* Link Pro */}
          <p className="text-center mt-10 animate-on-scroll">
            <Link href="/cadastro" className="text-sm text-brand-muted hover:text-brand-dark transition-colors">
              Usina com 60+ módulos? Fale conosco sobre o Plano Pro →
            </Link>
          </p>

          {/* Avulso discreto */}
          <div className="mt-8 pt-8 border-t border-brand-border text-center animate-on-scroll">
            <p className="text-brand-muted text-sm mb-3">Prefere uma limpeza sem compromisso?</p>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-brand-muted hover:bg-brand-green hover:text-brand-dark hover:border-brand-green"
              style={{ border: "1px solid #C8DFC0", transition: "background 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out" }}
            >
              Solicitar limpeza avulsa →
            </Link>
            <p className="text-xs text-brand-muted mt-3" style={{ opacity: 0.7 }}>
              Valores a partir de R$ 30/placa · Sem contrato
            </p>
          </div>

        </div>
      </section>

      {/* ── Como funciona ────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-on-scroll">
            <p className="text-brand-green uppercase tracking-widest mb-3" style={{ fontSize: "11px", letterSpacing: "0.1em", fontWeight: 600 }}>
              🚀 Processo simples
            </p>
            <h2 className="font-heading font-extrabold text-brand-dark" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              Comece em 4 passos
            </h2>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:flex items-start gap-0">
            {passos.map((passo, idx) => (
              <div
                key={passo.num}
                className="flex-1 flex flex-col items-center relative animate-on-scroll"
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                {idx < passos.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-full h-0.5 bg-brand-border" />
                )}
                <div className="relative z-10 h-16 w-16 rounded-full bg-brand-green flex items-center justify-center text-white font-heading font-extrabold text-2xl shadow-lg mb-4">
                  {passo.num}
                </div>
                <span className="text-3xl mb-3">{passo.emoji}</span>
                <h3 className="font-heading font-bold text-brand-dark text-center text-sm mb-2 px-4">
                  {passo.titulo}
                </h3>
                <p className="text-brand-muted text-xs text-center leading-relaxed px-4" style={{ minHeight: "80px" }}>
                  {passo.texto}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical list */}
          <div className="md:hidden space-y-6">
            {passos.map((passo, idx) => (
              <div
                key={passo.num}
                className="flex items-start gap-5 animate-on-scroll"
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center text-white font-heading font-extrabold flex-shrink-0" style={{ fontSize: "14px" }}>
                  {passo.num}
                </div>
                <div>
                  <p className="text-xl mb-1">{passo.emoji}</p>
                  <h3 className="font-heading font-bold text-brand-dark text-sm mb-1">{passo.titulo}</h3>
                  <p className="text-brand-muted text-xs leading-relaxed">{passo.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prova social ─────────────────────────────────────────────────── */}
      <section style={{ background: "#EBF3E8" }} className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-10 animate-on-scroll">
            <h2 className="font-heading font-bold text-brand-dark" style={{ fontSize: "1.5rem" }}>
              Resultados que falam por si
            </h2>
            <p className="text-brand-muted text-sm mt-2">
              Dados do nosso período de validação em SC
            </p>
          </div>

          {/* Big numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 animate-on-scroll">
            {[
              { counter: <AnimatedCounter target={500} suffix="+" duration={1500} />, label: "Usinas monitoradas em SC" },
              { counter: <AnimatedCounter target={100} suffix="%" duration={1500} />, label: "Clientes satisfeitos" },
              { counter: <AnimatedCounter target={4} suffix=" dias" fadeOnly delay={500} />, label: "Tempo médio para recuperar o investimento" },
            ].map(({ counter, label }) => (
              <div key={label} className="text-center">
                <p className="font-heading font-extrabold text-brand-green" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1 }}>
                  {counter}
                </p>
                <p className="text-brand-muted text-xs sm:text-sm mt-2 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* Depoimentos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { iniciais: "CM", nome: "Carlos Mendonça", cidade: "Jaraguá do Sul", texto: "Assino há 4 meses e a diferença na geração foi visível logo após a primeira limpeza. O relatório mensal é excelente." },
              { iniciais: "AP", nome: "Ana Paula Ritter", cidade: "Pomerode", texto: "Finalmente uma solução que faz sentido para quem tem usina solar. O técnico foi pontual e profissional." },
              { iniciais: "RS", nome: "Roberto Schaefer", cidade: "Florianópolis", texto: "Recuperei o investimento da assinatura em menos de uma semana. Recomendo para todo dono de painel solar." },
            ].map(({ iniciais, nome, cidade, texto }) => (
              <div
                key={nome}
                className="bg-white rounded-2xl animate-on-scroll flex flex-col gap-4 hover:-translate-y-0.5"
                style={{ padding: "1.5rem", border: "1px solid #C8DFC0", transition: "transform 200ms ease-out" }}
              >
                <p className="text-brand-dark text-sm leading-relaxed flex-1">&ldquo;{texto}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0"
                    style={{ background: "#3DC45A", color: "#1B3A2D" }}
                  >
                    {iniciais}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-brand-dark text-sm">{nome}</p>
                    <p className="text-brand-muted text-xs">{cidade}, SC</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <p className="text-brand-green uppercase tracking-widest mb-3" style={{ fontSize: "11px", letterSpacing: "0.1em", fontWeight: 600 }}>
              ⭐ Por que a Painel Clean
            </p>
            <h2 className="font-heading font-extrabold text-brand-dark" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              O serviço que sua usina merece
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                svg: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="10" r="6" stroke="#3DC45A" strokeWidth="2"/>
                    <path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#3DC45A" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M11 10l3 3 6-6" stroke="#3DC45A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                titulo: "Técnicos certificados",
                texto: "Todos os técnicos passam por treinamento e têm seguro de responsabilidade civil.",
              },
              {
                svg: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="20" height="24" rx="3" stroke="#3DC45A" strokeWidth="2"/>
                    <rect x="10" y="10" width="7" height="7" rx="1" stroke="#3DC45A" strokeWidth="1.5"/>
                    <line x1="19" y1="11" x2="23" y2="11" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="19" y1="14" x2="23" y2="14" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="10" y1="20" x2="23" y2="20" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="10" y1="23" x2="20" y2="23" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                titulo: "Relatório fotográfico",
                texto: "Fotos antes e depois de cada limpeza com checklist completo do serviço realizado.",
              },
              {
                svg: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4L6 8v8c0 5.523 4.477 10 10 10s10-4.477 10-10V8L16 4Z" stroke="#3DC45A" strokeWidth="2"/>
                    <path d="M11 16l3 3 7-7" stroke="#3DC45A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                titulo: "Seguro na limpeza",
                texto: "Cobertura contra danos causados durante a execução — equipamentos e estrutura.",
              },
              {
                svg: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="24" height="16" rx="3" stroke="#3DC45A" strokeWidth="2"/>
                    <circle cx="16" cy="16" r="4" stroke="#3DC45A" strokeWidth="2"/>
                    <line x1="4" y1="13" x2="8" y2="13" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="24" y1="19" x2="28" y2="19" stroke="#3DC45A" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                titulo: "Preço transparente",
                texto: "Mensalidade fixa, sem surpresas. Saiba exatamente o que está pagando a cada mês.",
              },
            ].map(({ svg, titulo, texto }) => (
              <div
                key={titulo}
                className="flex flex-col items-center text-center gap-3 animate-on-scroll"
                style={{ padding: "2rem 1.5rem", border: "1px solid #C8DFC0", borderRadius: "16px" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "#EBF3E8" }}
                >
                  {svg}
                </div>
                <h3 className="font-heading font-bold text-brand-dark text-sm">{titulo}</h3>
                <p className="text-brand-muted text-xs leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seja um técnico ───────────────────────────────────────────────── */}
      <section className="bg-brand-dark py-20 animate-on-scroll relative overflow-hidden">
        <TecnicoParticles />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-brand-green font-semibold text-sm uppercase tracking-widest mb-3">
                🔧 Para profissionais
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Seja um técnico Painel Clean
              </h2>
              <p className="text-white/70 text-lg mb-8">
                Atenda assinantes fixos na sua região. Agenda garantida, sem depender de chamados avulsos.
              </p>
              <Link
                href="/cadastro?role=tecnico"
                className="inline-flex items-center gap-2 bg-brand-green text-white font-heading font-bold text-base px-8 py-4 rounded-xl hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Cadastrar como técnico →
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { icon: "📅", titulo: "Agenda previsível",    texto: "Atenda assinantes fixos com limpezas programadas. Saiba com antecedência quando vai trabalhar." },
                { icon: "💰", titulo: "Repasse simplificado", texto: "Receba via PIX automaticamente após a conclusão de cada serviço. Sem burocracia." },
                { icon: "📱", titulo: "Gerencie pelo app",    texto: "Aceite chamados, registre relatórios e acompanhe seus ganhos em tempo real." },
                { icon: "🛡️", titulo: "Seguro incluso",       texto: "Todos os serviços incluem cobertura contra danos acidentais durante a limpeza." },
              ].map(({ icon, titulo, texto }) => (
                <div key={titulo} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="text-2xl">{icon}</span>
                  <p className="font-heading font-bold text-white text-sm mt-2 mb-1">{titulo}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────── */}
      <section className="py-20 animate-on-scroll" style={{ background: "#EBF3E8" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-extrabold text-brand-dark mb-4" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
            Pronto para maximizar sua geração solar?
          </h2>
          <p className="mb-8 mx-auto text-brand-muted" style={{ fontSize: "1.1rem", fontWeight: 400, maxWidth: "600px" }}>
            Junte-se a mais de 500 usinas monitoradas em Santa Catarina. Comece com a 1ª limpeza com 50% off.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#planos"
              className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm px-8 py-4 rounded-xl hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
              style={{ background: "#3DC45A", color: "#1B3A2D", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
            >
              Ver planos →
            </Link>
            <a
              href="#calculadora"
              className="inline-flex items-center justify-center gap-2 font-heading font-semibold text-sm px-8 py-4 rounded-xl hover:bg-brand-green hover:text-brand-dark"
              style={{ border: "1px solid #C8DFC0", color: "#1B3A2D", transition: "background 150ms ease-out, color 150ms ease-out" }}
            >
              Calcular minha economia
            </a>
          </div>
        </div>
      </section>

      {/* ── Onde atuamos ─────────────────────────────────────────────────── */}
      <section className="py-20 animate-on-scroll" style={{ background: "#1B3A2D" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

            {/* Coluna esquerda */}
            <div className="flex flex-col" style={{ justifyContent: "space-between", minHeight: "320px" }}>
              <div>
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
                  style={{ background: "#3DC45A22", color: "#3DC45A" }}
                >
                  Cobertura atual
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
                  Atendemos 3 cidades em SC
                </h2>
                <p className="text-white/60 text-base mb-7">
                  Com expansão para mais 4 cidades no segundo semestre de 2026.
                </p>
                <ul className="flex flex-col gap-3 mb-8">
                  {["Jaraguá do Sul", "Pomerode", "Florianópolis"].map((cidade) => (
                    <li key={cidade} className="flex items-center gap-3">
                      <span className="font-bold flex-shrink-0" style={{ color: "#3DC45A" }}>✓</span>
                      <span className="text-white text-sm">{cidade}, SC</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm px-6 py-3.5 self-start hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ background: "#3DC45A", color: "#1B3A2D", borderRadius: "8px", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Quero assinar agora →
              </Link>
            </div>

            {/* Coluna direita */}
            <div
              className="w-full rounded-2xl flex flex-col gap-5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "1.25rem" }}
            >
              <p className="font-heading font-bold text-white" style={{ fontSize: "20px", fontWeight: 700 }}>🕐 Em breve</p>
              <ul className="flex flex-col gap-4">
                {[
                  { emoji: "🏭", cidade: "Blumenau", fila: 47 },
                  { emoji: "⚓", cidade: "Itajaí",   fila: 23 },
                  { emoji: "🧵", cidade: "Brusque",  fila: 31 },
                  { emoji: "🌿", cidade: "Gaspar",   fila: 18 },
                ].map(({ emoji, cidade, fila }) => (
                  <li key={cidade} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">{emoji}</span>
                      <span className="text-white text-sm">{cidade}, SC</span>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: "#3DC45A22", color: "#3DC45A" }}
                    >
                      {fila} na fila
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-white/50 text-sm leading-relaxed border-t border-white/10 pt-4">
                Cadastre-se para ser notificado quando chegarmos na sua cidade.
              </p>
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm px-5 py-3 rounded-xl text-center hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_4px_16px_rgba(61,196,90,0.35)] active:scale-[0.98]"
                style={{ background: "#3DC45A", color: "#1B3A2D", transition: "transform 150ms ease-out, box-shadow 150ms ease-out" }}
              >
                Entrar na lista de espera →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-brand-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Logo inverted size="sm" />
              <p className="text-white/50 text-xs mt-3 leading-relaxed max-w-xs">
                Plataforma de assinatura para limpeza profissional de painéis solares. Conectando donos de usinas a técnicos certificados.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-white/80 font-semibold text-sm mb-4">Links</p>
              <div className="space-y-2 text-white/50 text-sm">
                <p><a href="#hero" className="hover:text-white/80 transition-colors">Início</a></p>
                <p><a href="#calculadora" className="hover:text-white/80 transition-colors">Calculadora</a></p>
                <p><a href="#planos" className="hover:text-white/80 transition-colors">Planos</a></p>
                <p><Link href="/login" className="hover:text-white/80 transition-colors">Entrar</Link></p>
                <p><Link href="/cadastro" className="hover:text-white/80 transition-colors">Cadastrar-se</Link></p>
                <p><Link href="/termos" className="hover:text-white/80 transition-colors">Termos de Uso</Link></p>
              </div>
            </div>

            {/* Cidades */}
            <div>
              <p className="text-white/80 font-semibold text-sm mb-4">Cidades atendidas</p>
              <div className="space-y-1.5 text-white/50 text-sm">
                <p>📍 Jaraguá do Sul, SC</p>
                <p>📍 Pomerode, SC</p>
                <p>📍 Florianópolis, SC</p>
              </div>
              <p className="text-white/30 text-xs mt-4">
                Expansão para novas cidades em breve
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} Painel Clean. Todos os direitos reservados.
            </p>
            <a
              href="https://painelclean.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 text-xs hover:text-white/60 transition-colors"
            >
              painelclean.com.br ↗
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
