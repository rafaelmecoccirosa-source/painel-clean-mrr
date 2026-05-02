'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { createClient } from '@/lib/supabase/client';
import { calcularLimpezaExtra, calcularPrecoAvulso } from '@/lib/pricing';

type Step = 'detalhes' | 'resumo' | 'confirmacao';
type Turno = 'manha' | 'tarde';

const STEPS: { k: Step; label: string }[] = [
  { k: 'detalhes', label: 'Detalhes' },
  { k: 'resumo', label: 'Resumo' },
  { k: 'confirmacao', label: 'Confirmação' },
];

const DEFAULT_CITY = 'Jaraguá do Sul';

export default function AvulsaView() {
  const [step, setStep] = useState<Step>('detalhes');
  const [modulos, setModulos] = useState<number>(0);
  const [data, setData] = useState('');
  const [turno, setTurno] = useState<Turno>('manha');
  const [obs, setObs] = useState('');
  const [cidade, setCidade] = useState(DEFAULT_CITY);
  const [email, setEmail] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Pre-fill from profile and subscription
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfileLoaded(true); return; }
      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('city')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile?.city && profile.city.trim() !== '') {
        setCidade(profile.city);
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, modules_count')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (sub) {
        setHasSubscription(true);
        if (sub.modules_count) setModulos(sub.modules_count);
      }
      setProfileLoaded(true);
    })();
  }, []);

  const currentIdx = STEPS.findIndex((s) => s.k === step);

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 28 }}>
      <div>
        <Eyebrow>Solicitar serviço avulso</Eyebrow>
        <h1
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.dark,
            margin: '6px 0 0',
            letterSpacing: '-.025em',
          }}
        >
          Limpeza fora do agendamento
        </h1>
      </div>

      {/* Steps bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {STEPS.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.k} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 9999,
                  background: done ? COLORS.green : active ? COLORS.dark : 'transparent',
                  color: done || active ? 'white' : COLORS.muted,
                  border: done || active ? 'none' : `1px solid ${COLORS.border}`,
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    background: done ? 'rgba(255,255,255,.2)' : active ? COLORS.green : COLORS.border,
                    color: done || active ? 'white' : COLORS.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                  }}
                >
                  {done ? '✓' : i + 1}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: done ? COLORS.green : COLORS.border,
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 'detalhes' && (
        <StepDetalhes
          modulos={modulos}
          data={data}
          setData={setData}
          turno={turno}
          setTurno={setTurno}
          obs={obs}
          setObs={setObs}
          cidade={cidade}
          hasSubscription={hasSubscription}
          profileLoaded={profileLoaded}
          onNext={() => setStep('resumo')}
        />
      )}

      {step === 'resumo' && (
        <StepResumo
          modulos={modulos}
          data={data}
          turno={turno}
          cidade={cidade}
          obs={obs}
          hasSubscription={hasSubscription}
          onBack={() => setStep('detalhes')}
          onConfirmed={() => setStep('confirmacao')}
        />
      )}

      {step === 'confirmacao' && (
        <StepConfirmacao
          email={email}
          data={data}
          modulos={modulos}
          hasSubscription={hasSubscription}
        />
      )}
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 2px 12px rgba(27,58,45,.08)',
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'placeholder'>) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: `1.5px solid ${COLORS.border}`,
        fontSize: 14,
        color: COLORS.dark,
        fontFamily: "'Open Sans',sans-serif",
        outline: 'none',
      }}
    />
  );
}

function priceFor(modules: number, hasSubscription: boolean): number {
  if (modules <= 0) return 0;
  try {
    return hasSubscription ? calcularLimpezaExtra(modules) : calcularPrecoAvulso(modules);
  } catch {
    return 0; // sob_consulta
  }
}

function StepDetalhes({
  modulos,
  data,
  setData,
  turno,
  setTurno,
  obs,
  setObs,
  cidade,
  hasSubscription,
  profileLoaded,
  onNext,
}: {
  modulos: number;
  data: string;
  setData: (v: string) => void;
  turno: Turno;
  setTurno: (t: Turno) => void;
  obs: string;
  setObs: (v: string) => void;
  cidade: string;
  hasSubscription: boolean;
  profileLoaded: boolean;
  onNext: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const precoAvulso = priceFor(modulos, false);
  const precoFinal = priceFor(modulos, hasSubscription);
  const sobConsulta = modulos > 100;
  const valid =
    profileLoaded &&
    modulos > 0 &&
    data !== '' &&
    cidade.trim() !== '' &&
    !sobConsulta;

  return (
    <Card>
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <FieldLabel>Endereço de serviço</FieldLabel>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 14, color: COLORS.dark, fontWeight: 600 }}>
              {cidade}, SC
            </div>
            <Link
              href="/cliente/perfil"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.green,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Alterar no perfil →
            </Link>
          </div>
        </div>

        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <FieldLabel>Sua usina</FieldLabel>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.dark }}>
              {modulos > 0 ? `${modulos} módulos` : profileLoaded ? '— sem assinatura ativa' : 'Carregando...'}
            </div>
          </div>
          {hasSubscription && (
            <span
              style={{
                background: COLORS.light,
                color: COLORS.dark,
                fontSize: 11,
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 9999,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
              }}
            >
              Assinante
            </span>
          )}
        </div>

        <div>
          <FieldLabel>Data desejada</FieldLabel>
          <Input type="date" min={today} value={data} onChange={setData} />
        </div>

        <div>
          <FieldLabel>Turno</FieldLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            {([
              { v: 'manha', label: 'Manhã (8h–12h)' },
              { v: 'tarde', label: 'Tarde (13h–17h)' },
            ] as const).map((opt) => {
              const active = turno === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setTurno(opt.v)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${active ? COLORS.green : COLORS.border}`,
                    background: active ? COLORS.light : 'white',
                    color: active ? COLORS.dark : COLORS.muted,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Observações (opcional)</FieldLabel>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={3}
            placeholder="Pontos de atenção, acesso ao telhado..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${COLORS.border}`,
              fontSize: 14,
              color: COLORS.dark,
              fontFamily: "'Open Sans',sans-serif",
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {modulos > 0 && (
          <div
            style={{
              background: COLORS.light,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 18,
            }}
          >
            {sobConsulta ? (
              <div style={{ fontSize: 13, color: COLORS.dark }}>
                Acima de 100 módulos: <b>sob consulta</b>. Entre em contato com o admin.
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: COLORS.muted }}>Preço tabela avulso:</span>
                  <span
                    style={{
                      fontSize: 15,
                      color: COLORS.muted,
                      textDecoration: hasSubscription ? 'line-through' : 'none',
                      fontWeight: 600,
                    }}
                  >
                    R$ {precoAvulso.toFixed(2)}
                  </span>
                </div>
                {hasSubscription && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color: COLORS.dark, fontWeight: 700 }}>
                      Preço assinante (40% off):
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 800,
                        fontSize: 24,
                        color: COLORS.green,
                        letterSpacing: '-.02em',
                      }}
                    >
                      R$ {precoFinal.toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link href="/cliente/home" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              ← Voltar para home
            </Button>
          </Link>
          <Button variant="primary" size="md" disabled={!valid} onClick={onNext}>
            Continuar →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StepResumo({
  modulos,
  data,
  turno,
  cidade,
  obs,
  hasSubscription,
  onBack,
  onConfirmed,
}: {
  modulos: number;
  data: string;
  turno: Turno;
  cidade: string;
  obs: string;
  hasSubscription: boolean;
  onBack: () => void;
  onConfirmed: (protocolo: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataFmt = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const turnoLabel = turno === 'manha' ? 'Manhã (8h–12h)' : 'Tarde (13h–17h)';
  const precoAvulso = priceFor(modulos, false);
  const precoFinal = priceFor(modulos, hasSubscription);
  const desconto = precoAvulso - precoFinal;

  async function handleConfirm() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/cliente/avulsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_date: data,
          preferred_time: turno,
          notes:          obs || null,
          price_estimate: precoFinal,
        }),
      });
      const payload = (await res.json()) as { protocolo?: string; error?: string };
      if (!res.ok || !payload.protocolo) {
        setError(payload.error ?? 'Não foi possível criar a solicitação. Tente novamente.');
        setBusy(false);
        return;
      }
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('avulsa:lastProtocolo', payload.protocolo);
      }
      onConfirmed(payload.protocolo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card>
        <Eyebrow>Detalhes do serviço</Eyebrow>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <Row label="Serviço" value="Limpeza profissional avulsa" />
          <Row label="Endereço" value={`${cidade}, SC`} />
          <Row label="Módulos" value={`${modulos} módulos`} />
          <Row label="Data solicitada" value={dataFmt} />
          <Row label="Turno" value={turnoLabel} />
          {obs && <Row label="Observações" value={obs} />}
          <Row label="Técnico" value={`A confirmar (região: ${cidade})`} />
        </div>
      </Card>

      <Card>
        <Eyebrow>Cobrança</Eyebrow>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <Row label="Preço tabela avulso" value={`R$ ${precoAvulso.toFixed(2)}`} />
          {hasSubscription && (
            <Row
              label="Desconto assinante 40%"
              value={
                <span style={{ color: COLORS.green, fontWeight: 700 }}>
                  − R$ {desconto.toFixed(2)}
                </span>
              }
            />
          )}
          <div style={{ height: 1, background: COLORS.border, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, color: COLORS.dark, fontWeight: 700 }}>Total</span>
            <span
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: COLORS.dark,
                letterSpacing: '-.02em',
              }}
            >
              R$ {precoFinal.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Button variant="secondary" size="md" onClick={onBack} disabled={busy}>
          ← Voltar
        </Button>
        <Button variant="primary" size="md" onClick={handleConfirm} disabled={busy}>
          {busy ? 'Enviando...' : 'Confirmar pedido →'}
        </Button>
      </div>
    </div>
  );
}

function StepConfirmacao({
  email,
  data,
  modulos,
  hasSubscription,
}: {
  email: string;
  data: string;
  modulos: number;
  hasSubscription: boolean;
}) {
  const [protocolo, setProtocolo] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProtocolo(window.sessionStorage.getItem('avulsa:lastProtocolo') ?? '');
    }
  }, []);
  const dataFmt = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const valor = priceFor(modulos, hasSubscription);
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 9999,
            background: COLORS.light,
            color: COLORS.green,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            marginBottom: 18,
          }}
        >
          ✅
        </div>
        <h2
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: COLORS.dark,
            margin: 0,
            letterSpacing: '-.02em',
          }}
        >
          Solicitação recebida
        </h2>
        <p
          style={{
            fontSize: 14,
            color: COLORS.muted,
            marginTop: 10,
            lineHeight: 1.55,
            maxWidth: 520,
            margin: '10px auto 0',
          }}
        >
          Confirmação enviada para <b style={{ color: COLORS.dark }}>{email}</b>. Um técnico da sua região entrará em
          contato em até 24h para confirmar a data.
        </p>
      </div>

      <div
        style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 18,
          margin: '0 0 20px',
          display: 'grid',
          gap: 10,
        }}
      >
        <Row label="Protocolo" value={`#${protocolo || '—'}`} />
        <Row label="Data solicitada" value={dataFmt} />
        <Row
          label="Valor a cobrar"
          value={<span style={{ color: COLORS.green, fontWeight: 700 }}>R$ {valor.toFixed(2)}</span>}
        />
      </div>

      <Link href="/cliente/home" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="lg" fullWidth>
          Voltar ao início →
        </Button>
      </Link>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: COLORS.muted }}>{label}</span>
      <span style={{ color: COLORS.dark, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
