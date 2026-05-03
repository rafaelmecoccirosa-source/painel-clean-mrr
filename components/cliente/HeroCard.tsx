'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge, Button, Particles } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import Donut from './Donut';
import type { HeroState } from '@/lib/mock-cliente';

type HeroProps = {
  state: HeroState;
  userFirst: string;
  plano: string;
  proximaLimpezaDias: number;
  proximaLimpezaData: string;
  tecnico: string;
  eficiencia: number;
  eficienciaAntes?: number;
  geracao: number;
  geracaoMeta: number;
  mesRelatorio?: string;
  quedaPct?: number;
  onAvulsa?: () => void;
  onReagendar?: () => void;
};

export default function HeroCard(props: HeroProps) {
  return <HeroShell {...props}>{renderState(props)}</HeroShell>;
}

function HeroShell({
  children,
  state,
}: HeroProps & { children: ReactNode }) {
  const accentBorder = state === 'drop' ? 'rgba(217,119,6,.35)' : undefined;
  const isCelebrate = state === 'post_cleaning' || state === 'report';
  return (
    <section
      className="pc-hero-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, #0E251C 100%)`,
        color: 'white',
        borderRadius: 24,
        padding: '40px 48px 44px',
        boxShadow: '0 20px 40px rgba(27,58,45,.22)',
        overflow: 'hidden',
        minHeight: 300,
        border: accentBorder ? `1.5px solid ${accentBorder}` : 'none',
      }}
    >
      <Particles count={isCelebrate ? 26 : 18} />

      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 220,
          height: 220,
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <path d="M110 10 L40 120 L95 120 L80 190 L160 70 L105 70 Z" fill={COLORS.green} />
      </svg>

      <div
        className="pc-hero-stack"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1.4fr auto',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function renderState(p: HeroProps): ReactNode {
  switch (p.state) {
    case 'post_cleaning':
      return <HeroPost {...p} />;
    case 'soon':
      return <HeroSoon {...p} />;
    case 'drop':
      return <HeroDrop {...p} />;
    case 'report':
      return <HeroReport {...p} />;
    default:
      return <HeroHealthy {...p} />;
  }
}

function TitleStyle(): React.CSSProperties {
  return {
    fontFamily: "'Montserrat',sans-serif",
    fontWeight: 800,
    fontSize: 42,
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: '-.025em',
    color: 'white',
    maxWidth: 640,
  };
}

function SubStyle(): React.CSSProperties {
  return {
    fontSize: 15,
    color: 'rgba(255,255,255,.75)',
    margin: '14px 0 0',
    lineHeight: 1.55,
    maxWidth: 560,
  };
}

function HeroHealthy({ userFirst, plano, proximaLimpezaDias, proximaLimpezaData, eficiencia, geracao, geracaoMeta, onAvulsa, onReagendar }: HeroProps) {
  return (
    <>
      <div>
        <HeaderBadges plano={plano} primary={<Badge tone="green">☀️ Tudo tranquilo</Badge>} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 6, fontWeight: 500 }}>
          Olá, {userFirst} ☀️
        </div>
        <h1 className="pc-hero-title" style={TitleStyle()}>
          Sua usina está <span style={{ color: COLORS.green }}>saudável</span> e a{' '}
          <span style={{ color: COLORS.green }}>{proximaLimpezaDias} dias</span> da próxima limpeza.
        </h1>
        <p style={SubStyle()}>
          Gerando <b style={{ color: 'white' }}>{eficiencia}%</b> do esperado. Próxima limpeza em{' '}
          <b style={{ color: 'white' }}>{proximaLimpezaData}</b>.
        </p>
        <div className="pc-hero-buttons" style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          <Link href="/cliente/relatorios" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Ver relatório →</Button>
          </Link>
          <Link href="/cliente/plano" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="lg" className="pc-btn-hero-outline" onClick={() => onAvulsa?.()}>Meu plano</Button>
          </Link>
        </div>
      </div>

      <div className="pc-hero-donut" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Donut value={eficiencia} label="EFICIÊNCIA" pulse />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>
            {geracao} de {geracaoMeta} kWh
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>Mês atual · média SC</div>
        </div>
      </div>
    </>
  );
}

function HeroPost({ plano, eficiencia, eficienciaAntes = 86 }: HeroProps) {
  const delta = eficiencia - eficienciaAntes;
  return (
    <>
      <div>
        <HeaderBadges plano={plano} primary={<Badge tone="green">✓ Limpeza concluída</Badge>} />
        <h1 className="pc-hero-title" style={TitleStyle()}>
          Sua geração subiu <span style={{ color: COLORS.green }}>{delta}%</span> após a limpeza.
        </h1>
        <p style={SubStyle()}>
          De <b style={{ color: 'white' }}>{eficienciaAntes}%</b> para <b style={{ color: 'white' }}>{eficiencia}%</b> de eficiência em 48h. Relatório
          fotográfico com <b style={{ color: 'white' }}>24 fotos</b> antes/depois disponível.
        </p>
        <div className="pc-hero-buttons" style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg">Ver relatório fotográfico</Button>
          <Button variant="outline" size="lg" className="pc-btn-hero-outline">Avaliar serviço ⭐</Button>
        </div>
      </div>
      <div className="pc-hero-donut" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Donut value={eficiencia} baseline={eficienciaAntes} label="EFICIÊNCIA" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(61,196,90,.14)',
            border: '1px solid rgba(61,196,90,.4)',
            padding: '8px 14px',
            borderRadius: 9999,
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{eficienciaAntes}%</span>
          <span style={{ color: COLORS.green, fontWeight: 900 }}>→</span>
          <span style={{ fontSize: 13, color: 'white', fontWeight: 800 }}>{eficiencia}%</span>
          <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 12 }}>↑ +{delta} pp</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>Medido 48h após a limpeza</div>
      </div>
    </>
  );
}

function HeroSoon({ plano, proximaLimpezaDias, proximaLimpezaData, tecnico, onReagendar }: HeroProps) {
  return (
    <>
      <div>
        <HeaderBadges plano={plano} primary={<Badge tone="amber">⏰ Limpeza em {proximaLimpezaDias} dias</Badge>} />
        <h1 className="pc-hero-title" style={TitleStyle()}>Sua limpeza está chegando.</h1>
        <p style={SubStyle()}>
          <b style={{ color: 'white' }}>{proximaLimpezaData}</b> · Técnico <b style={{ color: 'white' }}>{tecnico}</b>. Turno da manhã.
        </p>
        <div className="pc-hero-buttons" style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg">Ver detalhes do serviço</Button>
          <Button variant="outline" size="lg" className="pc-btn-hero-outline" onClick={() => onReagendar?.()}>Reagendar</Button>
        </div>
      </div>
      <TechCard tecnico={tecnico} />
    </>
  );
}

function HeroDrop({ plano, quedaPct = 8, geracao, geracaoMeta, onReagendar }: HeroProps) {
  return (
    <>
      <div>
        <HeaderBadges plano={plano} primary={<Badge tone="amber">⚠️ Queda detectada</Badge>} />
        <h1 className="pc-hero-title" style={TitleStyle()}>
          Detectamos queda de <span style={{ color: '#FBBF24' }}>{quedaPct}%</span> na geração.
        </h1>
        <p style={SubStyle()}>
          Sua usina gerou <b style={{ color: 'white' }}>{geracao} kWh</b> este mês vs <b style={{ color: 'white' }}>{geracaoMeta} kWh</b>{' '}
          esperados. Recomendamos limpeza antecipada — <b style={{ color: COLORS.green }}>sem custo extra</b>.
        </p>
        <div className="pc-hero-buttons" style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={() => onReagendar?.()}>⚡ Solicitar limpeza agora</Button>
          <Button variant="outline" size="lg" className="pc-btn-hero-outline">Ver relatório</Button>
        </div>
      </div>
      <div className="pc-hero-donut" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Donut value={Math.max(0, 94 - quedaPct)} baseline={94} color="#D97706" label="EFICIÊNCIA" deltaLabel={`↓ ${quedaPct}% vs média`} />
      </div>
    </>
  );
}

function HeroReport({ plano, mesRelatorio = 'março', geracao, eficiencia }: HeroProps) {
  return (
    <>
      <div>
        <HeaderBadges plano={plano} primary={<Badge tone="blue">📄 Relatório disponível</Badge>} />
        <h1 className="pc-hero-title" style={TitleStyle()}>
          Seu relatório de <span style={{ color: COLORS.green }}>{mesRelatorio}</span> chegou.
        </h1>
        <p style={SubStyle()}>
          Você gerou <b style={{ color: 'white' }}>{geracao} kWh</b> · eficiência <b style={{ color: 'white' }}>{eficiencia}%</b>.
        </p>
        <div className="pc-hero-buttons" style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg">Ver relatório →</Button>
          <Button variant="outline" size="lg" className="pc-btn-hero-outline">Baixar PDF</Button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, paddingRight: 8 }}>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,.55)',
            fontWeight: 700,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          {mesRelatorio} · total gerado
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: '-.045em',
              color: 'white',
              textShadow: '0 2px 24px rgba(61,196,90,.35)',
            }}
          >
            {geracao}
          </span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,.7)', fontWeight: 700 }}>kWh</span>
        </div>
      </div>
    </>
  );
}

function HeaderBadges({ plano, primary }: { plano: string; primary: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      {primary}
      <Badge tone="dark">Plano {plano}</Badge>
    </div>
  );
}

function TechCard({ tecnico }: { tecnico: string }) {
  const initials = tecnico
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      style={{
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.14)',
        borderRadius: 18,
        padding: '22px 22px 20px',
        width: 240,
        textAlign: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,.6)',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        Seu técnico
      </div>
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 9999,
          margin: '0 auto 12px',
          background: `linear-gradient(135deg, ${COLORS.green}, #2DAF4A)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Montserrat',sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: 'white',
          border: '3px solid rgba(255,255,255,.14)',
          boxShadow: '0 6px 16px rgba(0,0,0,.25)',
        }}
      >
        {initials}
      </div>
      <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 16, color: 'white', letterSpacing: '-.01em' }}>
        {tecnico}
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 6,
          fontSize: 13,
          fontWeight: 700,
          color: '#FBBF24',
        }}
      >
        <span style={{ fontSize: 14 }}>⭐</span> 4.9
        <span style={{ color: 'rgba(255,255,255,.5)', fontWeight: 500, marginLeft: 2 }}>(87)</span>
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,.12)',
          fontSize: 11,
          color: 'rgba(255,255,255,.65)',
          lineHeight: 1.5,
        }}
      >
        <b style={{ color: 'white' }}>87</b> limpezas realizadas
      </div>
    </div>
  );
}
