import Link from 'next/link';
import { Badge, Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { ProgressBar } from '@/components/cliente/Donut';
import { MOCK_CLIENTE } from '@/lib/mock-cliente';

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
    features: ['4 limpezas/ano', 'API inversor', 'Relatório premium', 'Checkup semestral', 'Gerente dedicado'],
  },
];

export default function PlanoPage() {
  const c = MOCK_CLIENTE;
  const descontoPct = c.descontoIndicacao;
  const assinaturaFimMeses = 12;
  const mesesUsados = 1;

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      {/* Hero dark — plano ativo */}
      <section
        className="fade-up"
        style={{
          background: `linear-gradient(135deg, ${COLORS.dark} 0%, #0E251C 100%)`,
          color: 'white',
          borderRadius: 24,
          padding: '36px 40px',
          boxShadow: '0 20px 40px rgba(27,58,45,.22)',
        }}
      >
        <Eyebrow color="#6EE7A0">Plano ativo</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>R$</span>
          <span
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: 'white',
              letterSpacing: '-.03em',
              lineHeight: 1,
            }}
          >
            {c.mensalidade}
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>/mês</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: '#6EE7A0', fontWeight: 600 }}>
          R$ {c.mensalidadeOriginal},00 com {descontoPct}% desconto ({c.indicacoesAtivas} indicações ativas)
        </div>

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
            { label: 'Módulos cobertos', v: `${c.modulos} módulos` },
            { label: 'Limpezas incluídas', v: '2 por ano' },
            { label: 'Limpeza extra', v: '40% off avulso' },
            { label: 'Relatórios', v: 'Mensais por email' },
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
            <Eyebrow>Próxima cobrança</Eyebrow>
            <Badge tone="greenSoft">Em dia</Badge>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              marginTop: 12,
            }}
          >
            <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>R$</span>
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
              {c.mensalidade}
            </span>
            <span style={{ fontSize: 14, color: COLORS.muted }}>em 20 mai 2026</span>
          </div>
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
                background: `linear-gradient(135deg, #EB001B, #F79E1B)`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>Mastercard •••• 4782</div>
            <Button variant="ghost" size="sm">
              Trocar
            </Button>
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
            <Badge tone="blue">Carência</Badge>
          </div>
          <div
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: COLORS.dark,
              marginTop: 12,
            }}
          >
            Abril 2026 → Abril 2027
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
            <span>Ciclo de 12 meses</span>
            <b style={{ color: COLORS.dark }}>
              {mesesUsados} de {assinaturaFimMeses}
            </b>
          </div>
          <ProgressBar value={(mesesUsados / assinaturaFimMeses) * 100} style={{ marginTop: 8 }} />
          <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 14, lineHeight: 1.5 }}>
            Contrato mínimo de 12 meses. Cancelamento antes da carência paga saldo devedor do período restante.
          </p>
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
          {PLANS.map((p) => {
            const isAtual = p.id === 'standard';
            return (
              <div
                key={p.id}
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
                  {p.nome}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{p.range}</div>
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
                    {p.preco}
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.muted }}>/mês</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'grid', gap: 8 }}>
                  {p.features.map((f) => (
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
            Como assinante Padrão, sua limpeza extra custa R$ 108,00
          </div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
            Preço avulso seria R$ 180,00 · você economiza 40%
          </div>
        </div>
        <Link href="/cliente/avulsa" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="lg">
            Solicitar limpeza extra →
          </Button>
        </Link>
      </section>

      {/* Cancelamento */}
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
          Seu contrato tem carência de 12 meses. Ao cancelar antes da carência você paga o saldo devedor do período
          restante. Após 12 meses você pode cancelar a qualquer momento sem multa.
        </p>
        <button
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
    </main>
  );
}
