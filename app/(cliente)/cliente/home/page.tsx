import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClienteHomeView, { type ClienteHomeProps } from './ClienteHomeView';
import { MOCK_CLIENTE, MOCK_HISTORICO, daysUntil, formatDateBR } from '@/lib/mock-cliente';
import type { HeroState, HistoricoRow } from '@/lib/mock-cliente';

const PLAN_LABEL: Record<string, string> = {
  basic: 'Básico',
  standard: 'Padrão',
  plus: 'Plus',
};

const PLAN_LIMPEZAS: Record<string, number> = {
  basic:    2,
  standard: 2,
  plus:     4,
};

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function resolveHeroState(
  lastCompleted: { preferred_date: string | null } | null,
  nextDate: string | null,
  lastReport: {
    efficiency_pct: number | null;
    alert_message: string | null;
    period_month: number;
    period_year: number;
    read_at: string | null;
  } | null,
): HeroState {
  const today = new Date();
  const nowMs = today.getTime();

  // 1. post_cleaning: último serviço completed há menos de 7 dias
  if (lastCompleted?.preferred_date) {
    const ms = new Date(lastCompleted.preferred_date + 'T00:00:00').getTime();
    if (ms <= nowMs && nowMs - ms < 7 * 86_400_000) return 'post_cleaning';
  }

  // 2. soon: próximo serviço em <= 3 dias
  if (nextDate) {
    const ms = new Date(nextDate + 'T00:00:00').getTime();
    const days = Math.ceil((ms - nowMs) / 86_400_000);
    if (days >= 0 && days <= 3) return 'soon';
  }

  if (lastReport) {
    const isCurrentMonth =
      lastReport.period_month === today.getMonth() + 1 &&
      lastReport.period_year === today.getFullYear();

    // 3. drop: só dispara para o relatório do MÊS ATUAL.
    //    Relatórios antigos com alert_message ou efficiency baixa não devem
    //    sobrescrever o estado "saudável" depois que o mês passa.
    if (isCurrentMonth) {
      if (
        (lastReport.efficiency_pct !== null && lastReport.efficiency_pct > 0 && lastReport.efficiency_pct < 85) ||
        lastReport.alert_message !== null
      ) return 'drop';

      // 4. report: relatório do mês atual ainda não lido
      if (lastReport.read_at === null) return 'report';
    }
  }

  return 'healthy';
}

export default async function ClienteHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const uid = user.id;

  const todayIso = new Date().toISOString().split('T')[0];

  // 4 queries em paralelo
  const [subRes, nextSvcRes, reportsRes, completedRes] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', uid)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
    // Próxima limpeza: APENAS serviços de assinatura, em aberto e a partir de hoje.
    // Avulsos nunca devem aparecer no card "Próxima limpeza".
    supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', uid)
      .eq('origin', 'subscription')
      .in('status', ['pending', 'accepted', 'confirmed'])
      .gte('preferred_date', todayIso)
      .order('preferred_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('monthly_reports')
      .select('*')
      .eq('client_id', uid)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false }),
    supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', uid)
      .eq('status', 'completed')
      .order('preferred_date', { ascending: false })
      .limit(10),
  ]);

  const sub = subRes.data;
  const nextSvc = nextSvcRes.data;
  const reports = reportsRes.data ?? [];
  const completed = completedRes.data ?? [];

  // Sem assinatura ativa → mock com badge demo
  if (!sub) {
    const c = MOCK_CLIENTE;
    const mockProps: ClienteHomeProps = {
      userFirst: c.nome.split(' ')[0],
      cidade: c.cidade,
      plano: c.plano,
      mensalidade: c.mensalidade,
      mensalidadeOriginal: c.mensalidadeOriginal,
      modulosCount: c.modulos,
      limpezasUsadas: c.limpezasUsadas,
      limpezasTotal: c.limpezasTotal,
      descontoPct: c.descontoIndicacao,
      indicacoesAtivas: c.indicacoesAtivas,
      economiaAcumulada: c.economiaAcumulada,
      economiaLastMonth: 95,
      heroState: c.heroState,
      proximaLimpezaDias: daysUntil(c.proximaLimpeza),
      proximaLimpezaData: formatDateBR(c.proximaLimpeza),
      proximaLimpezaTurno: c.proximaLimpezaTurno,
      tecnico: c.tecnico,
      eficiencia: c.eficienciaAtual,
      geracao: c.geracao,
      geracaoMeta: c.geracaoMeta,
      mesRelatorio: 'março',
      quedaPct: undefined,
      historico: MOCK_HISTORICO,
      isDemo: true,
    };
    return <ClienteHomeView {...mockProps} />;
  }

  // Buscar nomes dos técnicos em batch
  const techIds = Array.from(
    new Set([nextSvc?.technician_id, ...completed.map(s => s.technician_id)].filter(Boolean)),
  ) as string[];

  const techMap: Record<string, string> = {};
  if (techIds.length > 0) {
    const { data: techProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', techIds);
    (techProfiles ?? []).forEach(p => { techMap[p.user_id] = p.full_name ?? ''; });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, city')
    .eq('user_id', uid)
    .maybeSingle();

  const lastReport = reports[0] ?? null;
  const lastCompleted = completed[0] ?? null;

  // Data da próxima limpeza: service_request pendente ou next_service_at da assinatura
  const nextDate =
    nextSvc?.preferred_date ??
    (sub.next_service_at ? (sub.next_service_at as string).split('T')[0] : null);

  const heroState = resolveHeroState(lastCompleted, nextDate, lastReport);

  const proximaLimpezaDias = nextDate ? daysUntil(nextDate) : 0;
  const proximaLimpezaData = nextDate ? formatDateBR(nextDate) : '—';

  const turnoLabel: Record<string, string> = {
    manha: 'Turno da manhã',
    tarde: 'Turno da tarde',
  };
  const proximaLimpezaTurno = nextSvc?.preferred_time
    ? (turnoLabel[nextSvc.preferred_time] ?? nextSvc.preferred_time)
    : '—';

  const tecnico = nextSvc?.technician_id ? (techMap[nextSvc.technician_id] ?? '—') : '—';

  const planLabel = PLAN_LABEL[sub.plan_type] ?? sub.plan_type;
  const limpezasTotal = PLAN_LIMPEZAS[sub.plan_type] ?? 2;

  // Início do ciclo anual atual: aniversário do started_at no ano corrente.
  // Se a próxima data ainda não chegou neste ano, o ciclo começou no ano
  // passado.
  const subStart = sub.started_at ? new Date(sub.started_at as string) : new Date(0);
  const cycleStart = new Date(subStart);
  const today = new Date();
  cycleStart.setFullYear(today.getFullYear());
  if (cycleStart.getTime() > today.getTime()) {
    cycleStart.setFullYear(today.getFullYear() - 1);
  }

  const limpezasUsadas = completed.filter(s =>
    s.origin === 'subscription' &&
    s.status === 'completed' &&
    s.preferred_date &&
    new Date(s.preferred_date + 'T00:00:00') >= cycleStart,
  ).length;

  const geracaoMeta = lastReport?.kwh_expected
    ?? Math.round((sub.modules_count * 550) / 1000 * 130);
  const geracao = Math.round(lastReport?.kwh_generated ?? 0);
  const effPct = lastReport?.efficiency_pct;
  const computedEff = geracaoMeta > 0 ? Math.round((geracao / geracaoMeta) * 100) : 94;
  const eficiencia = effPct != null && effPct > 0 ? Math.round(effPct) : computedEff;
  const quedaPct = effPct != null && effPct > 0
    ? Math.max(0, 100 - Math.round(effPct))
    : undefined;

  const economiaAcumulada = Math.round(
    reports.reduce((sum, r) => sum + (r.savings_estimated ?? 0), 0),
  );
  const economiaLastMonth = Math.round(lastReport?.savings_estimated ?? 0);
  const mesRelatorio = lastReport ? MONTH_NAMES[lastReport.period_month - 1] : '';

  const historico: HistoricoRow[] = completed.map(s => ({
    id: s.id,
    tipo: (s.origin === 'avulso' ? 'avulso' : 'assinatura') as 'assinatura' | 'avulso',
    titulo: s.origin === 'avulso'
      ? 'Limpeza avulsa'
      : `Limpeza profissional · Assinatura ${planLabel}`,
    data: s.preferred_date ?? '',
    tecnico: s.technician_id ? (techMap[s.technician_id] ?? '—') : '—',
    ganho: '—',
    status: 'concluido' as const,
  }));

  const userFirst = (profile?.full_name ?? user.email ?? '').split(' ')[0];

  const props: ClienteHomeProps = {
    userFirst,
    cidade: profile?.city ?? '—',
    plano: planLabel,
    mensalidade: sub.price_monthly,
    mensalidadeOriginal: sub.price_monthly,
    modulosCount: sub.modules_count,
    limpezasUsadas,
    limpezasTotal,
    descontoPct: 0,
    indicacoesAtivas: 0,
    economiaAcumulada,
    economiaLastMonth,
    heroState,
    proximaLimpezaDias,
    proximaLimpezaData,
    proximaLimpezaTurno,
    tecnico,
    eficiencia,
    geracao,
    geracaoMeta,
    mesRelatorio,
    quedaPct,
    historico,
    isDemo: false,
    proximoServiceRequestId: nextSvc?.id ?? null,
  };

  return <ClienteHomeView {...props} />;
}
