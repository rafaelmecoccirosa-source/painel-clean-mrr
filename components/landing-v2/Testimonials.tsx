'use client';

import { Badge, COLORS, SectionHeadline, useIsMobile } from './shared';

export default function Testimonials() {
  const isMobile = useIsMobile(900);

  const items = [
    {
      name: 'Marcos R.',
      city: 'Jaraguá do Sul',
      kwp: '8,8 kWp',
      plan: 'Padrão',
      initials: 'MR',
      quote:
        'Em 3 meses a conta voltou pro que era no primeiro ano. O relatório com foto me convenceu — vi a sujeira que tinha na placa.',
    },
    {
      name: 'Aline F.',
      city: 'Pomerode',
      kwp: '5,5 kWp',
      plan: 'Básico',
      initials: 'AF',
      quote:
        'Contratei pelo monitoramento. Na segunda semana, me avisaram que uma placa estava sombreada por um galho. Resolveram no mesmo dia.',
    },
    {
      name: 'Eduardo C.',
      city: 'Florianópolis',
      kwp: '14,3 kWp',
      plan: 'Plus',
      initials: 'EC',
      quote:
        'Moro de frente pra praia. Maresia era inimiga do meu sistema. A limpeza a cada 6 meses mudou o jogo — e o app ficou melhor que o do inversor.',
    },
  ];

  return (
    <section
      id="depoimentos"
      style={{
        background: 'white',
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="💚 HISTÓRIAS REAIS"
          title="Quem assinou, não volta pro jeito antigo."
          subtitle="Mais de 2.400 usinas monitoradas em Santa Catarina."
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          {items.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: isMobile ? 22 : 28,
                transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                animation: `pc-slideup .5s ${i * 0.08}s ease both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px rgba(27,58,45,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 20 20" fill="#FBBF24">
                    <polygon points="10,1 12.5,7 19,7.5 14,12 15.5,19 10,15.5 4.5,19 6,12 1,7.5 7.5,7" />
                  </svg>
                ))}
              </div>

              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: COLORS.dark,
                  margin: '0 0 22px',
                  fontStyle: 'italic',
                  textWrap: 'pretty',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.dark})`,
                    color: 'white',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: '.02em',
                  }}
                >
                  {t.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: COLORS.dark,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 12,
                      color: COLORS.muted,
                      marginTop: 2,
                    }}
                  >
                    {t.city} · {t.kwp}
                  </div>
                </div>
                <Badge tone="greenSoft">{t.plan}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: isMobile ? 32 : 48,
            padding: isMobile ? '20px 20px' : '24px 32px',
            background: COLORS.dark,
            borderRadius: 16,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 16 : 0,
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 8,
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: 'white',
                letterSpacing: '-.02em',
              }}
            >
              4,9<span style={{ fontSize: 18, color: '#FBBF24' }}>★</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>/5</span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'Open Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              avaliação média
            </div>
          </div>
          <div
            style={{
              borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.12)',
              borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: 'white',
                letterSpacing: '-.02em',
              }}
            >
              830<span style={{ color: COLORS.green }}>+</span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'Open Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              avaliações verificadas
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: 'white',
                letterSpacing: '-.02em',
              }}
            >
              92<span style={{ color: COLORS.green }}>%</span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'Open Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              renovam após 12 meses
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
