'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, COLORS, SectionHeadline } from './shared';
import { SC_MAP_VIEWBOX, SC_MUNICIPIOS } from './sc-municipios';

type Status = 'ativa' | 'expandindo' | 'embreve' | 'outras';

export default function Coverage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const r = () => {
      setIsMobile(window.innerWidth < 900);
      setIsNarrow(window.innerWidth < 1080);
    };
    r();
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const STATUS_GROUPS: Record<Exclude<Status, 'outras'>, string[]> = {
    ativa: ['Jaraguá do Sul', 'Pomerode', 'Florianópolis'],
    expandindo: ['Blumenau', 'Itajaí', 'Brusque', 'Gaspar'],
    embreve: ['Joinville', 'Balneário Camboriú', 'Tubarão', 'Criciúma', 'Lages', 'Chapecó'],
  };

  const statusByName = useMemo<Record<string, Exclude<Status, 'outras'> | undefined>>(() => {
    const m: Record<string, Exclude<Status, 'outras'>> = {};
    for (const n of STATUS_GROUPS.ativa) m[n] = 'ativa';
    for (const n of STATUS_GROUPS.expandindo) m[n] = 'expandindo';
    for (const n of STATUS_GROUPS.embreve) m[n] = 'embreve';
    return m;
  }, []);

  const FILLS: Record<Status, string> = {
    ativa: '#1B7F4A',
    expandindo: '#F5B800',
    embreve: '#FFFFFF',
    outras: '#BFD7A8',
  };
  const STROKES: Record<Status, string> = {
    ativa: '#0D5A33',
    expandindo: '#8B6508',
    embreve: '#8AA380',
    outras: '#7EA265',
  };

  const centroids = useMemo(() => {
    const out: Record<string, { x: number; y: number }> = {};
    for (const m of SC_MUNICIPIOS) {
      if (!statusByName[m.name]) continue;
      const nums = m.d.match(/-?\d+(\.\d+)?/g);
      if (!nums) continue;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (let i = 0; i < nums.length; i += 2) {
        const x = +nums[i];
        const y = +nums[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      out[m.name] = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }
    return out;
  }, [statusByName]);

  const CALLOUT_OFFSET: Record<string, { dx: number; dy: number }> = {
    'Jaraguá do Sul': { dx: 70, dy: -55 },
    Pomerode: { dx: 75, dy: -8 },
    Florianópolis: { dx: 80, dy: 20 },
  };

  const LEFT_PAD = 0;
  const RIGHT_PAD = 90;
  const TOP_PAD = 0;
  const VB = SC_MAP_VIEWBOX;
  const VB_W = VB.w + LEFT_PAD + RIGHT_PAD;
  const VB_H = VB.h + TOP_PAD;

  const listGroups: {
    key: Exclude<Status, 'outras'>;
    title: string;
    sub: string;
    dot: string;
    dotBorder: string;
  }[] = [
    {
      key: 'ativa',
      title: 'Atendendo agora',
      sub: 'Sua assinatura começa em 48h',
      dot: FILLS.ativa,
      dotBorder: STROKES.ativa,
    },
    {
      key: 'expandindo',
      title: 'Expansão em andamento',
      sub: 'Pré-cadastre sua usina agora',
      dot: FILLS.expandindo,
      dotBorder: STROKES.expandindo,
    },
    {
      key: 'embreve',
      title: 'Em breve',
      sub: 'Entre na lista de espera',
      dot: 'white',
      dotBorder: COLORS.dark,
    },
  ];

  return (
    <section
      id="cobertura"
      style={{
        background: 'white',
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="🗺 ONDE ATENDEMOS"
          title="Santa Catarina, do litoral ao oeste."
          subtitle="13 cidades entre ativas e em expansão. Não é a sua? Entre na lista de espera — priorizamos as regiões com mais pedidos."
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : '1.3fr 1fr',
            gap: isNarrow ? 28 : 48,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              background: `
                linear-gradient(rgba(27,58,45,0.055) 1px, transparent 1px) 0 0 / 32px 32px,
                linear-gradient(90deg, rgba(27,58,45,0.055) 1px, transparent 1px) 0 0 / 32px 32px,
                linear-gradient(rgba(27,58,45,0.025) 1px, transparent 1px) 0 0 / 8px 8px,
                linear-gradient(90deg, rgba(27,58,45,0.025) 1px, transparent 1px) 0 0 / 8px 8px,
                radial-gradient(ellipse at 30% 30%, #FAF7EE 0%, #F1EBDA 60%, #E4DAC0 100%)
              `,
              borderRadius: 20,
              padding: isMobile ? 14 : 22,
              border: `1.5px solid #C9BFA0`,
              overflow: 'hidden',
              boxShadow:
                '0 20px 50px rgba(27,58,45,0.18), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.06)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 8,
                pointerEvents: 'none',
                border: '1px dashed rgba(27,58,45,0.18)',
                borderRadius: 14,
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 14,
                right: 18,
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 9.5,
                fontWeight: 700,
                color: '#8A7B55',
                letterSpacing: '.18em',
                padding: '4px 8px',
                border: '1.2px solid #8A7B55',
                borderRadius: 3,
                opacity: 0.55,
                transform: 'rotate(2deg)',
              }}
            >
              SC · BR · ESC 1:3M
            </div>

            <svg
              viewBox={`${-LEFT_PAD} ${-TOP_PAD} ${VB_W} ${VB_H}`}
              style={{ width: '100%', height: 'auto', display: 'block', position: 'relative' }}
            >
              <defs>
                <linearGradient id="ocean-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A7C7DA" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#6F9CB5" stopOpacity="0.55" />
                </linearGradient>

                <radialGradient id="zone-active" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={COLORS.green} stopOpacity="0.45" />
                  <stop offset="70%" stopColor={COLORS.green} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={COLORS.green} stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect
                x={VB.w - 70}
                y="0"
                width={70 + RIGHT_PAD}
                height={VB.h}
                fill="url(#ocean-grad)"
                opacity="0.6"
              />
              <g stroke="#5E8AA3" strokeWidth="1" fill="none" opacity="0.35" strokeLinecap="round">
                <path d={`M ${VB.w - 60} 120 Q ${VB.w - 38} 115 ${VB.w - 16} 120`} />
                <path d={`M ${VB.w - 60} 200 Q ${VB.w - 38} 195 ${VB.w - 16} 200`} />
                <path d={`M ${VB.w - 60} 280 Q ${VB.w - 38} 275 ${VB.w - 16} 280`} />
                <path d={`M ${VB.w - 60} 360 Q ${VB.w - 38} 355 ${VB.w - 16} 360`} />
                <path d={`M ${VB.w - 60} 440 Q ${VB.w - 38} 435 ${VB.w - 16} 440`} />
              </g>
              <text
                x={VB.w - 35}
                y="260"
                fontSize="11"
                fill="#3A6A88"
                fontFamily="'Open Sans',sans-serif"
                fontStyle="italic"
                fontWeight="600"
                opacity="0.75"
                textAnchor="middle"
                transform={`rotate(90, ${VB.w - 35}, 260)`}
              >
                Oceano Atlântico
              </text>

              <g transform="translate(6, 9)" opacity="0.22">
                {SC_MUNICIPIOS.map((m) => (
                  <path key={`shadow-${m.id}`} d={m.d} fill="#0F2419" stroke="none" />
                ))}
              </g>

              <g>
                {SC_MUNICIPIOS.map((m) => {
                  const status: Status = statusByName[m.name] || 'outras';
                  const isHover = hover === m.name;
                  const isFeatured = !!statusByName[m.name];
                  const fill = FILLS[status];
                  const stroke = isHover ? COLORS.dark : STROKES[status];
                  return (
                    <path
                      key={m.id}
                      d={m.d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isHover ? 1.4 : status === 'outras' ? 0.5 : 0.9}
                      strokeLinejoin="round"
                      style={{
                        cursor: isFeatured ? 'pointer' : 'default',
                        transition: 'fill 150ms ease, stroke-width 150ms ease',
                        filter: isHover ? 'brightness(1.08)' : undefined,
                      }}
                      onMouseEnter={isFeatured ? () => setHover(m.name) : undefined}
                      onMouseLeave={isFeatured ? () => setHover(null) : undefined}
                    >
                      <title>{m.name}</title>
                    </path>
                  );
                })}
              </g>

              {STATUS_GROUPS.ativa.map((n) => {
                const c = centroids[n];
                if (!c) return null;
                return (
                  <circle
                    key={`halo-${n}`}
                    cx={c.x}
                    cy={c.y}
                    r="55"
                    fill="url(#zone-active)"
                    pointerEvents="none"
                  />
                );
              })}

              {STATUS_GROUPS.ativa.map((n) => {
                const c = centroids[n];
                if (!c) return null;
                return (
                  <g key={`pulse-${n}`} pointerEvents="none">
                    <circle cx={c.x} cy={c.y} r="6" fill={COLORS.green} opacity="0.5">
                      <animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={c.x} cy={c.y} r="4.5" fill="white" stroke={COLORS.green} strokeWidth="2" />
                  </g>
                );
              })}

              {STATUS_GROUPS.expandindo.map((n) => {
                const c = centroids[n];
                if (!c) return null;
                return (
                  <circle
                    key={`pin-${n}`}
                    cx={c.x}
                    cy={c.y}
                    r="3.5"
                    fill="#F5B800"
                    stroke="#78350F"
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                );
              })}

              {STATUS_GROUPS.embreve.map((n) => {
                const c = centroids[n];
                if (!c) return null;
                return (
                  <circle
                    key={`pin-${n}`}
                    cx={c.x}
                    cy={c.y}
                    r="3"
                    fill="white"
                    stroke={COLORS.dark}
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                );
              })}

              <g transform="translate(55, 55)" opacity="0.55">
                <circle r="20" fill="white" stroke={COLORS.dark} strokeWidth="1" />
                <path d="M 0 -15 L 4 0 L 0 -3 L -4 0 Z" fill={COLORS.dark} />
                <path d="M 0 15 L 4 0 L 0 3 L -4 0 Z" fill={COLORS.muted} />
                <text
                  y="-25"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={COLORS.dark}
                  fontFamily="'Open Sans',sans-serif"
                >
                  N
                </text>
              </g>

              {STATUS_GROUPS.ativa.map((name) => {
                const c = centroids[name];
                const off = CALLOUT_OFFSET[name] || { dx: 80, dy: -30 };
                if (!c || hover === name) return null;
                const lx = c.x + off.dx;
                const ly = c.y + off.dy;
                return (
                  <g key={`callout-${name}`} pointerEvents="none">
                    <line x1={c.x} y1={c.y} x2={lx} y2={ly} stroke={COLORS.dark} strokeWidth="1" opacity="0.55" />
                    <circle cx={lx} cy={ly} r="2" fill={COLORS.dark} />
                    <rect
                      x={lx + 4}
                      y={ly - 11}
                      width={name.length * 7 + 14}
                      height="22"
                      rx="4"
                      fill="white"
                      stroke={COLORS.green}
                      strokeWidth="1.3"
                    />
                    <text
                      x={lx + 11}
                      y={ly + 4}
                      fontSize="11"
                      fontWeight="700"
                      fill={COLORS.dark}
                      fontFamily="'Open Sans',sans-serif"
                    >
                      {name}
                    </text>
                  </g>
                );
              })}

              {hover && centroids[hover] && (() => {
                const c = centroids[hover];
                const status = statusByName[hover];
                const label =
                  status === 'ativa'
                    ? '● ATENDEMOS AGORA'
                    : status === 'expandindo'
                      ? '● EXPANDINDO'
                      : '○ EM BREVE';
                const accent =
                  status === 'ativa'
                    ? '#6EE7A0'
                    : status === 'expandindo'
                      ? '#FDE68A'
                      : 'rgba(255,255,255,0.75)';
                const w = Math.max(150, hover.length * 7.5 + 24);
                return (
                  <g pointerEvents="none">
                    <rect x={c.x - w / 2} y={c.y - 50} width={w} height="34" rx="6" fill={COLORS.dark} />
                    <polygon
                      points={`${c.x - 5},${c.y - 16} ${c.x + 5},${c.y - 16} ${c.x},${c.y - 10}`}
                      fill={COLORS.dark}
                    />
                    <text
                      x={c.x}
                      y={c.y - 34}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="'Open Sans',sans-serif"
                    >
                      {hover}
                    </text>
                    <text
                      x={c.x}
                      y={c.y - 22}
                      textAnchor="middle"
                      fill={accent}
                      fontSize="9.5"
                      fontWeight="700"
                      letterSpacing=".1em"
                      fontFamily="'Open Sans',sans-serif"
                    >
                      {label}
                    </text>
                  </g>
                );
              })()}
            </svg>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px 22px',
                marginTop: 10,
                position: 'relative',
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: FILLS.ativa,
                    border: `1.5px solid ${STROKES.ativa}`,
                  }}
                />
                <span style={{ color: COLORS.dark }}>
                  Ativa <span style={{ color: COLORS.muted, fontWeight: 500 }}>({STATUS_GROUPS.ativa.length})</span>
                </span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: FILLS.expandindo,
                    border: `1.5px solid ${STROKES.expandindo}`,
                  }}
                />
                <span style={{ color: COLORS.dark }}>
                  Expandindo{' '}
                  <span style={{ color: COLORS.muted, fontWeight: 500 }}>
                    ({STATUS_GROUPS.expandindo.length})
                  </span>
                </span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: FILLS.embreve,
                    border: `1.5px solid ${COLORS.dark}`,
                  }}
                />
                <span style={{ color: COLORS.dark }}>
                  Em breve{' '}
                  <span style={{ color: COLORS.muted, fontWeight: 500 }}>({STATUS_GROUPS.embreve.length})</span>
                </span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: FILLS.outras,
                    border: `1.5px solid ${STROKES.outras}`,
                  }}
                />
                <span style={{ color: COLORS.muted, fontWeight: 500 }}>Demais municípios</span>
              </span>
            </div>
          </div>

          <div>
            {listGroups.map((g) => (
              <div key={g.key} style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: g.dot,
                      border: `2px solid ${g.dotBorder}`,
                      flexShrink: 0,
                    }}
                  />
                  <h4
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      color: COLORS.dark,
                      margin: 0,
                      letterSpacing: '-.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {g.title}
                  </h4>
                  <span
                    style={{
                      fontFamily: "'Open Sans',sans-serif",
                      fontSize: 11,
                      color: COLORS.muted,
                      marginLeft: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {STATUS_GROUPS[g.key].length} cidades
                  </span>
                </div>
                <div style={{ marginLeft: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STATUS_GROUPS[g.key].map((name) => (
                    <span
                      key={name}
                      onMouseEnter={() => setHover(name)}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: COLORS.dark,
                        padding: '5px 10px',
                        background: hover === name ? FILLS.outras : COLORS.bg,
                        borderRadius: 8,
                        border: `1px solid ${hover === name ? COLORS.green : COLORS.border}`,
                        cursor: 'pointer',
                        transition: 'background 150ms ease, border-color 150ms ease',
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginLeft: 20,
                    marginTop: 6,
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 11.5,
                    color: COLORS.muted,
                    fontStyle: 'italic',
                  }}
                >
                  {g.sub}
                </div>
              </div>
            ))}

            <Button variant="secondary" size="md" style={{ marginTop: 10 }}>
              Entrar na lista de espera →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
