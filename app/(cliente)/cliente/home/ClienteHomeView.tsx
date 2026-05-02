'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import HeroCard from '@/components/cliente/HeroCard';
import { NextCleaningCard, PlanoAtivoCard, EconomiaCard } from '@/components/cliente/StatCards';
import ReagendarModal from '@/components/cliente/ReagendarModal';
import { formatDateBR } from '@/lib/mock-cliente';
import type { HeroState, HistoricoRow } from '@/lib/mock-cliente';

export type ClienteHomeProps = {
  userFirst: string;
  cidade: string;
  plano: string;
  mensalidade: number;
  mensalidadeOriginal: number;
  modulosCount: number;
  limpezasUsadas: number;
  limpezasTotal: number;
  descontoPct: number;
  indicacoesAtivas: number;
  economiaAcumulada: number;
  economiaLastMonth: number;
  heroState: HeroState;
  proximaLimpezaDias: number;
  proximaLimpezaData: string;
  proximaLimpezaTurno: string;
  tecnico: string;
  eficiencia: number;
  geracao: number;
  geracaoMeta: number;
  mesRelatorio: string;
  quedaPct?: number;
  historico: HistoricoRow[];
  isDemo: boolean;
};

export default function ClienteHomeView(props: ClienteHomeProps) {
  const [reagendarOpen, setReagendarOpen] = useState(false);

  const {
    userFirst, plano, mensalidade, mensalidadeOriginal, descontoPct, indicacoesAtivas,
    limpezasUsadas, limpezasTotal, economiaAcumulada, economiaLastMonth,
    heroState, proximaLimpezaDias, proximaLimpezaData, proximaLimpezaTurno,
    cidade, tecnico, eficiencia, geracao, geracaoMeta, mesRelatorio, quedaPct,
    historico, isDemo,
  } = props;

  return (
    <>
      <main
        className="pc-mobile-pad"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 28px 72px',
          display: 'grid',
          gap: 24,
        }}
      >
        {isDemo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 13,
              color: '#92400E',
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            <span>⚠️</span>
            <span>
              <b>Dados demo</b> — nenhuma assinatura ativa encontrada. Estes são dados de
              demonstração.
            </span>
          </div>
        )}

        <div className="fade-up">
          <HeroCard
            state={heroState}
            userFirst={userFirst}
            plano={plano}
            proximaLimpezaDias={proximaLimpezaDias}
            proximaLimpezaData={proximaLimpezaData}
            tecnico={tecnico}
            eficiencia={eficiencia}
            geracao={geracao}
            geracaoMeta={geracaoMeta}
            mesRelatorio={mesRelatorio}
            quedaPct={quedaPct}
            onReagendar={() => setReagendarOpen(true)}
          />
        </div>

        <section
          className="fade-up fade-up-1 pc-mobile-stack"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
        >
          <NextCleaningCard
            dias={proximaLimpezaDias}
            data={proximaLimpezaData}
            turno={proximaLimpezaTurno}
            cidade={cidade}
            onReagendar={() => setReagendarOpen(true)}
          />
          <PlanoAtivoCard
            plano={plano}
            valor={mensalidade}
            valorOriginal={descontoPct > 0 ? mensalidadeOriginal : undefined}
            descontoPct={descontoPct > 0 ? descontoPct : undefined}
            indicacoesAtivas={indicacoesAtivas > 0 ? indicacoesAtivas : undefined}
            usadas={limpezasUsadas}
            total={limpezasTotal}
          />
          <EconomiaCard total={economiaAcumulada} delta={economiaLastMonth} />
        </section>

        <div className="fade-up fade-up-2">
          <HistorySection historico={historico} />
        </div>

        <div className="fade-up fade-up-3">
          <AvulsaFooterCTA />
        </div>
      </main>

      <ReagendarModal
        open={reagendarOpen}
        onClose={() => setReagendarOpen(false)}
        atualData={proximaLimpezaData}
        atualTurno={proximaLimpezaTurno}
        tecnico={tecnico}
      />
    </>
  );
}

function HistorySection({ historico }: { historico: HistoricoRow[] }) {
  const rows = historico.slice(0, 2);
  return (
    <section>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: COLORS.dark,
              margin: 0,
              letterSpacing: '-.015em',
            }}
          >
            Histórico de serviços
          </h3>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '3px 0 0' }}>
            {historico.length} limpeza{historico.length !== 1 ? 's' : ''} realizada
            {historico.length !== 1 ? 's' : ''} desde o início da assinatura
          </p>
        </div>
        <Link href="/cliente/historico" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm">
            Ver tudo →
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: '32px 22px',
            textAlign: 'center',
            color: COLORS.muted,
            fontSize: 14,
          }}
        >
          Nenhum serviço realizado ainda.
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(27,58,45,.08)',
          }}
        >
          {rows.map((row, i) => (
            <HistoryRow key={row.id} row={row} last={i === rows.length - 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryRow({ row, last }: { row: HistoricoRow; last: boolean }) {
  const hasGanho = row.ganho && row.ganho !== '—';
  return (
    <div
      className="pc-mobile-grid-col"
      style={{
        display: 'grid',
        gridTemplateColumns: `44px 1fr${hasGanho ? ' auto' : ''} auto auto`,
        gap: 18,
        alignItems: 'center',
        padding: '16px 22px',
        borderBottom: last ? 'none' : `1px solid ${COLORS.border}`,
        background: 'white',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: COLORS.light,
          color: COLORS.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        {row.tipo === 'assinatura' ? '☀️' : '⚡'}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{row.titulo}</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
          {row.data ? formatDateBR(row.data) : '—'} · {row.tecnico}
        </div>
      </div>
      {hasGanho && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.green,
            background: COLORS.light,
            padding: '4px 10px',
            borderRadius: 9999,
          }}
        >
          {row.ganho} geração
        </div>
      )}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          background: '#ECFDF5',
          color: '#059669',
          whiteSpace: 'nowrap',
        }}
      >
        Concluído
      </span>
      <Button variant="secondary" size="sm">
        Ver PDF
      </Button>
    </div>
  );
}

function AvulsaFooterCTA() {
  return (
    <section>
      <div
        style={{
          background: COLORS.light,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'white',
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: COLORS.dark,
                letterSpacing: '-.005em',
              }}
            >
              Precisa de uma limpeza antes do agendamento?
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
              Avulsa a partir de R$ 108 para assinantes · 40% off do preço normal
            </div>
          </div>
        </div>
        <Link href="/cliente/avulsa" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="lg">
            Solicitar avulsa →
          </Button>
        </Link>
      </div>
    </section>
  );
}
