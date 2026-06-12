'use client';

import { Badge, Button, Eyebrow, Particles } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import GeracaoMensalChart from '@/components/cliente/charts/GeracaoMensalChart';
import { createClient } from '@/lib/supabase/client';

export type RelatoriosRow = {
  id: string;
  mes: string;
  kwh: number;
  kwhEsperado: number | null;
  economia: number | null;
  alerta: string | null;
  eficiencia: number;
  status: 'novo' | 'lido';
  pdfUrl: string | null;
};

type Props = {
  rows: RelatoriosRow[];
  eficienciaMedia: string | null;
  totalGerado: number;
};

const pt = (n: number) => n.toLocaleString('pt-BR');

async function abrirPdf(row: RelatoriosRow) {
  if (row.pdfUrl) {
    window.open(row.pdfUrl, '_blank');
  } else {
    // Sem PDF pré-gerado: gera na hora no navegador (jsPDF)
    const { gerarRelatorioMensalPdf } = await import('@/lib/report-pdf');
    await gerarRelatorioMensalPdf({
      mes: row.mes,
      kwh: row.kwh,
      kwhEsperado: row.kwhEsperado,
      eficiencia: row.eficiencia,
      economia: row.economia,
      alerta: row.alerta,
    });
  }
  if (row.status === 'novo') {
    const supabase = createClient();
    await supabase
      .from('monthly_reports')
      .update({ read_at: new Date().toISOString() })
      .eq('id', row.id);
  }
}

export default function RelatoriosView({ rows, eficienciaMedia, totalGerado }: Props) {
  const atual = rows[0] ?? null;
  const anterior = rows[1] ?? null;
  const delta = atual && anterior ? atual.eficiencia - anterior.eficiencia : null;
  // últimos 6 meses, do mais antigo ao mais novo, para as mini-barras
  const bars = rows.slice(0, 6).reverse();

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      <div>
        <Eyebrow>Relatórios mensais</Eyebrow>
        <h1 className="pc-mobile-page-title" style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.dark, margin: '6px 0 0', letterSpacing: '-.025em' }}>
          Desempenho da sua usina
        </h1>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '8px 0 0', maxWidth: 620, lineHeight: 1.55 }}>
          Todo mês você recebe um relatório da geração da sua usina — mesmo sem visita. Acompanhe a eficiência ao longo do tempo.
        </p>
      </div>

      {/* Card destaque — mês atual */}
      {atual && (
        <section className="fade-up" style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
          <div className="pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}>
            {/* painel escuro com donut */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.dark}, #2A5C44)`, padding: 28, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
              <Particles count={8} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <Eyebrow color="rgba(255,255,255,.7)">{atual.mes}</Eyebrow>
                <Donut value={atual.eficiencia} size={140} stroke={12} />
                <Badge tone={atual.eficiencia >= 90 ? 'green' : 'amber'}>
                  {atual.eficiencia >= 90 ? '● Saudável' : '● Atenção'}
                </Badge>
              </div>
            </div>

            {/* dados do mês */}
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>Relatório de {atual.mes.toLowerCase()}</div>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.dark, letterSpacing: '-.02em', marginTop: 4 }}>
                    {pt(atual.kwh)} kWh gerados
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
                    Eficiência {atual.eficiencia}%
                    {delta !== null && (
                      <>
                        {' · '}
                        <b style={{ color: delta >= 0 ? COLORS.green : COLORS.amberText }}>
                          {delta >= 0 ? '+' : ''}{delta}%
                        </b>{' '}vs. mês anterior
                      </>
                    )}
                  </div>
                </div>
                <Badge tone={atual.status === 'novo' ? 'blue' : 'greenSoft'}>
                  {atual.status === 'novo' ? 'Novo' : 'Lido'}
                </Badge>
              </div>

              {/* mini-barras de eficiência */}
              {bars.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 96, marginTop: 24 }}>
                  {bars.map((b, i) => (
                    <div key={b.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: '100%', height: `${Math.max(8, b.eficiencia)}%`, background: i === bars.length - 1 ? COLORS.green : COLORS.border, borderRadius: 5, transition: 'height 1s cubic-bezier(.16,1,.3,1)' }} />
                      <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600 }}>{b.mes.slice(0, 3)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <Button variant="primary" size="md" onClick={() => abrirPdf(atual)}>
                  ⬇ Baixar PDF do relatório
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Métricas */}
      <section className="fade-up fade-up-1 pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <MetricCard eyebrow="Eficiência média" value={eficienciaMedia ? `${eficienciaMedia}%` : '—'} sub="relatórios disponíveis" />
        <MetricCard eyebrow="Total gerado" value={totalGerado > 0 ? `${pt(totalGerado)} kWh` : '—'} sub="soma dos relatórios" />
        <MetricCard eyebrow="Ganho pós-limpeza" value="+10,7%" sub="média após cada limpeza" accent />
      </section>

      {/* Gráfico Chart.js real */}
      <section className="fade-up fade-up-2" style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
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

      {/* Lista de relatórios */}
      <section className="fade-up fade-up-3">
        <Eyebrow>Relatórios anteriores</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px', letterSpacing: '-.01em' }}>
          Download em PDF
        </h3>
        <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
          {rows.length === 0 ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
              Nenhum relatório disponível ainda.
            </div>
          ) : (
            rows.map((r, i) => {
              const d = i < rows.length - 1 ? r.eficiencia - rows[i + 1].eficiencia : null;
              return (
                <div
                  key={r.id}
                  className="pc-mobile-grid-col"
                  style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto auto auto', gap: 16, alignItems: 'center', padding: '16px 22px', borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    📄
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{r.mes}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                      {pt(r.kwh)} kWh · eficiência {r.eficiencia}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 44 }}>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 17, color: r.eficiencia >= 90 ? COLORS.green : COLORS.dark, lineHeight: 1 }}>
                      {r.eficiencia}%
                    </div>
                    {d !== null && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: d >= 0 ? COLORS.green : COLORS.amberText, marginTop: 2 }}>
                        {d >= 0 ? '+' : ''}{d}%
                      </div>
                    )}
                  </div>
                  <Badge tone={r.status === 'novo' ? 'blue' : 'greenSoft'}>
                    {r.status === 'novo' ? 'Novo' : 'Lido'}
                  </Badge>
                  <Button variant="secondary" size="sm" onClick={() => abrirPdf(r)}>
                    ⬇ PDF
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* O que tem no PDF */}
      <section className="fade-up fade-up-4" style={{ background: COLORS.light, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
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

function Donut({ value, size = 140, stroke = 12 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.green}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: size * 0.26, color: 'white', lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2 }}>eficiência</span>
      </div>
    </div>
  );
}
