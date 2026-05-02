import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import EficienciaChart from '@/components/cliente/charts/EficienciaChart';
import ImpactoChart from '@/components/cliente/charts/ImpactoChart';
import { formatDateBR } from '@/lib/mock-cliente';

const PLAN_LABEL: Record<string, string> = {
  basic: 'Básico', standard: 'Padrão', plus: 'Plus',
};

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [completedRes, subRes] = await Promise.all([
    supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'completed')
      .order('preferred_date', { ascending: false })
      .limit(50),
    supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ]);

  const completed = completedRes.data ?? [];
  const planLabel = subRes.data ? (PLAN_LABEL[subRes.data.plan_type] ?? subRes.data.plan_type) : '';

  const techIds = Array.from(new Set(
    completed.map(s => s.technician_id).filter(Boolean),
  )) as string[];
  const techMap: Record<string, string> = {};
  if (techIds.length > 0) {
    const { data: techProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', techIds);
    (techProfiles ?? []).forEach(p => { techMap[p.user_id] = p.full_name ?? ''; });
  }

  const rows = completed.map(s => ({
    id: s.id,
    tipo: (s.origin === 'avulso' ? 'avulso' : 'assinatura') as 'assinatura' | 'avulso',
    titulo: s.origin === 'avulso' ? 'Limpeza avulsa' : `Limpeza profissional · Assinatura ${planLabel}`,
    data: s.preferred_date ?? '',
    tecnico: s.technician_id ? (techMap[s.technician_id] ?? '—') : '—',
  }));

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      <div>
        <Eyebrow>Histórico completo</Eyebrow>
        <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.dark, margin: '6px 0 0', letterSpacing: '-.025em' }}>
          Todos os serviços da sua usina
        </h1>
      </div>

      <section className="fade-up fade-up-1 pc-mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard eyebrow="Eficiência ao longo do tempo" title="Evolução em 12 meses">
          <EficienciaChart />
        </ChartCard>
        <ChartCard eyebrow="Impacto das limpezas" title="Geração antes e depois">
          <ImpactoChart />
        </ChartCard>
      </section>

      <section className="fade-up fade-up-2">
        <Eyebrow>Tabela completa</Eyebrow>
        <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px', letterSpacing: '-.01em' }}>
          Serviços realizados
        </h3>
        <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
          {rows.length === 0 ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
              Nenhum serviço realizado ainda.
            </div>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.id}
                className="pc-mobile-grid-col"
                style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 18, alignItems: 'center', padding: '16px 22px', borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.light, color: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {row.tipo === 'assinatura' ? '☀️' : '⚡'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{row.titulo}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
                    {row.data ? formatDateBR(row.data) : '—'} · {row.tecnico}
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: '#ECFDF5', color: '#059669', whiteSpace: 'nowrap' }}>
                  Concluído
                </span>
                <Button variant="secondary" size="sm">Ver PDF</Button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function ChartCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(27,58,45,.08)' }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.dark, margin: '4px 0 16px', letterSpacing: '-.01em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
