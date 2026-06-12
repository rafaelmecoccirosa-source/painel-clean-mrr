'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { ProgressBar } from '@/components/cliente/Donut';

const PLANS = [
  {
    id: 'basic' as const,
    nome: 'Básico',
    range: 'até 15 módulos',
    preco: 30,
    features: ['2 limpezas/ano', 'Monitoramento 24/7', 'Relatório mensal', 'WhatsApp'],
  },
  {
    id: 'standard' as const,
    nome: 'Padrão',
    range: '16–30 módulos',
    preco: 50,
    features: ['2 limpezas/ano', 'Monitoramento 24/7', 'Relatório fotográfico', 'Emergencial incluso', 'Checkup anual'],
  },
  {
    id: 'plus' as const,
    nome: 'Plus',
    range: '31–60 módulos',
    preco: 100,
    features: ['2 limpezas/ano', 'Relatório premium', 'Checkup semestral', 'Gerente dedicado'],
  },
];

export interface PlanoProps {
  isDemo: boolean;
  status: 'active' | 'cancelled' | 'paused';
  planType: string;
  planName: string;
  priceMonthly: number;
  discountPct: number;
  priceEffective: number;
  modulesCount: number;
  startedAt: string;
  contractMonths: number;
  cancelledAt: string | null;
  cancellationFee: number | null;
  nextInvoice: { amount: number; dueDate: string; status: string; type: string } | null;
  nextBillingAt: string | null;
  extraPrice: number | null;
  avulsoPrice: number | null;
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function monthsBetween(start: Date, end: Date) {
  return Math.max(0,
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) -
    (end.getDate() < start.getDate() ? 1 : 0),
  );
}

export default function PlanoView(p: PlanoProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen]   = useState(false);
  const [simulando, setSimulando]   = useState(false);
  const [simulacao, setSimulacao]   = useState<{ mesesRestantes: number; saldo: number } | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelErro, setCancelErro] = useState<string | null>(null);
  const [cancelado, setCancelado]   = useState<{ saldo: number } | null>(null);

  const started = new Date(p.startedAt);
  const contractEnd = new Date(started);
  contractEnd.setMonth(contractEnd.getMonth() + p.contractMonths);
  const mesesUsados = Math.min(p.contractMonths, monthsBetween(started, new Date()));
  const isCancelled = p.status === 'cancelled';

  async function abrirModal() {
    setModalOpen(true);
    setCancelErro(null);
    if (p.isDemo) {
      setSimulacao({ mesesRestantes: Math.max(0, p.contractMonths - mesesUsados), saldo: (p.contractMonths - mesesUsados) * p.priceEffective });
      return;
    }
    setSimulando(true);
    try {
      const res = await fetch('/api/cliente/cancelar');
      const data = await res.json();
      if (res.ok) setSimulacao({ mesesRestantes: data.mesesRestantes, saldo: data.saldo });
      else setCancelErro(data.error ?? 'Erro ao calcular saldo devedor.');
    } catch {
      setCancelErro('Erro de rede. Tente novamente.');
    } finally {
      setSimulando(false);
    }
  }

  async function confirmarCancelamento() {
    if (p.isDemo) { setCancelErro('Conta demo — cancelamento desabilitado.'); return; }
    setCancelando(true);
    setCancelErro(null);
    try {
      const res = await fetch('/api/cliente/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelado({ saldo: data.saldo });
        router.refresh();
      } else {
        setCancelErro(data.error ?? 'Erro ao cancelar.');
      }
    } catch {
      setCancelErro('Erro de rede. Tente novamente.');
    } finally {
      setCancelando(false);
    }
  }

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      {p.isDemo && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, fontWeight: 600, background: '#FFFBEB', color: '#92400E', padding: '4px 12px', borderRadius: 9999 }}>
            ⚠️ Dados demo
          </span>
        </div>
      )}

      {/* Hero dark — plano ativo/cancelado */}
      <section
        className="fade-up pc-hero-section"
        style={{
          background: `linear-gradient(135deg, ${COLORS.dark} 0%, #0E251C 100%)`,
          color: 'white',
          borderRadius: 24,
          padding: '36px 40px',
          boxShadow: '0 20px 40px rgba(27,58,45,.22)',
        }}
      >
        <Eyebrow color="#6EE7A0">{isCancelled ? 'Assinatura cancelada' : `Plano ${p.planName} ativo`}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>R$</span>
          <span
            className="pc-mobile-jumbo"
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: 'white',
              letterSpacing: '-.03em',
              lineHeight: 1,
            }}
          >
            {p.priceEffective % 1 === 0 ? p.priceEffective : p.priceEffective.toFixed(2).replace('.', ',')}
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>/mês</span>
        </div>
        {p.discountPct > 0 ? (
          <div style={{ marginTop: 6, fontSize: 14, color: '#6EE7A0', fontWeight: 600 }}>
            R$ {p.priceMonthly.toFixed(0)},00 com {p.discountPct.toFixed(0)}% de desconto por indicações
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 14, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>
            Indique amigos e ganhe até 30% de desconto na mensalidade
          </div>
        )}

        <div
          style={{
            marginTop: 26,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 18,
            paddingTop: 22,
            borderTop: '1px solid rgba(255,255,255,.15)',
          }}
        >
          {[
            { label: 'Módulos cobertos', v: `${p.modulesCount} módulos` },
            { label: 'Limpezas incluídas', v: '2 por ano' },
            { label: 'Limpeza extra', v: '40% off avulso' },
            { label: 'Relatórios', v: 'Mensais no app' },
          ].map((r) => (
            <div key={r.label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,.5)',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: 'white',
                  marginTop: 4,
                  letterSpacing: '-.01em',
                }}
              >
                {r.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Próxima cobrança + contrato */}
      <section
        className="fade-up fade-up-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}
      >
        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 12px rgba(27,58,45,.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Eyebrow>{p.nextInvoice ? 'Fatura em aberto' : 'Próxima cobrança'}</Eyebrow>
            <Badge tone={p.nextInvoice ? 'amber' : 'greenSoft'}>
              {p.nextInvoice ? 'Aguardando PIX' : 'Em dia'}
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
            <span
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: COLORS.dark,
                letterSpacing: '-.02em',
                lineHeight: 1,
              }}
            >
              {fmtBRL(p.nextInvoice ? p.nextInvoice.amount : p.priceEffective)}
            </span>
            <span style={{ fontSize: 14, color: COLORS.muted }}>
              {p.nextInvoice
                ? `vence em ${fmtDate(p.nextInvoice.dueDate)}`
                : p.nextBillingAt ? `em ${fmtDate(p.nextBillingAt)}` : ''}
            </span>
          </div>
          {p.nextInvoice && p.nextInvoice.type !== 'mensalidade' && (
            <div style={{ marginTop: 8, fontSize: 12, color: COLORS.muted }}>
              {p.nextInvoice.type === 'adesao'
                ? 'Taxa de adesão — 50% de uma limpeza avulsa, inclui sua 1ª limpeza.'
                : 'Saldo devedor de cancelamento.'}
            </div>
          )}
          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
              color: COLORS.dark,
            }}
          >
            <div
              style={{
                width: 36,
                height: 24,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.dark})`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              ◈
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              PIX manual — você recebe a chave por WhatsApp/email
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 12px rgba(27,58,45,.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Eyebrow>Contrato</Eyebrow>
            <Badge tone={isCancelled ? 'amber' : 'blue'}>{isCancelled ? 'Cancelado' : 'Carência'}</Badge>
          </div>
          <div
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: COLORS.dark,
              marginTop: 12,
              textTransform: 'capitalize',
            }}
          >
            {started.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} → {contractEnd.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
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
            <span>Ciclo de {p.contractMonths} meses</span>
            <b style={{ color: COLORS.dark }}>
              {mesesUsados} de {p.contractMonths}
            </b>
          </div>
          <ProgressBar value={(mesesUsados / p.contractMonths) * 100} style={{ marginTop: 8 }} />
          {isCancelled ? (
            <p style={{ fontSize: 12, color: '#92400E', marginTop: 14, lineHeight: 1.5 }}>
              Assinatura cancelada{p.cancelledAt ? ` em ${fmtDate(p.cancelledAt)}` : ''}.
              {p.cancellationFee && p.cancellationFee > 0
                ? ` Saldo devedor de ${fmtBRL(p.cancellationFee)} — fatura disponível na próxima cobrança.`
                : ' Sem multa.'}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 14, lineHeight: 1.5 }}>
              Contrato mínimo de {p.contractMonths} meses. Cancelamento antes da carência paga saldo devedor do período restante.
            </p>
          )}
        </div>
      </section>

      {/* Comparativo de planos */}
      <section className="fade-up fade-up-2">
        <Eyebrow>Comparativo de planos</Eyebrow>
        <h2
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: COLORS.dark,
            margin: '6px 0 20px',
            letterSpacing: '-.02em',
          }}
        >
          Fazer upgrade ou mudar de plano
        </h2>
        <div className="pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {PLANS.map((pl) => {
            const isAtual = pl.id === p.planType && !isCancelled;
            return (
              <div
                key={pl.id}
                style={{
                  background: 'white',
                  border: `${isAtual ? 2 : 1}px solid ${isAtual ? COLORS.green : COLORS.border}`,
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: isAtual ? '0 8px 24px rgba(61,196,90,.18)' : '0 2px 12px rgba(27,58,45,.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                }}
              >
                {isAtual && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: 16,
                      background: COLORS.green,
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 9999,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Seu plano
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: 20,
                    color: COLORS.dark,
                  }}
                >
                  {pl.nome}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{pl.range}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>R$</span>
                  <span
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 32,
                      color: COLORS.dark,
                      letterSpacing: '-.02em',
                      lineHeight: 1,
                    }}
                  >
                    {pl.preco}
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.muted }}>/mês</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'grid', gap: 8 }}>
                  {pl.features.map((f) => (
                    <li
                      key={f}
                      style={{ display: 'flex', gap: 8, fontSize: 13, color: COLORS.dark, lineHeight: 1.4 }}
                    >
                      <span style={{ color: COLORS.green, fontWeight: 800 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                  {isAtual ? (
                    <div style={{ fontSize: 12, color: COLORS.muted, fontStyle: 'italic' }}>Seu plano atual</div>
                  ) : (
                    <Button variant="secondary" size="md" fullWidth>
                      Fazer upgrade
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Limpeza extra */}
      {!isCancelled && p.extraPrice !== null && p.avulsoPrice !== null && (
        <section
          className="fade-up fade-up-3"
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
          <div>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: COLORS.dark,
              }}
            >
              Como assinante {p.planName}, sua limpeza extra custa {fmtBRL(p.extraPrice)}
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
              Preço avulso seria {fmtBRL(p.avulsoPrice)} · você economiza 40%
            </div>
          </div>
          <Link href="/cliente/avulsa" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              Solicitar limpeza extra →
            </Button>
          </Link>
        </section>
      )}

      {/* Cancelamento */}
      {!isCancelled && (
        <section
          className="fade-up fade-up-4"
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 12px rgba(27,58,45,.06)',
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: COLORS.dark,
            }}
          >
            Cancelamento da assinatura
          </div>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '6px 0 14px', lineHeight: 1.5, maxWidth: 720 }}>
            Seu contrato tem carência de {p.contractMonths} meses. Ao cancelar antes da carência você paga o saldo devedor do
            período restante. Após {p.contractMonths} meses você pode cancelar a qualquer momento sem multa.
          </p>
          <button
            onClick={abrirModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#B91C1C',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Solicitar cancelamento
          </button>
        </section>
      )}

      {/* Modal de cancelamento */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(27,58,45,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => !cancelando && setModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 28,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 60px rgba(27,58,45,.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {cancelado ? (
              <>
                <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.dark, margin: 0 }}>
                  Assinatura cancelada
                </h3>
                <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: '12px 0 20px' }}>
                  {cancelado.saldo > 0
                    ? <>Geramos a fatura do saldo devedor de <b style={{ color: COLORS.dark }}>{fmtBRL(cancelado.saldo)}</b> com vencimento em 7 dias. Você recebe a chave PIX por WhatsApp/email.</>
                    : 'Cancelamento concluído sem multa. Sentiremos sua falta!'}
                </p>
                <Button variant="primary" size="md" fullWidth onClick={() => setModalOpen(false)}>
                  Entendi
                </Button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.dark, margin: 0 }}>
                  Cancelar assinatura?
                </h3>
                {simulando ? (
                  <p style={{ fontSize: 14, color: COLORS.muted, margin: '12px 0 20px' }}>Calculando saldo devedor…</p>
                ) : simulacao ? (
                  <div style={{ margin: '12px 0 20px' }}>
                    {simulacao.saldo > 0 ? (
                      <>
                        <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
                          Você está na carência do contrato — faltam <b style={{ color: COLORS.dark }}>{simulacao.mesesRestantes} {simulacao.mesesRestantes === 1 ? 'mês' : 'meses'}</b>.
                          Ao cancelar agora, será gerada uma fatura de saldo devedor de:
                        </p>
                        <div
                          style={{
                            marginTop: 12,
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: 12,
                            padding: '14px 16px',
                            fontFamily: "'Montserrat',sans-serif",
                            fontWeight: 800,
                            fontSize: 26,
                            color: '#92400E',
                          }}
                        >
                          {fmtBRL(simulacao.saldo)}
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
                        Você já cumpriu a carência de {p.contractMonths} meses — pode cancelar <b style={{ color: COLORS.dark }}>sem multa</b>.
                      </p>
                    )}
                  </div>
                ) : null}

                {cancelErro && (
                  <p style={{ fontSize: 13, color: '#B91C1C', margin: '0 0 14px' }}>{cancelErro}</p>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="secondary" size="md" fullWidth onClick={() => setModalOpen(false)} disabled={cancelando}>
                    Manter assinatura
                  </Button>
                  <button
                    onClick={confirmarCancelamento}
                    disabled={cancelando || simulando || !simulacao}
                    style={{
                      flex: 1,
                      background: '#B91C1C',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '10px 14px',
                      cursor: cancelando ? 'wait' : 'pointer',
                      opacity: cancelando || simulando || !simulacao ? 0.6 : 1,
                    }}
                  >
                    {cancelando ? 'Cancelando…' : 'Confirmar cancelamento'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
