'use client';

import { useEffect, useRef } from 'react';
import { Button, COLORS, useIsMobile } from './shared';

// ---------- color helpers ----------

type C3 = [number, number, number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpRGB(a: C3, b: C3, t: number): string {
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}

// 4-stop face color ramp: dark → medium-trail → lit → peak
function faceColor(b: number, dark: C3, med: C3, lit: C3, peak: C3): string {
  if (b < 0.45) return lerpRGB(dark, med, b / 0.45);
  if (b < 0.75) return lerpRGB(med, lit, (b - 0.45) / 0.30);
  return lerpRGB(lit, peak, (b - 0.75) / 0.25);
}

// face palettes  — top | left | right
const TOP_D: C3  = [26,  77,  56];  const LEFT_D: C3  = [13,  46,  32];  const RIGHT_D: C3  = [18,  42,  28];
const TOP_M: C3  = [42, 148,  68];  const LEFT_M: C3  = [22,  90,  44];  const RIGHT_M: C3  = [16,  72,  35];
const TOP_L: C3  = [61, 196,  90];  const LEFT_L: C3  = [42, 148,  68];  const RIGHT_L: C3  = [31, 122,  53];
const TOP_P: C3  = [127, 232, 154]; const LEFT_P: C3  = [61, 196,  90];  const RIGHT_P: C3  = [42, 148,  68];

function drawModule(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  brightness: number,
  tileW: number,
  tileH: number,
) {
  const cubeH = lerp(4, 22, brightness);
  const hw = tileW / 2;
  const hh = tileH / 2;

  const topC   = faceColor(brightness, TOP_D,   TOP_M,   TOP_L,   TOP_P);
  const leftC  = faceColor(brightness, LEFT_D,  LEFT_M,  LEFT_L,  LEFT_P);
  const rightC = faceColor(brightness, RIGHT_D, RIGHT_M, RIGHT_L, RIGHT_P);

  // right face
  ctx.beginPath();
  ctx.moveTo(sx,      sy + tileH - cubeH);
  ctx.lineTo(sx + hw, sy + hh   - cubeH);
  ctx.lineTo(sx + hw, sy + hh          );
  ctx.lineTo(sx,      sy + tileH       );
  ctx.closePath();
  ctx.fillStyle = rightC;
  ctx.fill();

  // left face
  ctx.beginPath();
  ctx.moveTo(sx - hw, sy + hh   - cubeH);
  ctx.lineTo(sx,      sy + tileH - cubeH);
  ctx.lineTo(sx,      sy + tileH        );
  ctx.lineTo(sx - hw, sy + hh           );
  ctx.closePath();
  ctx.fillStyle = leftC;
  ctx.fill();

  // top face
  ctx.beginPath();
  ctx.moveTo(sx,      sy         - cubeH);
  ctx.lineTo(sx + hw, sy + hh    - cubeH);
  ctx.lineTo(sx,      sy + tileH - cubeH);
  ctx.lineTo(sx - hw, sy + hh    - cubeH);
  ctx.closePath();
  ctx.fillStyle = topC;
  ctx.fill();
}

// ---------- IsometricGrid canvas ----------

const MAX_SIDE = 80;

function IsometricGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WAVE_SPEED = 0.018;
    const LERP_F     = 0.10;
    const TILE_W     = 48;
    const TILE_H     = TILE_W / 2;
    const MAX_CUBE_H = 22;

    const bright: number[][] = Array.from(
      { length: MAX_SIDE },
      () => new Array<number>(MAX_SIDE).fill(0),
    );

    let wavePos = 0;
    let animId  = 0;
    let cols    = 0;
    let rows    = 0;
    let running = false;

    const setSize = (): boolean => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      canvas.width  = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      const hw = TILE_W / 2;
      const hh = TILE_H / 2;
      const diagH = Math.ceil(canvas.width  / hw) + 4;
      const diagV = Math.ceil(canvas.height / hh) + 4;
      const total = Math.max(diagH, diagV);
      cols = Math.min(MAX_SIDE, Math.ceil(total / 2));
      rows = Math.min(MAX_SIDE, total - cols + 2);
      return true;
    };

    const loop = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      const hw = TILE_W / 2;
      const hh = TILE_H / 2;

      const COLS = cols;
      const ROWS = rows;
      const MAX_DIAG = COLS + ROWS - 2;
      const CYCLE = MAX_DIAG + 22;

      const offsetX = cw / 2;
      const offsetY = MAX_CUBE_H + 2;

      wavePos = (wavePos + WAVE_SPEED) % CYCLE;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const antidiag = (COLS - 1 - col) + row;
          const d = (wavePos - antidiag + CYCLE) % CYCLE;

          let target = 0;
          if (d < 0.5)      target = d * 2;
          else if (d < 2.5) target = 1;
          else if (d < 5.5) target = lerp(1, 0.42, (d - 2.5) / 3);
          else if (d < 14)  target = 0.42;
          else if (d < 18)  target = lerp(0.42, 0, (d - 14) / 4);

          bright[row][col] += (target - bright[row][col]) * LERP_F;
        }
      }

      ctx.clearRect(0, 0, cw, ch);

      for (let diag = 0; diag < COLS + ROWS - 1; diag++) {
        const colMin = Math.max(0, diag - ROWS + 1);
        const colMax = Math.min(diag, COLS - 1);
        for (let col = colMin; col <= colMax; col++) {
          const row = diag - col;
          const sx = offsetX + (col - row) * hw;
          const sy = offsetY + (col + row) * hh;

          if (sx + TILE_W < 0 || sx - TILE_W > cw) continue;
          if (sy - MAX_CUBE_H > ch)                 continue;

          drawModule(ctx, sx, sy, bright[row][col], TILE_W, TILE_H);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (running) { setSize(); return; }
      if (setSize()) {
        running = true;
        loop();
      }
    };

    // ResizeObserver fires as soon as the element gets real layout dimensions
    const ro = new ResizeObserver(tryStart);
    ro.observe(canvas);
    tryStart();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

// ---------- Hero ----------

export default function Hero() {
  const isMobile = useIsMobile(640);

  const trustItems = [
    {
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6EE7A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
        </svg>
      ),
      label: '2 limpezas/ano',
    },
    { icon: '⚡', label: 'Relatório mensal' },
    { icon: '✅', label: 'Checkup técnico' },
    { icon: '🛡️', label: 'Seguro na limpeza' },
  ] as const;

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: isMobile ? 'auto' : '100vh',
        background: '#0F382B',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Right-half full-bleed canvas — desktop only */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '50%',
            zIndex: 1,
          }}
        >
          <IsometricGrid />
        </div>
      )}

      {/* Content column */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: isMobile ? '100%' : '50%',
          minHeight: isMobile ? 'auto' : '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '80px 20px 40px' : '80px 48px 80px 56px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? 480 : 560,
            margin: '0 auto',
            textAlign: isMobile ? 'center' : 'left',
            animation: 'pc-fadein-up .7s ease both',
          }}
        >
          {/* badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 24,
              justifyContent: isMobile ? 'center' : 'flex-start',
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
                  flexShrink: 0,
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

          {/* title */}
          <h1
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: isMobile
                ? 'clamp(34px, 9vw, 46px)'
                : 'clamp(38px, 4vw, 56px)',
              lineHeight: 1.05,
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

          {/* subtitle */}
          <p
            style={{
              fontFamily: "'Open Sans',sans-serif",
              fontSize: isMobile ? 16 : 18,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.82)',
              margin: '22px 0 0',
              marginLeft: isMobile ? 'auto' : 0,
              marginRight: isMobile ? 'auto' : 0,
              maxWidth: 500,
              textWrap: 'pretty',
            }}
          >
            Painéis sujos podem perder até{' '}
            <strong style={{ color: '#FBBF24', fontWeight: 800 }}>
              30% de eficiência
            </strong>
            . Mantenha sua geração no máximo com assinatura mensal a partir de R$ 30.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 14,
              marginTop: 32,
              alignItems: isMobile ? 'stretch' : 'center',
              animation: 'pc-fadein-up .8s .2s ease both',
              animationFillMode: 'both',
            }}
          >
            <Button
              variant="primary"
              size="xl"
              onClick={() => {
                window.location.href = '/cadastro';
              }}
              style={{
                fontSize: isMobile ? 16 : 17,
                padding: isMobile ? '16px 30px' : '16px 34px',
                boxShadow: '0 12px 32px rgba(61,196,90,0.45)',
              }}
            >
              Assinar agora →
            </Button>
            <Button variant="outline" size="lg">
              Calcular economia
            </Button>
          </div>

          {/* trust items */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px 20px',
              justifyContent: isMobile ? 'center' : 'flex-start',
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.72)',
              fontWeight: 600,
              animation: 'pc-fadein-up .9s .35s ease both',
              animationFillMode: 'both',
            }}
          >
            {trustItems.map((item) => (
              <span
                key={item.label}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
              >
                <span style={{ color: '#6EE7A0', fontSize: 14, display: 'inline-flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: canvas below text */}
      {isMobile && (
        <div
          style={{
            position: 'relative',
            height: 320,
            width: '100%',
          }}
        >
          <IsometricGrid />
        </div>
      )}
    </section>
  );
}
