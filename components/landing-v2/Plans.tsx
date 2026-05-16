'use client';

import { Button, COLORS, Particles, SectionHeadline, useIsMobile } from './shared';

type Plan = {
  name: string;
  modulos: string;
  price: number;
  ideal: string;
  dark: boolean;
  features: string[];
};

export default function Plans() {
  const isMobile = useIsMobile(900);

  const plans: Plan[] = [
    {
      name: 'Básico',
      modulos: 'Até 15 módulos',
      price: 30,
      ideal: 'Residência compacta',
      dark: false,
      features: [
        '2 limpezas por ano',
        'Monitoramento 24/7',
        'Relatório fotográfico mensal',
        'Alerta proativo',
        'Suporte via WhatsApp',
      ],
    },
    {
      name: 'Padrão',
      modulos: '16 a 30 módulos',
      price: 50,
      ideal: 'Residência média/grande',
      dark: false,
      features: [
        '3 limpezas por ano',
        'Monitoramento 24/7',
        'Relatório fotográfico mensal',
        'Alerta proativo + semanal',
        'Checkup técnico anual',
        'Emergencial incluso',
      ],
    },
    {
      name: 'Plus',
      modulos: '31 a 60 módulos',
      price: 100,
      ideal: 'Comercial ou usina grande',
      dark: true,
      features: [
        '4 limpezas por ano',
        'Monitoramento 24/7 + API',
        'Relatório fotográfico mensal',
        'Alerta proativo instantâneo',
        'Checkup técnico semestral',
        'Emergencial incluso',
        'Gerente de conta dedicado',
      ],
    },
  ];

  return (
    <section
      id="planos"
      style={{
        background: COLORS.bg,
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="💰 PLANOS POR TAMANHO DA USINA"
          title="Escolha pelo número de módulos."
          subtitle="Sem taxa de adesão. 1ª limpeza com 50% off. Contrato de 12 meses."
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {plans.map((p, i) => {
            const dark = p.dark;
            return (
              <div
                key={p.name}
                style={{
                  position: 'relative',
                  background: dark ? COLORS.dark : 'white',
                  color: dark ? 'white' : COLORS.dark,
                  border: dark ? '1px solid rgba(61,196,90,0.3)' : `1px solid ${COLORS.border}`,
                  borderRadius: 18,
                  padding: isMobile ? 26 : 32,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: dark ? '0 16px 40px rgba(27,58,45,0.3)' : '0 2px 14px rgba(27,58,45,0.05)',
                  transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                  animation: `pc-slideup .5s ${i * 0.08}s ease both`,
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                {dark && <Particles count={6} color="rgba(61,196,90,0.2)" />}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      letterSpacing: '-.01em',
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 13,
                      color: dark ? 'rgba(255,255,255,0.65)' : COLORS.muted,
                      fontWeight: 600,
                    }}
                  >
                    {p.modulos}
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 18,
                        color: dark ? 'rgba(255,255,255,0.7)' : COLORS.muted,
                        fontWeight: 700,
                      }}
                    >
                      R$
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 900,
                        fontSize: isMobile ? 52 : 64,
                        letterSpacing: '-.03em',
                        lineHeight: 1,
                        color: dark ? 'white' : COLORS.dark,
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: dark ? 'rgba(255,255,255,0.6)' : COLORS.muted,
                        fontWeight: 600,
                      }}
                    >
                      /mês
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 12.5,
                      color: dark ? '#6EE7A0' : COLORS.green,
                      fontWeight: 700,
                      letterSpacing: '.02em',
                    }}
                  >
                    Ideal: {p.ideal}
                  </div>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '24px 0 24px',
                      display: 'grid',
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    {p.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontFamily: "'Open Sans',sans-serif",
                          fontSize: 14,
                          lineHeight: 1.45,
                          color: dark ? 'rgba(255,255,255,0.85)' : COLORS.dark,
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ flexShrink: 0, marginTop: 1 }}
                        >
                          <circle cx="10" cy="10" r="9" fill={dark ? 'rgba(61,196,90,0.18)' : COLORS.light} />
                          <path
                            d="M 6 10 L 9 13 L 14 7"
                            stroke={dark ? '#6EE7A0' : COLORS.green}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={dark ? 'primary' : 'dark'} size="lg" fullWidth onClick={() => { window.location.href = '/cadastro'; }}>
                    Assinar {p.name} →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontFamily: "'Open Sans',sans-serif",
            fontSize: 14,
            color: COLORS.muted,
          }}
        >
          Usinas acima de 60 módulos ·{' '}
          <a
            href="#contato"
            style={{ color: COLORS.dark, fontWeight: 700, textDecoration: 'underline' }}
          >
            Fale com a gente para condição personalizada →
          </a>
        </p>
      </div>
    </section>
  );
}
