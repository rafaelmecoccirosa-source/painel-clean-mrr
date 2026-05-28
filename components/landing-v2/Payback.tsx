'use client';

import { COLORS, Particles, SectionHeadline, useIsMobile } from './shared';

type PaybackCard = {
  plano: string;
  range: string;
  prejuizoMes: string;
  mensalidade: string;
  icon: React.ReactNode;
};

const ICON_PROPS = {
  width: 34,
  height: 34,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: '#6EE7A0',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const PANEL_FILL = 'rgba(110,231,160,0.14)';
const SUN_FILL = 'rgba(110,231,160,0.22)';

function SunGlyph({ cx, cy, r, rays }: { cx: number; cy: number; r: number; rays: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SUN_FILL} />
      <line x1={cx} y1={cy - r - 3} x2={cx} y2={cy - r - 1} />
      <line x1={cx - r - 3} y1={cy} x2={cx - r - 1} y2={cy} />
      <line x1={cx + r + 1} y1={cy} x2={cx + r + 3} y2={cy} />
      {rays > 3 && (
        <>
          <line x1={cx - r - 2} y1={cy - r - 2} x2={cx - r} y2={cy - r} />
          <line x1={cx + r + 2} y1={cy - r - 2} x2={cx + r} y2={cy - r} />
        </>
      )}
    </g>
  );
}

function PanelBasicoIcon() {
  return (
    <svg {...ICON_PROPS}>
      <SunGlyph cx={24} cy={10} r={3.5} rays={3} />
      <rect x="15" y="22" width="18" height="20" rx="1.4" fill={PANEL_FILL} />
      <line x1="24" y1="22" x2="24" y2="42" />
      <line x1="15" y1="32" x2="33" y2="32" />
    </svg>
  );
}

function PanelPadraoIcon() {
  return (
    <svg {...ICON_PROPS}>
      <SunGlyph cx={24} cy={9} r={3} rays={5} />
      <rect x="4" y="22" width="18" height="20" rx="1.4" fill={PANEL_FILL} />
      <line x1="13" y1="22" x2="13" y2="42" />
      <line x1="4" y1="32" x2="22" y2="32" />
      <rect x="26" y="22" width="18" height="20" rx="1.4" fill={PANEL_FILL} />
      <line x1="35" y1="22" x2="35" y2="42" />
      <line x1="26" y1="32" x2="44" y2="32" />
    </svg>
  );
}

function PanelPlusIcon() {
  return (
    <svg {...ICON_PROPS}>
      <SunGlyph cx={24} cy={8} r={2.8} rays={5} />
      <rect x="2" y="24" width="13" height="18" rx="1.2" fill={PANEL_FILL} />
      <line x1="8.5" y1="24" x2="8.5" y2="42" />
      <line x1="2" y1="33" x2="15" y2="33" />
      <rect x="17.5" y="24" width="13" height="18" rx="1.2" fill={PANEL_FILL} />
      <line x1="24" y1="24" x2="24" y2="42" />
      <line x1="17.5" y1="33" x2="30.5" y2="33" />
      <rect x="33" y="24" width="13" height="18" rx="1.2" fill={PANEL_FILL} />
      <line x1="39.5" y1="24" x2="39.5" y2="42" />
      <line x1="33" y1="33" x2="46" y2="33" />
    </svg>
  );
}

export default function Payback() {
  const isMobile = useIsMobile(900);

  const cards: PaybackCard[] = [
    {
      plano: 'Plano Básico',
      range: 'até 15 módulos',
      prejuizoMes: 'R$ 218',
      mensalidade: 'R$ 30',
      icon: <PanelBasicoIcon />,
    },
    {
      plano: 'Plano Padrão',
      range: '16–30 módulos',
      prejuizoMes: 'R$ 365',
      mensalidade: 'R$ 50',
      icon: <PanelPadraoIcon />,
    },
    {
      plano: 'Plano Plus',
      range: '31–60 módulos',
      prejuizoMes: 'R$ 729',
      mensalidade: 'R$ 100',
      icon: <PanelPlusIcon />,
    },
  ];

  return (
    <section
      id="payback"
      style={{
        background: COLORS.dark,
        color: 'white',
        padding: isMobile ? '64px 20px' : '96px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Particles count={18} color="rgba(61,196,90,0.18)" />
      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <SectionHeadline
          dark
          eyebrow="⚡ SE PAGA EM ~4 DIAS"
          title="Por que R$ 30/mês é o melhor investimento da sua usina?"
          subtitle="Em qualquer plano, a assinatura se paga com o que você deixa de perder."
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          {cards.map((c, i) => (
            <div
              key={c.plano}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(61,196,90,0.22)',
                borderRadius: 18,
                padding: isMobile ? 24 : 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                animation: `pc-slideup .6s ${i * 0.08}s ease both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(61,196,90,0.08)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.22)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(61,196,90,0.14)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      color: 'white',
                      letterSpacing: '-.01em',
                      lineHeight: 1.15,
                    }}
                  >
                    {c.plano}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 12.5,
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 600,
                    }}
                  >
                    {c.range}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 4,
                  padding: '14px 16px',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: '#FDE68A',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Prejuízo/mês por sujeira
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 900,
                    fontSize: 30,
                    color: '#FBBF24',
                    letterSpacing: '-.025em',
                    lineHeight: 1,
                  }}
                >
                  {c.prejuizoMes}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 12.5,
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                  }}
                >
                  Mensalidade
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    color: '#6EE7A0',
                    letterSpacing: '-.02em',
                  }}
                >
                  {c.mensalidade}
                  <span
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 600,
                      marginLeft: 3,
                    }}
                  >
                    /mês
                  </span>
                </span>
              </div>

              <div
                style={{
                  marginTop: 4,
                  padding: '10px 14px',
                  background: 'rgba(61,196,90,0.12)',
                  border: '1px solid rgba(61,196,90,0.3)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#6EE7A0',
                }}
              >
                <span style={{ fontSize: 15 }}>✅</span>
                <span>Se paga em ~4 dias</span>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontFamily: "'Open Sans',sans-serif",
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          Premissas: módulos 550Wp · 130 kWh/kWp/mês · tarifa R$ 0,92/kWh · sujeira acumulada ~6 meses
        </p>
      </div>
    </section>
  );
}
