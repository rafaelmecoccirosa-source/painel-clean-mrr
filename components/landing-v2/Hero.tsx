'use client';

import { Button, COLORS, HERO_PHOTO, Particles, useIsMobile } from './shared';

export default function Hero() {
  const isMobile = useIsMobile(900);

  const heroBg = `
    radial-gradient(ellipse at 30% 40%, rgba(61,196,90,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 60%, rgba(27,58,45,0.85) 0%, rgba(15,36,25,1) 60%),
    linear-gradient(135deg, #0F2419 0%, #1B3A2D 50%, #142C22 100%)
  `;

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: isMobile ? 'auto' : 640,
        overflow: 'hidden',
        color: 'white',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: heroBg,
          animation: 'pc-kenburns 20s ease-in-out infinite alternate',
        }}
      />

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
          mixBlendMode: 'screen',
        }}
      >
        <defs>
          <pattern
            id="panel-grid-v3"
            x="0"
            y="0"
            width="80"
            height="50"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-8)"
          >
            <rect x="2" y="2" width="76" height="46" fill="none" stroke="#3DC45A" strokeWidth="0.6" />
            <line x1="40" y1="2" x2="40" y2="48" stroke="#3DC45A" strokeWidth="0.3" />
            <line x1="2" y1="25" x2="78" y2="25" stroke="#3DC45A" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect x="-200" y="400" width="2000" height="700" fill="url(#panel-grid-v3)" transform="skewY(8)" />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(15,36,25,0.85) 0%, rgba(15,36,25,0.55) 55%, rgba(15,36,25,0.35) 100%)',
        }}
      />

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: '-40%',
            width: '60%',
            height: '140%',
            background:
              'linear-gradient(100deg, transparent 0%, rgba(61,196,90,0) 35%, rgba(61,196,90,0.12) 50%, rgba(255,255,255,0.08) 52%, rgba(61,196,90,0) 65%, transparent 100%)',
            transform: 'skewX(-18deg)',
            animation: 'pc-shimmer 7s ease-in-out infinite',
          }}
        />
      </div>

      <Particles count={18} color="rgba(61,196,90,0.35)" />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1280,
          margin: '0 auto',
          padding: isMobile ? '56px 20px 80px' : '104px 32px 120px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 0.8fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div style={{ animation: 'pc-fadein-up .7s ease both' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 24,
              animation: 'pc-fadein-up .6s ease both',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(61,196,90,0.15)',
                border: '1px solid rgba(61,196,90,0.4)',
                color: '#6EE7A0',
                padding: '7px 14px',
                borderRadius: 9999,
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: '.02em',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#3DC45A',
                  animation: 'pc-pulse 2s ease-in-out infinite',
                }}
              />
              1ª limpeza com 50% off
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.8)',
                padding: '7px 14px',
                borderRadius: 9999,
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <svg width="18" height="13" viewBox="0 0 20 14" style={{ flexShrink: 0, borderRadius: 1.5 }}>
                <rect width="20" height="14" fill="#009B3A" />
                <path d="M 10 2 L 18 7 L 10 12 L 2 7 Z" fill="#FEDF00" />
                <circle cx="10" cy="7" r="2.6" fill="#002776" />
                <path d="M 7.8 7.4 Q 10 6.2 12.2 7.4" stroke="white" strokeWidth="0.35" fill="none" />
              </svg>
              Feito em Santa Catarina
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? 'clamp(36px, 9vw, 48px)' : 'clamp(48px, 5.2vw, 68px)',
              lineHeight: 1.02,
              letterSpacing: '-.03em',
              color: 'white',
              margin: 0,
              textWrap: 'balance',
            }}
          >
            Sua usina solar
            <br />
            merece cuidado
            <br />
            <span
              style={{
                color: COLORS.green,
                textShadow: '0 0 30px rgba(61,196,90,0.5)',
              }}
            >
              todo mês.
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'Open Sans',sans-serif",
              fontSize: isMobile ? 17 : 20,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.82)',
              margin: '24px 0 0',
              maxWidth: 560,
              textWrap: 'pretty',
            }}
          >
            Painéis sujos podem perder até{' '}
            <strong
              style={{
                color: '#FBBF24',
                fontWeight: 800,
                animation: 'pc-pulse-text 2.5s ease-in-out infinite',
              }}
            >
              30% de eficiência
            </strong>
            . Mantenha sua geração no máximo com assinatura mensal a partir de R$ 30.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              marginTop: 36,
              alignItems: 'center',
              animation: 'pc-fadein-up .8s .2s ease both',
              opacity: 0,
              animationFillMode: 'both',
            }}
          >
            <Button
              variant="primary"
              size="xl"
              onClick={() => { window.location.href = '/cadastro'; }}
              style={{
                fontSize: isMobile ? 16 : 18,
                padding: isMobile ? '16px 30px' : '18px 38px',
                boxShadow: '0 12px 32px rgba(61,196,90,0.45)',
              }}
            >
              Assinar agora →
            </Button>
            <Button variant="outline" size="lg">
              Calcular economia
            </Button>
          </div>

          <div
            style={{
              marginTop: 36,
              display: 'flex',
              flexWrap: 'wrap',
              gap: isMobile ? '10px 14px' : '12px 22px',
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.78)',
              fontWeight: 600,
              animation: 'pc-fadein-up .9s .35s ease both',
              opacity: 0,
              animationFillMode: 'both',
            }}
          >
            {(
              [
                [
                  <svg
                    key="b"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6EE7A0"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M 3 18 L 11 18 L 13 8 L 5 8 Z" fill="rgba(110,231,160,0.15)" />
                    <line x1="5" y1="13" x2="12" y2="13" />
                    <line x1="8.5" y1="8" x2="7" y2="18" />
                    <rect x="15" y="3" width="5.5" height="2.5" rx="0.5" fill="#6EE7A0" stroke="none" />
                    <line x1="15.5" y1="5.5" x2="15.5" y2="7.5" />
                    <line x1="17" y1="5.5" x2="17" y2="7.5" />
                    <line x1="18.5" y1="5.5" x2="18.5" y2="7.5" />
                    <line x1="20" y1="5.5" x2="20" y2="7.5" />
                    <circle cx="16" cy="11" r="0.9" fill="#6EE7A0" stroke="none" />
                    <circle cx="19" cy="13" r="0.7" fill="#6EE7A0" stroke="none" opacity="0.7" />
                    <circle cx="17" cy="15" r="0.6" fill="#6EE7A0" stroke="none" opacity="0.5" />
                  </svg>,
                  '2 limpezas/ano',
                ],
                ['⚡', 'Relatório mensal'],
                ['✅', 'Checkup técnico'],
                ['🛡️', 'Seguro na limpeza'],
              ] as const
            ).map(([ico, t]) => (
              <span
                key={t}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  flexBasis: isMobile ? 'calc(50% - 7px)' : 'auto',
                }}
              >
                <span
                  style={{
                    color: '#6EE7A0',
                    fontSize: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {ico}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div
            style={{
              position: 'relative',
              animation: 'pc-fadein-up 1s .3s ease both',
              opacity: 0,
              animationFillMode: 'both',
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,196,90,0.2)',
                aspectRatio: '4 / 5',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('${HERO_PHOTO}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: '30% center',
                  backgroundRepeat: 'no-repeat',
                  animation: 'pc-kenburns 20s ease-in-out infinite alternate',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(15,36,25,0.6) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 20,
                  right: 20,
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 11.5,
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  letterSpacing: '.02em',
                  textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                }}
              >
                ⬤ Técnico CleanPass · Usina em Jaraguá do Sul
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: -14,
                left: -28,
                background: 'white',
                borderRadius: 12,
                padding: '12px 14px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                animation: 'pc-fadein-up .6s .6s ease both',
                opacity: 0,
                animationFillMode: 'both',
                minWidth: 170,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#B45309',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: '#F59E0B' }}>⚡</span> Geração hoje
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: COLORS.dark,
                }}
              >
                +18,4% pós-limpeza
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: 60,
                right: -20,
                background: 'white',
                borderRadius: 12,
                padding: '10px 14px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                animation: 'pc-fadein-up .6s .8s ease both',
                opacity: 0,
                animationFillMode: 'both',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(61,196,90,0.12)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                }}
              >
                🛡️
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: COLORS.green,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Protegido
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: 13,
                    color: COLORS.dark,
                    marginTop: 1,
                  }}
                >
                  Seguro incluso
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: -18,
                right: -28,
                background: 'white',
                borderRadius: 12,
                padding: '12px 14px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                animation: 'pc-fadein-up .6s 1s ease both',
                opacity: 0,
                animationFillMode: 'both',
                width: 220,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 10,
                  fontWeight: 800,
                  color: COLORS.green,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span>✅</span> Relatório pronto
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 12,
                  color: COLORS.dark,
                  lineHeight: 1.35,
                  fontWeight: 600,
                }}
              >
                12 fotos antes/depois
                <br />
                <span style={{ color: COLORS.muted, fontWeight: 500 }}>envio automático toda 1ª do mês</span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  background: COLORS.light,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '82%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${COLORS.green}, #6EE7A0)`,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
