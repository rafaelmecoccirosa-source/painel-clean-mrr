'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatDay(d: Date) {
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toIsoDate(d: Date) {
  // YYYY-MM-DD em fuso local (não UTC) para casar com preferred_date
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ReagendarModal({
  open,
  onClose,
  atualData,
  atualTurno,
  tecnico,
  serviceRequestId = null,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  atualData: string;
  atualTurno: string;
  tecnico: string;
  serviceRequestId?: string | null;
  onConfirm?: (newDate: Date, shift: 'manha' | 'tarde') => void;
}) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [today]);

  const [step, setStep] = useState<'pick' | 'confirm' | 'done'>('pick');
  const [sel, setSel] = useState<Date>(days[3]);
  const [shift, setShift] = useState<'manha' | 'tarde'>('manha');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('pick');
      setLoading(false);
      setError(null);
      setSel(days[3]);
      setShift('manha');
    }
  }, [open, days]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cliente/reagendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_request_id: serviceRequestId,
          preferred_date:     toIsoDate(sel),
          preferred_time:     shift,
        }),
      });
      const payload = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !payload.success) {
        setError(payload.error ?? 'Não foi possível reagendar. Tente novamente.');
        setLoading(false);
        return;
      }
      setLoading(false);
      setStep('done');
      setTimeout(() => {
        onConfirm?.(sel, shift);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,30,22,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 18,
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {step !== 'done' && (
          <div
            style={{
              padding: '24px 28px',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <Eyebrow>Reagendar limpeza</Eyebrow>
              <h2
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: COLORS.dark,
                  margin: '6px 0 4px',
                  letterSpacing: '-.02em',
                }}
              >
                {step === 'pick' ? 'Escolha um novo dia' : 'Confirme o novo agendamento'}
              </h2>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
                Atual: <b style={{ color: COLORS.dark }}>{atualData}</b> · {atualTurno}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: COLORS.muted,
                fontSize: 18,
                padding: 6,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {step === 'pick' && (
          <div style={{ padding: '22px 28px' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.muted,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                marginBottom: 10,
              }}
            >
              Próximos 14 dias
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
              {days.map((d, i) => {
                const isSel = sel.getTime() === d.getTime();
                const isSunday = d.getDay() === 0;
                return (
                  <button
                    key={i}
                    disabled={isSunday}
                    onClick={() => !isSunday && setSel(d)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSel ? COLORS.green : COLORS.border}`,
                      background: isSel ? COLORS.green : 'white',
                      color: isSel ? 'white' : isSunday ? COLORS.muted : COLORS.dark,
                      cursor: isSunday ? 'not-allowed' : 'pointer',
                      opacity: isSunday ? 0.4 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      fontFamily: "'Open Sans',sans-serif",
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      {DOW[d.getDay()]}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.muted,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                marginBottom: 10,
              }}
            >
              Turno preferido
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              {[
                { k: 'manha' as const, t: '☀️ Manhã', sub: '07h – 12h' },
                { k: 'tarde' as const, t: '🌤 Tarde', sub: '13h – 17h' },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setShift(o.k)}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    border: `1.5px solid ${shift === o.k ? COLORS.green : COLORS.border}`,
                    background: shift === o.k ? 'rgba(61,196,90,.06)' : 'white',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: "'Open Sans',sans-serif",
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{o.t}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{o.sub}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setStep('confirm')}>
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ padding: '22px 28px' }}>
            <div
              style={{
                background: COLORS.light,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: 18,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: COLORS.muted,
                  fontWeight: 700,
                  letterSpacing: '.1em',
                }}
              >
                Novo agendamento
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: COLORS.dark,
                  margin: '6px 0 2px',
                  letterSpacing: '-.02em',
                }}
              >
                {formatDay(sel)}
              </div>
              <div style={{ fontSize: 13, color: COLORS.dark }}>
                {shift === 'manha' ? 'Turno da manhã (07h–12h)' : 'Turno da tarde (13h–17h)'} · Técnico {tecnico}
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
              {[
                'Você receberá confirmação por email em até 24h.',
                'Sem custo adicional — essa limpeza está inclusa no seu plano.',
                'Aviso no WhatsApp no dia anterior ao serviço.',
              ].map((t, i) => (
                <li
                  key={i}
                  style={{ display: 'flex', gap: 10, fontSize: 13, color: COLORS.dark, lineHeight: 1.5 }}
                >
                  <span style={{ color: COLORS.green, marginTop: 1, fontWeight: 800 }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
              <Button variant="secondary" onClick={() => setStep('pick')} disabled={loading}>
                ← Voltar
              </Button>
              <Button variant="primary" disabled={loading} onClick={submit}>
                {loading ? 'Confirmando…' : 'Confirmar reagendamento ✓'}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: '38px 28px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 9999,
                background: 'rgba(61,196,90,.12)',
                color: COLORS.green,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                fontSize: 28,
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: COLORS.dark,
                margin: '0 0 6px',
                letterSpacing: '-.02em',
              }}
            >
              Reagendamento solicitado.
            </h2>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              Sua nova data: <b style={{ color: COLORS.dark }}>{formatDay(sel)}</b>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
