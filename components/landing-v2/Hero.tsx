'use client'
import dynamic from 'next/dynamic'

const SolarAnimation = dynamic(() => import('./SolarAnimation'), { ssr: false })

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      background: '#0B2D1E',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Fundo com gradiente radial + linhas diagonais — igual versão com foto */}
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

      {/* Coluna esquerda — conteúdo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(40px,5vh,80px) 48px clamp(40px,5vh,80px) clamp(24px,5vw,64px)',
        position: 'relative',
        zIndex: 3,
        maxWidth: 560,
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
          }}>🇧🇷 Feito em Santa Catarina</span>
        </div>

        {/* Título com animação de entrada */}
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.8vw, 58px)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.08,
          margin: '0 0 4px',
          animation: 'fadeUp 0.8s ease-out both',
        }}>Sua usina solar<br/>merece cuidado</h1>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 'clamp(32px, 3.8vw, 58px)',
          fontWeight: 800,
          color: '#3DC45A',
          lineHeight: 1.08,
          margin: '0 0 24px',
          animation: 'fadeUp 0.8s 0.1s ease-out both',
        }}>todo mês.</h1>

        <p style={{
          color: 'rgba(200,223,192,0.8)',
          fontSize: 16,
          lineHeight: 1.65,
          margin: '0 0 36px',
          maxWidth: 420,
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
            background: 'transparent',
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
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
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
            <span key={item} style={{ color: 'rgba(200,223,192,0.6)', fontSize: 13 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Coluna direita — animação Three.js */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SolarAnimation />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          section { grid-template-columns: 1fr !important; }
          section > div:last-child { height: 300px; }
        }
      `}</style>
    </section>
  )
}
