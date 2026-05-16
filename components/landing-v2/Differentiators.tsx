'use client';

import { COLORS, SectionHeadline, useIsMobile } from './shared';

type IconName = 'monitor' | 'camera' | 'shield' | 'check' | 'bolt' | 'bell';

function SvgIcon({ name }: { name: IconName }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: '0 0 28 28',
    fill: 'none' as const,
    stroke: COLORS.green,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'monitor':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="22" height="16" rx="2" />
          <polyline points="7,16 11,12 15,14 19,8 23,11" />
          <circle cx="23" cy="11" r="1.5" fill={COLORS.green} />
        </svg>
      );
    case 'camera':
      return (
        <svg {...props}>
          <rect x="3" y="7" width="22" height="16" rx="2" />
          <circle cx="14" cy="15" r="4" />
          <path d="M 9 7 L 11 4 L 17 4 L 19 7" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M 14 3 L 23 6 V 14 C 23 19 19 23 14 25 C 9 23 5 19 5 14 V 6 Z" />
          <path d="M 10 14 L 13 17 L 18 11" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <circle cx="14" cy="14" r="11" />
          <path d="M 9 14 L 13 18 L 19 10" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...props}>
          <path d="M 15 3 L 6 16 L 13 16 L 11 25 L 20 12 L 13 12 Z" fill={COLORS.green} fillOpacity="0.15" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props}>
          <path d="M 7 11 A 7 7 0 0 1 21 11 V 17 L 23 20 H 5 L 7 17 Z" />
          <path d="M 11 23 A 3 3 0 0 0 17 23" />
        </svg>
      );
  }
}

export default function Differentiators() {
  const isMobile = useIsMobile(900);

  const items: { icon: IconName; title: string; body: string; exclusive?: boolean }[] = [
    {
      icon: 'monitor',
      title: 'Monitoramento via inversor',
      exclusive: true,
      body: 'Conectamos direto ao seu Growatt, Fronius, Deye. Se a geração cair, a gente sabe antes da conta de luz.',
    },
    {
      icon: 'camera',
      title: 'Relatório fotográfico',
      body: 'Cada limpeza com 12+ fotos antes/depois, medição de performance e checklist técnico. Sem achismo.',
    },
    {
      icon: 'shield',
      title: 'Seguro contra danos',
      body: '100% protegido. Se algo acontecer durante a limpeza, a plataforma cobre — não você, não o técnico.',
    },
    {
      icon: 'check',
      title: 'Técnicos certificados',
      body: 'Avaliados, treinados em NR-35 e equipamento técnico. Nota mínima 4,7 para continuar ativos.',
    },
    {
      icon: 'bolt',
      title: 'Emergencial incluso',
      body: 'Chuva de poeira, obra na vizinhança? Vamos lá fora de cronograma — sem taxa extra.',
    },
    {
      icon: 'bell',
      title: 'Alerta proativo',
      body: 'Queda de 5% na geração dispara alerta automático. Agendamos antes do problema virar prejuízo.',
    },
  ];

  return (
    <section
      id="diferenciais"
      style={{
        background: COLORS.bg,
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="✨ POR QUE PAINEL CLEAN"
          title="Não é só lavar placa. É manter sua usina produzindo."
          subtitle="Outros limpam e vão embora. A gente acompanha, mede e avisa quando algo muda."
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 14 : 20,
          }}
        >
          {items.map((it, i) => (
            <div
              key={it.title}
              style={{
                position: 'relative',
                background: 'white',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: isMobile ? 22 : 28,
                transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                boxShadow: '0 2px 12px rgba(27,58,45,0.05)',
                animation: `pc-slideup .5s ${i * 0.06}s ease both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(27,58,45,0.12)';
                e.currentTarget.style.borderColor = COLORS.green;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(27,58,45,0.05)';
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              {it.exclusive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: COLORS.green,
                    color: 'white',
                    fontFamily: "'Open Sans',sans-serif",
                    fontWeight: 800,
                    fontSize: 9.5,
                    letterSpacing: '.1em',
                    padding: '4px 9px',
                    borderRadius: 9999,
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(61,196,90,0.35)',
                  }}
                >
                  Exclusivo
                </span>
              )}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: COLORS.light,
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 18,
                }}
              >
                <SvgIcon name={it.icon} />
              </div>
              <h3
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  color: COLORS.dark,
                  margin: 0,
                  letterSpacing: '-.01em',
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(27,58,45,0.68)',
                  margin: '10px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
