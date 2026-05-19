'use client'

import { useEffect, useRef } from 'react'
import { COLORS } from '@/lib/brand-tokens'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    let animId: number
    let cells: any[] = []

    const DARK_TOP    = '#1a4d38'
    const DARK_LEFT   = '#0d2e20'
    const DARK_RIGHT  = '#122a1c'
    const LIT_TOP     = '#3DC45A'
    const LIT_LEFT    = '#2a9444'
    const LIT_RIGHT   = '#1f7a35'
    const BRIGHT_TOP  = '#7FE89A'
    const BRIGHT_LEFT = '#3DC45A'
    const BRIGHT_RIGHT= '#2a9444'

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1,3),16)
      const g = parseInt(hex.slice(3,5),16)
      const b = parseInt(hex.slice(5,7),16)
      return [r,g,b]
    }

    function lerp(a: number, b: number, t: number) { return a + (b-a)*t }

    function mixColor(c1: string, c2: string, t: number) {
      const a = hexToRgb(c1), b = hexToRgb(c2)
      return `rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`
    }

    function drawCell(col: number, row: number, h: number, topC: string, leftC: string, rightC: string, ISO_X: number, ISO_Y: number, offsetX: number, offsetY: number) {
      const x = offsetX + (col - row) * ISO_X
      const y = offsetY + (col + row) * ISO_Y - h

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + ISO_X, y + ISO_Y)
      ctx.lineTo(x, y + ISO_Y*2)
      ctx.lineTo(x - ISO_X, y + ISO_Y)
      ctx.closePath()
      ctx.fillStyle = topC
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x - ISO_X, y + ISO_Y)
      ctx.lineTo(x, y + ISO_Y*2)
      ctx.lineTo(x, y + ISO_Y*2 + h)
      ctx.lineTo(x - ISO_X, y + ISO_Y + h)
      ctx.closePath()
      ctx.fillStyle = leftC
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x + ISO_X, y + ISO_Y)
      ctx.lineTo(x, y + ISO_Y*2)
      ctx.lineTo(x, y + ISO_Y*2 + h)
      ctx.lineTo(x + ISO_X, y + ISO_Y + h)
      ctx.closePath()
      ctx.fillStyle = rightC
      ctx.fill()
    }

    function buildCells(COLS: number, ROWS: number) {
      cells = []
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells.push({
            col: c, row: r,
            phase: Math.random() * Math.PI * 2,
            baseH: 4 + Math.random() * 3,
            lit: 0,
          })
        }
      }
    }

    let t = 0
    const WAVE_SPEED = 0.005
    const WAVE_WIDTH = 4.5

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function start() {
      resize()
      if (canvas.width === 0) { animId = requestAnimationFrame(start); return }

      const CELL   = 48
      const ISO_X  = CELL * 0.58
      const ISO_Y  = CELL * 0.30
      const COLS   = Math.ceil(canvas.width  / (ISO_X) + 4)
      const ROWS   = Math.ceil(canvas.height / (ISO_Y * 2) + 4)
      buildCells(COLS, ROWS)

      const offsetX = canvas.width  * 0.52
      const offsetY = canvas.height * 0.78

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        t += WAVE_SPEED

        const wavePos = (t % 1) * (COLS + ROWS)
        const sorted  = [...cells].sort((a,b) => (a.col+a.row)-(b.col+b.row))

        for (const cell of sorted) {
          const diag = (COLS - 1 - cell.col) + cell.row
          const dist = wavePos - diag
          let lit = 0
          if (dist > 0 && dist < WAVE_WIDTH) {
            lit = Math.sin((dist / WAVE_WIDTH) * Math.PI)
          } else if (dist >= WAVE_WIDTH) {
            lit = Math.max(0, 1 - (dist - WAVE_WIDTH) * 0.13) * 0.38
          }
          cell.lit = lerp(cell.lit, lit, 0.10)

          const pulse = Math.sin(t * 2.5 + cell.phase) * 0.04
          const h     = cell.baseH + cell.lit * 18 + pulse * 2

          let topC: string, leftC: string, rightC: string
          if (cell.lit > 0.55) {
            const blend = (cell.lit - 0.55) / 0.45
            topC   = mixColor(LIT_TOP,   BRIGHT_TOP,   blend)
            leftC  = mixColor(LIT_LEFT,  BRIGHT_LEFT,  blend)
            rightC = mixColor(LIT_RIGHT, BRIGHT_RIGHT, blend)
          } else {
            topC   = mixColor(DARK_TOP,   LIT_TOP,   cell.lit)
            leftC  = mixColor(DARK_LEFT,  LIT_LEFT,  cell.lit)
            rightC = mixColor(DARK_RIGHT, LIT_RIGHT, cell.lit)
          }
          drawCell(cell.col, cell.row, h, topC, leftC, rightC, ISO_X, ISO_Y, offsetX, offsetY)
        }
        animId = requestAnimationFrame(loop)
      }
      loop()
    }

    animId = requestAnimationFrame(start)
    window.addEventListener('resize', () => { resize(); })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => {})
    }
  }, [])

  return (
    <section style={{
      minHeight: '100vh',
      background: '#0F382B',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Coluna esquerda — conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 48px 80px 64px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(61,196,90,0.15)',
            border: '0.5px solid rgba(61,196,90,0.4)',
            color: '#3DC45A',
            fontSize: 12,
            letterSpacing: '0.5px',
            padding: '5px 14px',
            borderRadius: 100,
          }}>⚡ 1ª limpeza com 50% off</span>
          <span style={{
            background: 'rgba(255,255,255,0.07)',
            border: '0.5px solid rgba(255,255,255,0.15)',
            color: '#C8DFC0',
            fontSize: 12,
            padding: '5px 14px',
            borderRadius: 100,
          }}>🇧🇷 Feito em Santa Catarina</span>
        </div>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.5vw, 56px)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.1,
          margin: '0 0 8px',
        }}>
          Sua usina solar<br />merece cuidado
        </h1>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.5vw, 56px)',
          fontWeight: 800,
          color: '#3DC45A',
          lineHeight: 1.1,
          margin: '0 0 24px',
        }}>todo mês.</h1>

        <p style={{
          color: 'rgba(200,223,192,0.8)',
          fontSize: 16,
          lineHeight: 1.6,
          margin: '0 0 36px',
          maxWidth: 420,
        }}>
          Painéis sujos podem perder até <strong style={{ color: '#3DC45A' }}>30% de eficiência</strong>.<br />
          Mantenha sua geração no máximo com assinatura mensal a partir de R$ 30.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          <a href="#planos" style={{
            background: '#3DC45A',
            color: '#0F382B',
            fontWeight: 700,
            fontSize: 15,
            padding: '14px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            display: 'inline-block',
          }}>Assinar agora →</a>
          <a href="#calculadora" style={{
            background: 'transparent',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            padding: '14px 28px',
            borderRadius: 8,
            border: '1.5px solid rgba(255,255,255,0.25)',
            textDecoration: 'none',
            display: 'inline-block',
          }}>Calcular economia</a>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['2 limpezas/ano','Relatório mensal','Checkup técnico','Seguro na limpeza'].map(item => (
            <span key={item} style={{ color: 'rgba(200,223,192,0.65)', fontSize: 13 }}>
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Coluna direita — canvas isométrico */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* Mobile */}
      <style>{`
        @media (max-width: 640px) {
          section { grid-template-columns: 1fr !important; }
          section > div:first-child { padding: 60px 24px 32px !important; }
          section > div:last-child { height: 300px; position: relative; }
          section > div:last-child canvas { position: absolute !important; }
        }
      `}</style>
    </section>
  )
}
