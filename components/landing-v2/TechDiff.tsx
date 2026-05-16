'use client';

import { COLORS, Particles, SectionHeadline, useIsMobile } from './shared';

export default function TechDiff() {
  const isMobile = useIsMobile(900);

  const cards = [
    {
      title: 'Monitoramento 24/7',
      body: 'API do seu inversor lida a cada 5 minutos. Sua geração sob vigilância contínua.',
      icon: '📡',
    },
    {
      title: 'Alerta proativo',
      body: 'Queda de 5% em média semanal dispara chamado automático — antes de você sentir na conta.',
      icon: '🔔',
    },
    {
      title: 'Dashboard completo',
      body: 'Comparativo histórico, curva de geração, dias atípicos. Mais rico que o app nativo do seu inversor.',
      icon: '📈',
    },
  ];

  const inverters = ['Fronius', 'SolarEdge', 'Growatt', 'Sungrow', 'Hoymiles', 'Deye'];

  return (
    <section
      style={{
        background: COLORS.dark,
        color: 'white',
        padding: isMobile ? '72px 20px' : '104px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Particles count={22} color="rgba(61,196,90,0.18)" />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <SectionHeadline
          dark
          eyebrow="⚡ DIFERENCIAL EXCLUSIVO"
          title={
            <>
              O único que se conecta
              <br />
              direto no seu inversor.
            </>
          }
          subtitle="Enquanto outros só lavam, a gente monitora. Detectamos quedas ANTES de virar prejuízo."
        />

        <div style={{ marginTop: isMobile ? 40 : 56, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 12,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              margin: '0 0 20px',
              fontWeight: 600,
            }}
          >
            Compatível com os principais inversores:
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: isMobile ? '16px 28px' : '20px 48px',
              alignItems: 'center',
            }}
          >
            {inverters.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: isMobile ? 17 : 22,
                  color: 'rgba(255,255,255,0.82)',
                  letterSpacing: '.01em',
                  transition: 'color 200ms ease, background 200ms ease',
                  padding: '8px 14px',
                  borderRadius: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.green;
                  e.currentTarget.style.background = 'rgba(61,196,90,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {name}
              </span>
            ))}
          </div>
          <p
            style={{
              marginTop: 14,
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.38)',
              fontStyle: 'italic',
            }}
          >
            Marcas registradas de seus respectivos proprietários.
          </p>
        </div>

        <div
          style={{
            marginTop: isMobile ? 48 : 72,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {cards.map((c, i) => (
            <div
              key={c.title}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(61,196,90,0.22)',
                borderRadius: 16,
                padding: isMobile ? 22 : 28,
                transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                animation: `pc-slideup .6s ${i * 0.1}s ease both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(61,196,90,0.08)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.22)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(61,196,90,0.14)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                {c.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 700,
                  fontSize: 19,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-.01em',
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.72)',
                  margin: '10px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
