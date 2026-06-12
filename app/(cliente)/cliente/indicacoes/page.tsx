import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import IndicacoesView, { type IndicacoesProps } from './IndicacoesView';
import { formatDateBR } from '@/lib/mock-cliente';

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatExpires(date: Date): string {
  const diff = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (diff <= 0) return 'Expirado';
  if (diff === 1) return 'em 1 dia';
  if (diff < 30) return `em ${diff} dias`;
  const months = Math.round(diff / 30);
  return `em ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export default async function IndicacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [referralsRes, subRes, profileRes] = await Promise.all([
    supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('price_monthly')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const referrals = referralsRes.data ?? [];

  const referredIds = referrals.map(r => r.referred_id).filter(Boolean) as string[];
  const nameMap: Record<string, string> = {};
  if (referredIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', referredIds);
    (profiles ?? []).forEach(p => { nameMap[p.user_id] = p.full_name ?? '—'; });
  }

  const indicacoesAtivas = referrals.filter(r => r.status === 'active').length;
  const descontoIndicacao = indicacoesAtivas * 6;
  const mensalidadeOriginal = subRes.data?.price_monthly ?? 0;
  // Link real e rastreável: /ref/CODIGO grava cookie e vincula no cadastro
  const host = headers().get('host') ?? 'painel-clean-mrr.vercel.app';
  const code = profileRes.data?.referral_code ?? user.id.slice(0, 8).toUpperCase();
  const referralLink = `${host}/ref/${code}`;

  const indicacoes: IndicacoesProps['indicacoes'] = referrals.map(r => {
    const createdAt = new Date(r.created_at);
    const expiresAt = r.expires_at ? new Date(r.expires_at) : addMonths(createdAt, 12);
    const dbStatus = r.status as string;
    const viewStatus: 'ativo' | 'pendente' | 'expired' =
      dbStatus === 'active' ? 'ativo' : dbStatus === 'expired' ? 'expired' : 'pendente';
    return {
      id: r.id,
      nome: nameMap[r.referred_id] ?? '—',
      status: viewStatus,
      dataFormatada: formatDateBR(createdAt.toISOString().split('T')[0]),
      expira: formatExpires(expiresAt),
      desconto: dbStatus === 'active' ? `${Number(r.discount_pct ?? 6).toFixed(0)}%` : '—',
    };
  });

  return (
    <IndicacoesView
      descontoIndicacao={descontoIndicacao}
      indicacoesAtivas={indicacoesAtivas}
      mensalidadeOriginal={mensalidadeOriginal}
      referralLink={referralLink}
      indicacoes={indicacoes}
    />
  );
}
