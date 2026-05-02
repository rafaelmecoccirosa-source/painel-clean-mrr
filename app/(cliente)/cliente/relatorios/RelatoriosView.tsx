'use client';

import { Badge, Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import GeracaoMensalChart from '@/components/cliente/charts/GeracaoMensalChart';
import { createClient } from '@/lib/supabase/client';

export type RelatoriosRow = {
  id: string;
  mes: string;
  kwh: number;
  eficiencia: number;
  status: 'novo' | 'lido';
  pdfUrl: string | null;
};

type Props = {
  rows: RelatoriosRow[];
  eficienciaMedia: string | null;
  totalGerado: number;
};

export default function RelatoriosView({ rows, eficienciaMedia, totalGerado }: Props) {
  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      <div>
        <Eyebrow>Relatórios</Eyebrow>
        <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.dark, margin: '6px 0 0', letterSpacing: '-.025em' }}>
          Desempenho da sua usina
        </h1>
      </div>

      <section className="fade-up fade-up-1 pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <MetricCard
          eyebrow="Eficiência média"
          value={eficienciaMedia ? `${eficienciaMedia}%` : '—'}
          sub="relatórios disponíveis"
        />
        <MetricCard
          eyebrow="Total gerado"
          value={totalGerado > 0 ? `${totalGerado.toLocaleString('pt-BR')} kWh` : '—'}
          sub="soma dos relatórios"
        />
        <MetricCard eyebrow="Ganho pós-limpeza" value="+10,7%" sub="média após cada limpeza" accent />
      </section>

      <section
        className="fade-up fade-up-2"
        style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <Eyebrow>Geração mensal</Eyebrow>
            <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 0', letterSpacing: '-.01em' }}>
              kWh por mês · últimos 12 meses
            </h3>
          </div>
          <Badge tone="greenSoft">Atualizado hoje</Badge>
        </div>
        <GeracaoMensalChart />
      </section>

      <section className="fade-up fade-up-3">
        <Eyebrow>Relatórios disponíveis</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px', letterSpacing: '-.01em' }}>
          Download em PDF
        </h3>
        <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
          {rows.length === 0 ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
              Nenhum relatório disponível ainda.
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={r.id}
                className="pc-mobile-grid-col"
                style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 16, alignItems: 'center', padding: '16px 22px', borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{r.mes}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    {r.kwh.toLocaleString('pt-BR')} kWh gerados · eficiência {r.eficiencia}%
                  </div>
                </div>
                <Badge tone={r.status === 'novo' ? 'blue' : 'greenSoft'}>
                  {r.status === 'novo' ? 'Novo' : 'Lido'}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    if (r.pdfUrl) window.open(r.pdfUrl, '_blank');
                    if (r.status === 'novo') {
                      const supabase = createClient();
                      await supabase
                        .from('monthly_reports')
                        .update({ read_at: new Date().toISOString() })
                        .eq('id', r.id);
                    }
                  }}
                >
                  ⬇ Baixar PDF
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <section
        className="fade-up fade-up-4"
        style={{ background: COLORS.light, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}
      >
        <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.dark }}>
          O que tem no PDF de relatório?
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13, color: COLORS.dark }}>
          {['Fotos antes/depois', 'Geração pré e pós-limpeza', 'Gráfico de evolução', 'Eficiência da usina', 'Assinatura do técnico'].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: COLORS.green, fontWeight: 800 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ eyebrow, value, sub, accent }: { eyebrow: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(27,58,45,.06)' }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 36, color: accent ? COLORS.green : COLORS.dark, marginTop: 8, letterSpacing: '-.025em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{sub}</div>
    </div>
  );
}
