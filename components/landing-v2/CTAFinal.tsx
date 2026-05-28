'use client';

import { useIsMobile } from './shared';

const DARK = '#1B3A2D';
const GREEN = '#3DC45A';
const EYEBROW_GREEN = '#7DD891';
const ORB_LIGHT = '#93E0A6';

const STATS = [
  { pos: { top: '8%', left: '-8%' },    value: '+30%',     label: 'geração com limpeza em dia' },
  { pos: { bottom: '12%', right: '-12%' }, value: 'R$ 1.284', label: 'economia média/ano' },
  { pos: { bottom: '-4%', left: '20%' }, value: '4,9★',    label: 'avaliação clientes' },
];

const TRUST = ['1ª limpeza em até 48h', 'Contrato 12 meses', 'Seguro até R$ 50k', 'Sem fidelidade no 1º mês'];

export default function CTAFinal() {
  const isMobile = useIsMobile(900);

  return (
    <section
      style={{
        padding: isMobile ? '40px 16px 56px' : '80px 32px 96px',
        background: '#F4F8F2',
      }}
    >
      <style>{`
        @keyframes ctaOrbSpin        { to { transform: rotate(360deg);  } }
        @keyframes ctaOrbSpinReverse { to { transform: rotate(-360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .cta-orb-spin, .cta-orb-ring-spin { animation: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            background: DARK,
            color: 'white',
            borderRadius: isMobile ? 20 : 28,
            padding: isMobile ? '40px 28px' : '64px 56px',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
            gap: isMobile ? 36 : 56,
            alignItems: 'center',
          }}
        >
          {/* Decorative radial gradients */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(circle at 80% 20%, rgba(61,196,90,0.28), transparent 42%),
                radial-gradient(circle at 10% 80%, rgba(61,196,90,0.12), transparent 42%)
              `,
              pointerEvents: 'none',
            }}
          />

          {/* ── Left column — content ── */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: "'Open Sans',sans-serif",
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: EYEBROW_GREEN,
              }}
            >
              <span style={{ width: 28, height: 1.5, background: EYEBROW_GREEN, display: 'block', flexShrink: 0 }} />
              🎁 Oferta de lançamento
            </div>

            <h2
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: 'white',
                margin: '16px 0 18px',
                textWrap: 'balance' as 'balance',
              }}
            >
              Pare de pagar pela sujeira do seu painel solar.
            </h2>

            <p
              style={{
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 17,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.75)',
                maxWidth: 460,
                margin: '0 0 28px',
              }}
            >
              Assine hoje e ganhe{' '}
              <strong style={{ color: 'white', fontWeight: 700 }}>50% off na 1ª limpeza</strong>
              . A partir de R$ 30/mês. Primeira visita em até 48h.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="#planos"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '15px 26px',
                  borderRadius: 12,
                  background: GREEN,
                  color: 'white',
                  fontFamily: "'Open Sans',sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  border: '1px solid transparent',
                  boxShadow: '0 4px 14px rgba(61,196,90,0.35)',
                  cursor: 'pointer',
                  transition: 'transform .15s cubic-bezier(.22,1,.36,1), background .2s, box-shadow .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#2DAF4A';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(61,196,90,0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = GREEN;
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(61,196,90,0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Assinar agora
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>

              <a
                href="https://wa.me/5547997175878"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '15px 26px',
                  borderRadius: 12,
                  background: 'transparent',
                  color: 'white',
                  fontFamily: "'Open Sans',sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'transform .15s cubic-bezier(.22,1,.36,1), background .2s, border-color .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                Falar com especialista
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px 24px',
                marginTop: 26,
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {TRUST.map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: GREEN, fontWeight: 900 }}>✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column — Orb ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              ...(isMobile ? { maxWidth: 340, margin: '0 auto', width: '100%' } : {}),
            }}
          >
            {/* Dashed ring */}
            <div
              className="cta-orb-ring-spin"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.18)',
                animation: 'ctaOrbSpinReverse 30s linear infinite',
              }}
            />

            {/* Orb */}
            <div
              className="cta-orb-spin"
              style={{
                position: 'absolute',
                inset: '12%',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${ORB_LIGHT}, ${GREEN} 45%, ${DARK} 85%)`,
                boxShadow: '0 0 80px rgba(61,196,90,0.5), inset -20px -30px 60px rgba(0,0,0,0.3)',
                animation: 'ctaOrbSpin 20s linear infinite',
              }}
            >
              {/* Glare */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), transparent 30%)',
                }}
              />
            </div>

            {/* Stat cards */}
            {STATS.map(({ pos, value, label }) => (
              <div
                key={value}
                style={{
                  position: 'absolute',
                  ...pos,
                  background: 'rgba(255,255,255,0.96)',
                  color: DARK,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 11,
                  lineHeight: 1.35,
                  boxShadow: '0 10px 25px rgba(27,58,45,0.18)',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                <strong
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 900,
                    fontSize: 18,
                    color: DARK,
                    display: 'block',
                  }}
                >
                  {value}
                </strong>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
