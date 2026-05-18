'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { Button, COLORS, useIsMobile } from './shared';

// ---------- helpers ----------

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpRGB(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string {
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}

// module face colors (dark → lit → bright)
const C_DARK_TOP: [number, number, number]   = [26,  77,  56]; // #1a4d38
const C_DARK_LEFT: [number, number, number]  = [13,  46,  32]; // #0d2e20
const C_DARK_RIGHT: [number, number, number] = [18,  42,  28]; // #122a1c
const C_LIT_TOP: [number, number, number]    = [61,  196, 90]; // #3DC45A
const C_LIT_LEFT: [number, number, number]   = [42,  148, 68]; // #2a9444
const C_LIT_RIGHT: [number, number, number]  = [31,  122, 53]; // #1f7a35
const C_PEAK_TOP: [number, number, number]   = [127, 232, 154]; // #7FE89A
const C_PEAK_LEFT: [number, number, number]  = [61,  196, 90]; // #3DC45A
const C_PEAK_RIGHT: [number, number, number] = [42,  148, 68]; // #2a9444

function drawModule(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  brightness: number,
  tileW: number,
  tileH: number,
) {
  const cubeH = lerp(6, 20, brightness);
  const hw = tileW / 2;
  const hh = tileH / 2;

  let topC: string, leftC: string, rightC: string;
  if (brightness < 0.5) {
    const t = brightness * 2;
    topC   = lerpRGB(C_DARK_TOP,   C_LIT_TOP,   t);
    leftC  = lerpRGB(C_DARK_LEFT,  C_LIT_LEFT,  t);
    rightC = lerpRGB(C_DARK_RIGHT, C_LIT_RIGHT, t);
  } else {
    const t = (brightness - 0.5) * 2;
    topC   = lerpRGB(C_LIT_TOP,   C_PEAK_TOP,   t);
    leftC  = lerpRGB(C_LIT_LEFT,  C_PEAK_LEFT,  t);
    rightC = lerpRGB(C_LIT_RIGHT, C_PEAK_RIGHT, t);
  }

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

// ---------- IsometricGrid ----------

function IsometricGrid({ style }: { style?: CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLS = 14;
    const ROWS = 10;
    const WAVE_SPEED = 0.008;
    const MAX_DIAG = COLS + ROWS - 2; // 22
    const CYCLE = MAX_DIAG + 10;      // 32 — gap before wave repeats
    const LERP_F = 0.12;
    const MAX_CUBE_H = 20;

    const bright: number[][] = Array.from({ length: ROWS }, () =>
      new Array<number>(COLS).fill(0),
    );
    let wavePos = 0;
    let animId = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      const cw = canvas.width;
      const ch = canvas.height;

      // tile size: fill canvas width, cap at 48px
      const tileW = Math.min(48, Math.floor(cw / (COLS + 2)));
      const tileH = tileW / 2;
      const hw = tileW / 2;
      const hh = tileH / 2;

      // grid vertical span: from top of (0,0) cube to bottom of last tile
      const gridSpan = (COLS + ROWS - 1) * hh + tileH + MAX_CUBE_H;
      const offsetX = cw / 2;
      const offsetY = (ch - gridSpan) / 2 + MAX_CUBE_H;

      // advance wave
      wavePos = (wavePos + WAVE_SPEED) % CYCLE;

      // update brightness per tile
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const diagIdx = col + row;
          const d = (wavePos - diagIdx + CYCLE) % CYCLE;
          let target = 0;
          if (d < 1)       target = d;              // ramp up
          else if (d < 3)  target = 1;              // peak
          else if (d < 8)  target = 1 - (d - 3) / 5; // fade out
          bright[row][col] += (target - bright[row][col]) * LERP_F;
        }
      }

      ctx.clearRect(0, 0, cw, ch);

      // painter's algorithm: draw diagonals back-to-front (low diag index = back)
      for (let diag = 0; diag < COLS + ROWS - 1; diag++) {
        const colMin = Math.max(0, diag - ROWS + 1);
        const colMax = Math.min(diag, COLS - 1);
        for (let col = colMin; col <= colMax; col++) {
          const row = diag - col;
          const sx = offsetX + (col - row) * hw;
          const sy = offsetY + (col + row) * hh;
          drawModule(ctx, sx, sy, bright[row][col], tileW, tileH);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
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
        ...style,
      }}
    />
  );
}

// ---------- floating cards ----------

function CardGeneration() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'white',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
        minWidth: 158,
        animation: 'pc-fadein-up .6s .8s ease both',
        animationFillMode: 'both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: "'Open Sans',sans-serif",
          fontSize: 10.5,
          fontWeight: 800,
          color: '#1B3A2D',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: COLORS.green }}>⚡</span> Geração hoje
      </div>
      <div
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: COLORS.green,
          margin: '4px 0 2px',
          letterSpacing: '-.02em',
        }}
      >
        38,2 kWh
      </div>
      <div
        style={{
          fontFamily: "'Open Sans',sans-serif",
          fontSize: 12,
          color: '#2DAF4A',
          fontWeight: 600,
        }}
      >
        ↑ 18,4% vs média
      </div>
    </div>
  );
}

function CardNextCleaning() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: '#1B3A2D',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
        minWidth: 178,
        animation: 'pc-fadein-up .6s 1s ease both',
        animationFillMode: 'both',
      }}
    >
      <div
        style={{
          fontFamily: "'Open Sans',sans-serif",
          fontSize: 10.5,
          fontWeight: 800,
          color: 'white',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}
      >
        🧹 Próxima limpeza
      </div>
      <div
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: COLORS.green,
          margin: '4px 0 2px',
          letterSpacing: '-.01em',
        }}
      >
        23 abr · 14h
      </div>
      <div
        style={{
          fontFamily: "'Open Sans',sans-serif",
          fontSize: 12,
          color: '#7A9A84',
          fontWeight: 500,
        }}
      >
        Técnico: Ricardo M.
      </div>
    </div>
  );
}

// ---------- main Hero ----------

export default function Hero() {
  const isMobile = useIsMobile(640);

  const trustItems = [
    '✓ Equipamentos próprios',
    '✓ Monitoramento 24/7',
    '✓ Relatório mensal',
    '✓ Seguro incluso',
  ] as const;

  const animPanel = (
    <div
      style={{
        position: 'relative',
        height: isMobile ? 280 : 480,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0F382B',
        flexShrink: 0,
        animation: 'pc-fadein-up 1s .3s ease both',
        animationFillMode: 'both',
      }}
    >
      <IsometricGrid />
      {!isMobile && <CardGeneration />}
      {!isMobile && <CardNextCleaning />}
    </div>
  );

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1B3A2D 0%, #0E251C 100%)',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1280,
          margin: '0 auto',
          padding: isMobile ? '0 0 48px' : '80px 32px 100px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 0 : 48,
          alignItems: 'center',
        }}
      >
        {/* mobile: animation above text */}
        {isMobile && animPanel}

        {/* left column: content */}
        <div
          style={{
            padding: isMobile ? '32px 20px 0' : '0',
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
              ⚡ Próxima visita em 48h
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
              ✓ Técnico certificado
            </span>
          </div>

          {/* title */}
          <h1
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: isMobile
                ? 'clamp(34px, 9vw, 46px)'
                : 'clamp(40px, 4.2vw, 58px)',
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
              margin: '22px auto 0',
              maxWidth: 520,
              marginLeft: isMobile ? 'auto' : 0,
              marginRight: isMobile ? 'auto' : 0,
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
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 600,
              animation: 'pc-fadein-up .9s .35s ease both',
              animationFillMode: 'both',
            }}
          >
            {trustItems.map((item) => (
              <span key={item} style={{ whiteSpace: 'nowrap' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* right column: animation (desktop only) */}
        {!isMobile && animPanel}
      </div>
    </section>
  );
}
