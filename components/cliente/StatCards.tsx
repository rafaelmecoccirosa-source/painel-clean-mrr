'use client';

import Link from 'next/link';
import { Badge, Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { ProgressBar } from './Donut';

function CardBase({
  onClick,
  hoverable = false,
  children,
}: {
  onClick?: () => void;
  hoverable?: boolean;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    background: 'white',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(27,58,45,.08)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'box-shadow .2s ease, transform .2s ease',
  };
  if (hoverable || onClick) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,58,45,.16)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(27,58,45,.08)';
          e.currentTarget.style.transform = 'none';
        }}
        style={style}
      >
        {children}
      </div>
    );
  }
  return <div style={style}>{children}</div>;
}

export function NextCleaningCard({
  dias,
  data,
  turno,
  cidade,
  onReagendar,
}: {
  dias: number;
  data: string;
  turno: string;
  cidade: string;
  onReagendar: () => void;
}) {
  return (
    <CardBase onClick={onReagendar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Eyebrow>Próxima limpeza</Eyebrow>
        <Badge tone="greenSoft">• Agendada</Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 52,
            color: COLORS.dark,
            letterSpacing: '-.03em',
            lineHeight: 1,
          }}
        >
          {dias}
        </span>
        <span style={{ fontSize: 14, color: COLORS.muted, fontWeight: 600 }}>dias</span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.dark, marginTop: 10, fontWeight: 600 }}>{data}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
        {turno && turno !== '—' ? `${turno} · ${cidade}` : cidade}
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onReagendar();
          }}
        >
          Reagendar
        </Button>
        <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>clique para reagendar</span>
      </div>
    </CardBase>
  );
}

export function PlanoAtivoCard({
  plano,
  valor,
  usadas,
  total,
  valorOriginal,
  descontoPct,
  indicacoesAtivas,
}: {
  plano: string;
  valor: number;
  usadas: number;
  total: number;
  valorOriginal?: number;
  descontoPct?: number;
  indicacoesAtivas?: number;
}) {
  const showDesconto =
    typeof valorOriginal === 'number' &&
    typeof descontoPct === 'number' &&
    descontoPct > 0 &&
    valorOriginal > valor;
  return (
    <CardBase hoverable>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Eyebrow>Plano ativo</Eyebrow>
        <Badge tone="green">• Ativo</Badge>
      </div>
      <div
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: COLORS.dark,
          letterSpacing: '-.02em',
        }}
      >
        Plano {plano}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>R$</span>
        <span
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: COLORS.dark,
            letterSpacing: '-.02em',
            lineHeight: 1,
          }}
        >
          {valor}
        </span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>/mês</span>
      </div>
      {showDesconto && (
        <div
          style={{
            marginTop: 4,
            fontFamily: "'Open Sans',sans-serif",
            fontSize: 12,
            color: COLORS.muted,
            lineHeight: 1.4,
          }}
        >
          R$ {valorOriginal!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com{' '}
          {descontoPct}% desconto
          {indicacoesAtivas ? ` (${indicacoesAtivas} indicações ativas)` : null}
        </div>
      )}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: COLORS.muted,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
        }}
      >
        <span>Limpezas usadas</span>
        <b style={{ color: COLORS.dark }}>
          {usadas}/{total}
        </b>
      </div>
      <ProgressBar value={(usadas / total) * 100} style={{ marginTop: 6 }} />
      <div style={{ marginTop: 14 }}>
        <Link href="/cliente/plano" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.green }}>Gerenciar plano →</span>
        </Link>
      </div>
    </CardBase>
  );
}

export function EconomiaCard({ total, delta }: { total: number; delta: number }) {
  return (
    <CardBase hoverable>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Eyebrow>Economia no ciclo</Eyebrow>
        <span
          style={{
            color: COLORS.green,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ↗ +R$ {delta}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>R$</span>
        <span
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: COLORS.dark,
            letterSpacing: '-.03em',
            lineHeight: 1,
          }}
        >
          {total.toLocaleString('pt-BR')}
        </span>
      </div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, lineHeight: 1.5 }}>
        Economia estimada desde o início da assinatura — versus uma conta sem energia solar.
      </div>
      <div style={{ marginTop: 14 }}>
        <Link href="/cliente/relatorios" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.green }}>Ver detalhes →</span>
        </Link>
      </div>
    </CardBase>
  );
}
