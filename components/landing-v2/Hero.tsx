'use client'
import dynamic from 'next/dynamic'

const SolarAnimation = dynamic(() => import('./SolarAnimation'), { ssr: false })

export default function Hero() {
  return (
    <section style={{
      minHeight: '75vh',
      background: '#0B2D1E',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Gradiente radial de fundo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 80% at 70% 50%, rgba(61,196,90,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 20% 50%, rgba(61,196,90,0.04) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
        zIndex: 1,
      }}/>

      {/* Linhas diagonais de fundo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 40px,
          rgba(61,196,90,0.025) 40px,
          rgba(61,196,90,0.025) 41px
        )`,
        pointerEvents: 'none',
        zIndex: 1,
      }}/>

      {/* Animação Three.js — fundo completo */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <SolarAnimation />
      </div>

      {/* Conteúdo — sobreposto à esquerda */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '52%',
        paddingRight: 40,
        paddingLeft: 'max(32px, calc((100vw - 1280px) / 2 + 32px))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 'clamp(60px, 8vh, 100px)',
        zIndex: 4,
      }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(61,196,90,0.15)',
            border: '0.5px solid rgba(61,196,90,0.4)',
            color: '#3DC45A',
            fontSize: 12,
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
          }}>SC · Feito em Santa Catarina</span>
        </div>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.8vw, 58px)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.08,
          margin: '0 0 4px',
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.8s ease-out both',
        }}>Sua usina solar<br/>merece cuidado</h1>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.8vw, 58px)',
          fontWeight: 800,
          color: '#3DC45A',
          lineHeight: 1.08,
          margin: '0 0 24px',
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.8s 0.1s ease-out both',
        }}>todo mês.</h1>

        <p style={{
          color: 'rgba(200,223,192,0.8)',
          fontSize: 16,
          lineHeight: 1.65,
          margin: '0 0 36px',
          maxWidth: 420,
          textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          animation: 'fadeUp 0.8s 0.2s ease-out both',
        }}>
          Painéis sujos podem perder até{' '}
          <strong style={{ color: '#3DC45A' }}>30% de eficiência</strong>.<br/>
          Mantenha sua geração no máximo com assinatura mensal a partir de R$ 30.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 32,
          animation: 'fadeUp 0.8s 0.3s ease-out both',
        }}>
          <a href="#planos" style={{
            background: '#3DC45A',
            color: '#0F382B',
            fontWeight: 700,
            fontSize: 15,
            padding: '14px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(61,196,90,0.35)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = ''
            ;(e.currentTarget as HTMLElement).style.boxShadow = ''
          }}>
            Assinar agora →
          </a>
          <a href="#calculadora" style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            padding: '14px 28px',
            borderRadius: 8,
            border: '1.5px solid rgba(255,255,255,0.25)',
            textDecoration: 'none',
            transition: 'border-color 150ms ease-out, background 150ms ease-out',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.5)'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.45)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.3)'
          }}>
            Calcular economia
          </a>
        </div>

        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          animation: 'fadeUp 0.8s 0.4s ease-out both',
        }}>
          {['🧹 2 limpezas/ano','⚡ Relatório mensal','🔧 Checkup técnico','🛡️ Seguro incluso'].map(item => (
            <span key={item} style={{ color: 'rgba(200,223,192,0.6)', fontSize: 13, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{item}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          section {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          section > div:nth-child(3) {
            position: relative !important;
            inset: unset !important;
            width: 100% !important;
            height: 280px !important;
            order: 2 !important;
            margin-top: 0 !important;
          }
          section > div:nth-child(4) {
            position: relative !important;
            inset: unset !important;
            left: unset !important;
            top: unset !important;
            bottom: unset !important;
            width: 100% !important;
            padding: 60px 24px 0 !important;
            min-height: auto !important;
            order: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}
