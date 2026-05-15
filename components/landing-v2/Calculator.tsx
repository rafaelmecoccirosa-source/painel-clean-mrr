'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Button, COLORS, Card, Eyebrow, Particles, SectionHeadline } from './shared';

type PlanId = 'basico' | 'padrao' | 'plus';
type UltimaLimpeza = 'Nunca' | '18m+' | '1a' | '6m';

export default function Calculator() {
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const r = () => {
      setIsMobile(window.innerWidth < 900);
      setIsNarrow(window.innerWidth < 1040);
    };
    r();
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const [modulos, setModulos] = useState(20);
  const [ultimaLimpeza, setUltimaLimpeza] = useState<UltimaLimpeza>('Nunca');
  const [planoManual, setPlanoManual] = useState<PlanId | null>(null);

  const W_PER_MODULE = 550;
  const KWH_PER_KWP_MONTH = 130;
  const TARIFF = 0.92;
  const PERDA_PCT: Record<UltimaLimpeza, number> = {
    Nunca: 0.3,
    '18m+': 0.25,
    '1a': 0.2,
    '6m': 0.15,
  };

  const kWp = (modulos * W_PER_MODULE) / 1000;
  const geracaoMes = kWp * KWH_PER_KWP_MONTH;
  const perdaPct = PERDA_PCT[ultimaLimpeza];
  const perdaKwh = Math.round(geracaoMes * perdaPct);
  const perdaReaisMes = Math.round(perdaKwh * TARIFF);
  const perdaReaisAno = perdaReaisMes * 12;

  let planoAuto: PlanId | 'pro' = 'padrao';
  if (modulos <= 15) planoAuto = 'basico';
  else if (modulos <= 30) planoAuto = 'padrao';
  else if (modulos <= 60) planoAuto = 'plus';
  else planoAuto = 'pro';

  const planos: { id: PlanId; nome: string; range: string; preco: number }[] = [
    { id: 'basico', nome: 'Básico', range: 'até 15 módulos', preco: 30 },
    { id: 'padrao', nome: 'Padrão', range: '16–30 módulos', preco: 50 },
    { id: 'plus', nome: 'Plus', range: '31–60 módulos', preco: 100 },
  ];

  const planoSel: PlanId = planoManual ?? (planoAuto === 'pro' ? 'padrao' : planoAuto);
  const planoObj = planos.find((p) => p.id === planoSel) ?? planos[1];
  const custom = planoAuto === 'pro';

  // Avulso 3 anos: base R$ 3.600 para 20 módulos, escalado linearmente.
  const avulso3y = 180 * modulos;
  const precoAvulsoUnico = avulso3y / 6;
  const assinatura3y = planoObj.preco * 36 - planoObj.preco * 0.5;
  const economia3y = Math.max(0, avulso3y - assinatura3y);

  const sliderStyle: CSSProperties = {
    width: '100%',
    height: 6,
    borderRadius: 4,
    background: `linear-gradient(to right, ${COLORS.green} 0%, ${COLORS.green} ${((modulos - 5) / 75) * 100}%, ${COLORS.border} ${((modulos - 5) / 75) * 100}%, ${COLORS.border} 100%)`,
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    cursor: 'pointer',
  };

  const limpezaOptions: { v: UltimaLimpeza; l: string }[] = [
    { v: 'Nunca', l: 'Nunca' },
    { v: '18m+', l: '18m+' },
    { v: '1a', l: '1 ano' },
    { v: '6m', l: '6 meses' },
  ];

  const perdaLabel =
    ultimaLimpeza === 'Nunca'
      ? 'mais de 2 anos'
      : ultimaLimpeza === '18m+'
        ? 'mais de 18 meses'
        : ultimaLimpeza === '1a'
          ? '1 ano'
          : '6 meses';

  return (
    <section
      id="calculadora"
      style={{
        background: COLORS.bg,
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="📊 CALCULADORA"
          title="Quanto você está perdendo por mês?"
          subtitle="Descubra o prejuízo da sujeira e o plano ideal pra sua usina em 10 segundos."
        />

        <div
          style={{
            marginTop: isMobile ? 32 : 48,
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : '1fr 1.15fr',
            gap: isNarrow ? 18 : 28,
            alignItems: 'stretch',
          }}
        >
          <Card padding={isMobile ? 24 : 32} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
                }}
              >
                <Eyebrow>Quantos módulos tem sua usina?</Eyebrow>
                <span
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: isMobile ? 26 : 32,
                    color: COLORS.green,
                    letterSpacing: '-.02em',
                  }}
                >
                  {modulos}{' '}
                  <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>módulos</span>
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={modulos}
                onChange={(e) => {
                  setModulos(Number(e.target.value));
                  setPlanoManual(null);
                }}
                style={sliderStyle}
                className="pc-slider"
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontSize: 11.5,
                  color: COLORS.muted,
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                <span>5</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
              </div>
            </div>

            <div>
              <Eyebrow>Última limpeza</Eyebrow>
              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  background: COLORS.bg,
                  padding: 5,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {limpezaOptions.map((opt) => {
                  const active = ultimaLimpeza === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={() => setUltimaLimpeza(opt.v)}
                      style={{
                        padding: '10px 6px',
                        border: 'none',
                        borderRadius: 9,
                        background: active ? COLORS.green : 'transparent',
                        color: active ? 'white' : COLORS.dark,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: active ? '0 2px 8px rgba(61,196,90,0.35)' : 'none',
                        transition: 'all .18s ease',
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Eyebrow>Planos disponíveis</Eyebrow>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {planos.map((p) => {
                  const sel = !custom && planoSel === p.id;
                  const autoMatch = planoAuto === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlanoManual(p.id)}
                      style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: 10,
                        alignItems: 'center',
                        padding: '12px 14px',
                        borderRadius: 11,
                        border: sel ? `2px solid ${COLORS.dark}` : `1.5px solid ${COLORS.border}`,
                        background: sel ? COLORS.dark : 'white',
                        color: sel ? 'white' : COLORS.dark,
                        transition: 'all .18s',
                        position: 'relative',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Montserrat',sans-serif",
                            fontWeight: 800,
                            fontSize: 15,
                            letterSpacing: '-.01em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {p.nome}
                          {autoMatch && (
                            <span
                              style={{
                                fontFamily: "'Open Sans',sans-serif",
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                background: sel ? COLORS.green : COLORS.light,
                                color: sel ? 'white' : COLORS.dark,
                                padding: '3px 7px',
                                borderRadius: 9999,
                              }}
                            >
                              ✓ sugerido
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Open Sans',sans-serif",
                            fontSize: 12,
                            color: sel ? 'rgba(255,255,255,0.65)' : COLORS.muted,
                            marginTop: 2,
                          }}
                        >
                          {p.range}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontWeight: 800,
                          fontSize: 17,
                          color: sel ? '#6EE7A0' : COLORS.dark,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        R$ {p.preco}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: sel ? 'rgba(255,255,255,0.55)' : COLORS.muted,
                          }}
                        >
                          /mês
                        </span>
                      </div>
                    </button>
                  );
                })}
                {custom && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 10,
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 11,
                      border: `2px solid ${COLORS.green}`,
                      background: COLORS.dark,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontWeight: 800,
                          fontSize: 15,
                          color: 'white',
                          letterSpacing: '-.01em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        Pro / Business
                        <span
                          style={{
                            fontFamily: "'Open Sans',sans-serif",
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            background: COLORS.green,
                            color: 'white',
                            padding: '3px 7px',
                            borderRadius: 9999,
                          }}
                        >
                          ✓ sugerido
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Open Sans',sans-serif",
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.6)',
                          marginTop: 2,
                        }}
                      >
                        60+ módulos → condição personalizada
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 800,
                        fontSize: 17,
                        color: '#6EE7A0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      sob consulta
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: COLORS.bg,
                border: `1px dashed ${COLORS.border}`,
              }}
            >
              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 11,
                  color: COLORS.muted,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: COLORS.dark, fontWeight: 700 }}>Premissas:</strong> módulos 550Wp · 130
                kWh/kWp/mês · tarifa R$ 0,92/kWh · média SC
              </p>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '2px solid #FBBF24',
                borderRadius: 20,
                padding: isMobile ? 26 : 32,
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(251,191,36,0.2)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)',
                  animation: 'pc-pulse-soft 3s ease-in-out infinite',
                }}
              />
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: '#92400E',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚡ O que você pode estar perdendo
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 13,
                    color: '#92400E',
                    lineHeight: 1.45,
                  }}
                >
                  Suas <strong style={{ fontWeight: 800 }}>{modulos} módulos</strong> geram{' '}
                  <strong style={{ fontWeight: 800 }}>
                    {'~\u00A0'}{Math.round(geracaoMes).toLocaleString('pt-BR')} kWh/mês
                  </strong>
                  . Com sujeira acumulada há <strong style={{ fontWeight: 800 }}>{perdaLabel}</strong>, você
                  perde até:
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 900,
                      fontSize: isMobile ? 60 : 82,
                      color: '#92400E',
                      letterSpacing: '-.04em',
                      lineHeight: 0.9,
                      textShadow: '0 2px 8px rgba(146,64,14,0.1)',
                    }}
                  >
                    {perdaKwh.toLocaleString('pt-BR')}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 18,
                      color: '#B45309',
                      fontWeight: 700,
                    }}
                  >
                    kWh/mês
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 11,
                      color: '#92400E',
                      opacity: 0.7,
                      fontWeight: 600,
                    }}
                  >
                    {(perdaPct * 100).toFixed(0)}% de perda
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(146,64,14,0.2)',
                    display: 'grid',
                    gap: 6,
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 14,
                    color: '#92400E',
                    lineHeight: 1.45,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>Prejuízo mensal</span>
                    <strong style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      R$ {perdaReaisMes.toLocaleString('pt-BR')},00
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>Prejuízo anual</span>
                    <strong style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      R$ {perdaReaisAno.toLocaleString('pt-BR')},00
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                background: COLORS.dark,
                borderRadius: 18,
                padding: isMobile ? 24 : 28,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(27,58,45,0.25)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Particles count={6} color="rgba(61,196,90,0.2)" />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: '#6EE7A0',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {custom ? '⚡ PAINEL CLEAN BUSINESS' : '💰 Economia em 3 anos vs avulso'}
                </div>

                {!custom ? (
                  <>
                    <div
                      style={{
                        marginTop: 10,
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 900,
                        fontSize: isMobile ? 36 : 44,
                        color: '#6EE7A0',
                        letterSpacing: '-.025em',
                        lineHeight: 1,
                      }}
                    >
                      R$ {economia3y.toLocaleString('pt-BR')},00
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 16,
                        borderTop: '1px solid rgba(255,255,255,0.12)',
                        display: 'grid',
                        gap: 10,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 13.5,
                        color: 'rgba(255,255,255,0.75)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>Tipo de assinatura</span>
                        <strong
                          style={{
                            color: 'white',
                            fontWeight: 800,
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {planoObj.nome} · R$ {planoObj.preco},00/mês
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>1ª limpeza (50% off)</span>
                        <strong
                          style={{
                            color: 'white',
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          R$ {Math.round(precoAvulsoUnico * 0.5).toLocaleString('pt-BR')},00
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>3 anos — assinatura</span>
                        <strong
                          style={{
                            color: '#6EE7A0',
                            fontWeight: 800,
                            fontVariantNumeric: 'tabular-nums',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          R$ {assinatura3y.toLocaleString('pt-BR')},00
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>3 anos — avulso</span>
                        <strong
                          style={{
                            color: '#FCA5A5',
                            fontWeight: 800,
                            fontVariantNumeric: 'tabular-nums',
                            textDecoration: 'line-through',
                            textDecorationColor: 'rgba(252,165,165,0.5)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          R$ {avulso3y.toLocaleString('pt-BR')},00
                        </strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 18 }}>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => { window.location.href = '/cadastro'; }}
                        style={{ boxShadow: '0 6px 18px rgba(61,196,90,0.4)' }}
                      >
                        Garantir minha assinatura →
                      </Button>
                    </div>

                    <p
                      style={{
                        marginTop: 12,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.5)',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                      }}
                    >
                      *1ª limpeza com 50% off. Valor final confirmado pelo técnico certificado.
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 800,
                        fontSize: isMobile ? 20 : 24,
                        color: 'white',
                        lineHeight: 1.2,
                        letterSpacing: '-.01em',
                      }}
                    >
                      Sua usina de {modulos} módulos tem condição especial.
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 13.5,
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.5,
                      }}
                    >
                      Usinas acima de 60 módulos entram no plano Business com atendimento prioritário e preço sob consulta.
                    </div>
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                      <div
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontWeight: 900,
                          fontSize: isMobile ? 52 : 68,
                          color: '#6EE7A0',
                          letterSpacing: '-.04em',
                          lineHeight: 1,
                        }}
                      >
                        {(modulos * 0.8).toFixed(0)}%
                      </div>
                      <div
                        style={{
                          fontFamily: "'Open Sans',sans-serif",
                          fontSize: 11.5,
                          color: 'rgba(255,255,255,0.55)',
                          marginTop: 6,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                        }}
                      >
                        economia estimada vs avulso
                      </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 18 }}>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => { window.location.href = '/cadastro'; }}
                        style={{ boxShadow: '0 6px 18px rgba(61,196,90,0.4)' }}
                      >
                        Fale com a gente →
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
