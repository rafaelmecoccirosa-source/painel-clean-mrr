'use client';

import { useEffect, useState } from 'react';
import { COLORS, Counter, Eyebrow, useIsMobile } from './shared';
import CleanPassLogo from '@/components/ui/CleanPassLogo';

export default function DashboardPreview() {
  const isMobile = useIsMobile(900);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const baseBars = [0.3, 1.1, 2.4, 3.8, 4.7, 5.2, 5.4, 4.9, 3.9, 2.8, 1.6, 0.7, 0.2];
  const bars = baseBars.map((v, i) => {
    const jitter = i >= 4 && i <= 7 ? Math.sin(tick * 0.8 + i) * 0.15 : 0;
    return Math.max(0.1, v + jitter);
  });
  const maxBar = Math.max(...bars);

  const bullets = [
    {
      icon: '⚡',
      title: 'Geração em tempo real',
      body: 'Veja quanto sua usina está produzindo agora — atualizado a cada 5 minutos, direto do inversor.',
    },
    {
      icon: '🔔',
      title: 'Alerta automático de queda',
      body: 'Se a geração cair 5% da média, você recebe notificação no WhatsApp antes de chegar a conta de luz.',
    },
    {
      icon: '📅',
      title: 'Próxima limpeza agendada',
      body: 'Data, horário e nome do técnico visíveis com antecedência. Remarque com 1 clique se precisar.',
    },
    {
      icon: '📊',
      title: 'Relatório mensal completo',
      body: 'Comparativo com o mês anterior, economia acumulada, fotos das limpezas e histórico de alertas.',
    },
  ];

  return (
    <section
      style={{
        background: 'white',
        padding: isMobile ? '56px 20px' : '88px 32px',
        borderTop: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr',
            gap: isMobile ? 40 : 64,
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow>📱 DASHBOARD DO CLIENTE</Eyebrow>
            <h2
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 'clamp(30px, 7.5vw, 40px)' : 'clamp(36px, 4vw, 48px)',
                lineHeight: 1.05,
                letterSpacing: '-.025em',
                color: COLORS.dark,
                margin: '14px 0 0',
                textWrap: 'balance',
              }}
            >
              Veja o que você
              <br />
              recebe todo mês.
            </h2>
            <p
              style={{
                fontFamily: "'Open Sans',sans-serif",
                fontSize: isMobile ? 16 : 18,
                lineHeight: 1.55,
                color: 'rgba(27,58,45,0.7)',
                margin: '18px 0 0',
                maxWidth: 500,
                textWrap: 'pretty',
              }}
            >
              Um painel simples no celular que mostra como sua usina está performando — sem precisar abrir o app
              do inversor.
            </p>

            <div style={{ marginTop: 32, display: 'grid', gap: 18 }}>
              {bullets.map((b, i) => (
                <div
                  key={b.title}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    animation: `pc-slideup .5s ${i * 0.08}s ease both`,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: COLORS.light,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 19,
                    }}
                  >
                    {b.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: COLORS.dark,
                        letterSpacing: '-.01em',
                      }}
                    >
                      {b.title}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: 'rgba(27,58,45,0.65)',
                        textWrap: 'pretty',
                      }}
                    >
                      {b.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', padding: isMobile ? 0 : 20 }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 50%, rgba(61,196,90,0.18) 0%, transparent 60%)`,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 24px 60px rgba(27,58,45,0.18), 0 4px 14px rgba(27,58,45,0.08)',
                overflow: 'hidden',
                maxWidth: isMobile ? '100%' : 500,
                margin: isMobile ? '0' : '0 auto',
                animation: 'pc-slideup .7s ease both',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  background: '#F1F5F0',
                  borderBottom: `1px solid ${COLORS.border}`,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'white',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 11,
                    color: COLORS.muted,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                  app.painelclean.com.br/dashboard
                </div>
              </div>

              <div style={{ padding: isMobile ? 20 : 26 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingBottom: 16,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      overflow: 'hidden',
                      background: COLORS.green,
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 2px 8px rgba(61,196,90,0.3)',
                    }}
                  >
                    <CleanPassLogo variant="light" size={24} showWordmark={false} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: COLORS.dark,
                        letterSpacing: '-.01em',
                      }}
                    >
                      Usina Residência Marcos
                    </div>
                    <div
                      style={{
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 12,
                        color: COLORS.muted,
                        marginTop: 2,
                      }}
                    >
                      8,8 kWp · 16 módulos · Jaraguá
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.green,
                      background: 'rgba(61,196,90,0.1)',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: COLORS.green,
                        animation: 'pc-pulse 2s ease-in-out infinite',
                      }}
                    />
                    Online
                  </span>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 11,
                        color: COLORS.muted,
                        fontWeight: 700,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Geração hoje
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 12,
                        fontWeight: 800,
                        color: COLORS.green,
                        background: 'rgba(61,196,90,0.12)',
                        padding: '3px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      ↑ 18,4%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 900,
                        fontSize: isMobile ? 40 : 48,
                        lineHeight: 1,
                        letterSpacing: '-.03em',
                        color: COLORS.dark,
                      }}
                    >
                      <Counter to={382} format={(n) => (n / 10).toFixed(1).replace('.', ',')} />
                    </span>
                    <span
                      style={{
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 15,
                        color: COLORS.muted,
                        fontWeight: 600,
                      }}
                    >
                      kWh
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 11.5,
                      color: COLORS.muted,
                    }}
                  >
                    vs. 32,3 kWh na média das últimas 2 semanas
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    background: COLORS.bg,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 10.5,
                      color: COLORS.muted,
                      fontWeight: 700,
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}
                  >
                    kWh por hora
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 72 }}>
                    {bars.map((v, i) => {
                      const h = (v / maxBar) * 100;
                      const isPeak = i >= 4 && i <= 7;
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            background: isPeak
                              ? `linear-gradient(180deg, ${COLORS.green}, #6EE7A0)`
                              : 'rgba(61,196,90,0.35)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height .6s cubic-bezier(.4,0,.2,1)',
                            boxShadow: isPeak ? '0 2px 6px rgba(61,196,90,0.35)' : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 10,
                      color: COLORS.muted,
                    }}
                  >
                    <span>6h</span>
                    <span>9h</span>
                    <span>12h</span>
                    <span>15h</span>
                    <span>18h</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                      border: '1px solid #FBBF24',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: '#92400E',
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      📅 Próxima limpeza
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: '#92400E',
                        letterSpacing: '-.01em',
                        lineHeight: 1.1,
                      }}
                    >
                      23 abr · 14h
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 11,
                        color: '#B45309',
                      }}
                    >
                      Técnico: Ricardo M.
                    </div>
                  </div>

                  <div
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.light} 0%, #D4E5CD 100%)`,
                      border: `1px solid ${COLORS.green}`,
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: COLORS.dark,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      💰 Economia no ano
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: COLORS.dark,
                        letterSpacing: '-.01em',
                        lineHeight: 1.1,
                      }}
                    >
                      R$ 1.284
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 11,
                        color: 'rgba(27,58,45,0.65)',
                      }}
                    >
                      ↑ 32% vs. 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
