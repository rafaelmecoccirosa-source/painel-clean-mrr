'use client';

import { useState } from 'react';
import { Badge, Button, Eyebrow, Particles } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { initialsOf } from '@/lib/mock-cliente';

export type IndicacoesProps = {
  descontoIndicacao: number;
  indicacoesAtivas: number;
  mensalidadeOriginal: number;
  referralLink: string;
  indicacoes: Array<{
    id: string;
    nome: string;
    status: 'ativo' | 'pendente' | 'expired';
    dataFormatada: string;
    expira: string;
    desconto: string;
  }>;
};

const NIVEIS = [
  { n: 1, pct: '6%' },
  { n: 2, pct: '12%' },
  { n: 3, pct: '18%' },
  { n: 4, pct: '24%' },
  { n: 5, pct: '30%' },
];

const STEPS = [
  { n: 1, title: 'Compartilhe seu link', body: 'Envie para amigos com painéis solares.' },
  { n: 2, title: 'Amigo assina', body: 'Ele assina qualquer plano usando seu link.' },
  { n: 3, title: 'Desconto ativado', body: 'Você recebe +6% de desconto por 12 meses.' },
  { n: 4, title: 'Acumule até 5', body: 'Com 5 indicações = 30% de desconto todo mês.' },
];

const pt = (n: number) => n.toLocaleString('pt-BR');

export default function IndicacoesView({
  descontoIndicacao,
  indicacoesAtivas,
  mensalidadeOriginal,
  referralLink,
  indicacoes,
}: IndicacoesProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://${referralLink}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progresso = Math.min(100, (indicacoesAtivas / 5) * 100);
  const descontoReal = Math.round((mensalidadeOriginal * descontoIndicacao) / 100);
  const faltam = Math.max(0, 5 - indicacoesAtivas);

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      <div>
        <Eyebrow>Programa de indicações</Eyebrow>
        <h1 className="pc-mobile-page-title" style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.dark, margin: '6px 0 0', letterSpacing: '-.025em' }}>
          Indique e pague menos todo mês
        </h1>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '8px 0 0', maxWidth: 640, lineHeight: 1.55 }}>
          Cada amigo que assinar a Painel Clean te dá +6% de desconto na mensalidade — até 30% com 5 indicações. Os créditos valem por 12 meses.
        </p>
      </div>

      {/* Topo: desconto atual (escuro) + link */}
      <section className="fade-up pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'stretch' }}>
        {/* Hero desconto */}
        <div style={{ position: 'relative', background: `linear-gradient(135deg, ${COLORS.dark} 0%, #0E251C 100%)`, color: 'white', borderRadius: 20, padding: 32, overflow: 'hidden', boxShadow: '0 16px 36px rgba(27,58,45,.2)' }}>
          <Particles count={14} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Eyebrow color="#6EE7A0">Seu desconto atual</Eyebrow>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '10px 0 4px' }}>
              <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 900, fontSize: 72, lineHeight: 1, letterSpacing: '-.04em', color: COLORS.green, textShadow: '0 2px 24px rgba(61,196,90,.4)' }}>
                {descontoIndicacao}%
              </span>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>de desconto</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)' }}>
              {indicacoesAtivas} de 5 indicações ativas
              {descontoReal > 0 && (
                <> · você economiza <b style={{ color: 'white' }}>R$ {pt(descontoReal)}/mês</b></>
              )}
            </div>

            <div style={{ marginTop: 22, marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              <span>Progresso até 30%</span>
              <span>{indicacoesAtivas}/5</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,.14)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ width: `${progresso}%`, height: '100%', background: `linear-gradient(90deg, ${COLORS.green}, #6EE7A0)`, borderRadius: 9999, transition: 'width 1.1s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>
              {faltam === 0 ? 'Desconto máximo atingido! 🎉' : `${faltam} ${faltam === 1 ? 'indicação falta' : 'indicações faltam'} para o máximo`}
            </div>
          </div>
        </div>

        {/* Link */}
        <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(27,58,45,.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Eyebrow>Seu link de indicação</Eyebrow>
          <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px' }}>
            Convide amigos e ganhe até 30%
          </h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <code style={{ flex: 1, fontSize: 13, color: COLORS.dark, fontFamily: 'ui-monospace,monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {referralLink}
            </code>
            <Button variant={copied ? 'primary' : 'secondary'} size="sm" onClick={copy}>
              {copied ? '✓ Copiado' : 'Copiar link'}
            </Button>
          </div>
          <Button variant="primary" size="lg" onClick={copy} fullWidth>
            Compartilhar convite →
          </Button>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: '12px 0 0', lineHeight: 1.55 }}>
            Quando seu amigo assinar usando esse link, você recebe +6% de desconto por 12 meses e ele ganha 50% off na 1ª limpeza.
          </p>
        </div>
      </section>

      {/* Níveis */}
      <section className="fade-up fade-up-1">
        <Eyebrow>Como o desconto cresce</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px' }}>
          5 níveis até 30%
        </h3>
        <div className="pc-mobile-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {NIVEIS.map(n => {
            const ativo = n.n <= indicacoesAtivas;
            return (
              <div key={n.n} style={{ background: ativo ? COLORS.light : 'white', border: `${ativo ? 2 : 1}px solid ${ativo ? COLORS.green : COLORS.border}`, borderRadius: 14, padding: 18, textAlign: 'center', boxShadow: ativo ? '0 4px 14px rgba(61,196,90,.15)' : '0 2px 12px rgba(27,58,45,.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ativo ? COLORS.dark : COLORS.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                  {n.n}ª indicação
                </div>
                <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 28, color: ativo ? COLORS.green : COLORS.muted, letterSpacing: '-.02em', lineHeight: 1 }}>
                  {n.pct}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Badge tone={ativo ? 'green' : 'light'}>{ativo ? '✓ Ativo' : 'Pendente'}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lista de indicações */}
      <section className="fade-up fade-up-2">
        <Eyebrow>Indicações realizadas</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px' }}>
          Status de quem você indicou
        </h3>
        <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
          {indicacoes.length === 0 ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
              Nenhuma indicação ainda. Compartilhe seu link para começar!
            </div>
          ) : (
            indicacoes.map((row, i) => {
              const tone = row.status === 'ativo' ? 'green' : row.status === 'expired' ? 'light' : 'amber';
              const label = row.status === 'ativo' ? 'Ativo' : row.status === 'expired' ? 'Expirado' : 'Pendente';
              return (
                <div
                  key={row.id}
                  className="pc-mobile-grid-col"
                  style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 18, alignItems: 'center', padding: '16px 22px', borderBottom: i < indicacoes.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.dark})`, color: 'white', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '.02em' }}>
                    {initialsOf(row.nome !== '—' ? row.nome : '??')}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{row.nome}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
                      Indicado em {row.dataFormatada} · Expira {row.expira}
                    </div>
                  </div>
                  <Badge tone={tone}>{label}</Badge>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 16, color: row.status === 'ativo' ? COLORS.green : COLORS.muted }}>
                    {row.desconto}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Como funciona */}
      <section className="fade-up fade-up-3" style={{ background: COLORS.light, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28 }}>
        <Eyebrow>Como funciona</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 20px' }}>
          4 passos simples
        </h3>
        <div className="pc-mobile-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {STEPS.map(s => (
            <div key={s.n}>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: COLORS.green, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                {s.n}
              </div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.dark, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
