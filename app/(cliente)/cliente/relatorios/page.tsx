import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RelatoriosView, { type RelatoriosRow } from './RelatoriosView';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function safeEff(pct: number | null, kwh: number | null, expected: number | null): number {
  if (pct !== null && pct > 0) return Math.round(pct);
  if (kwh !== null && expected !== null && expected > 0) return Math.round((kwh / expected) * 100);
  return 0;
}

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rawReports } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('client_id', user.id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false });

  const reports = rawReports ?? [];

  const rows: RelatoriosRow[] = reports.map(r => ({
    id: r.id,
    mes: `${MONTHS[r.period_month - 1]} ${r.period_year}`,
    kwh: Math.round(r.kwh_generated ?? 0),
    kwhEsperado: r.kwh_expected !== null ? Math.round(r.kwh_expected) : null,
    economia: r.savings_estimated !== null ? Number(r.savings_estimated) : null,
    alerta: r.alert_message ?? null,
    eficiencia: safeEff(r.efficiency_pct, r.kwh_generated, r.kwh_expected),
    status: r.read_at === null ? 'novo' : 'lido',
    pdfUrl: r.report_pdf_url ?? null,
  }));

  const eficienciaMedia = rows.length > 0
    ? (rows.reduce((s, r) => s + r.eficiencia, 0) / rows.length).toFixed(1)
    : null;
  const totalGerado = rows.reduce((s, r) => s + r.kwh, 0);

  return <RelatoriosView rows={rows} eficienciaMedia={eficienciaMedia} totalGerado={totalGerado} />;
}
