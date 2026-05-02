import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PerfilView, { type PerfilProps } from './PerfilView';
import { MOCK_CLIENTE } from '@/lib/mock-cliente';

const PLAN_LABEL: Record<string, string> = {
  basic: 'Básico', standard: 'Padrão', plus: 'Plus',
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, subRes, referralsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, city, phone')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', user.id)
      .eq('status', 'active'),
  ]);

  const profile = profileRes.data;
  const sub = subRes.data;

  if (!sub) {
    const c = MOCK_CLIENTE;
    const mockProps: PerfilProps = {
      nome: c.nome,
      email: c.email,
      cidade: c.cidade,
      phone: '(47) 99999-0000',
      plano: c.plano,
      mensalidade: c.mensalidade,
      modulosCount: c.modulos,
      potenciaKWp: Math.round((c.modulos * 550) / 1000 * 10) / 10,
      inversor: c.inversor,
      clienteDesde: 'Abril 2026',
      tecnico: c.tecnico,
      descontoIndicacao: c.descontoIndicacao,
      indicacoesAtivas: c.indicacoesAtivas,
      isDemo: true,
    };
    return <PerfilView {...mockProps} />;
  }

  const indicacoesAtivas = (referralsRes.data ?? []).length;
  const descontoIndicacao = indicacoesAtivas * 6;

  const nome = profile?.full_name ?? user.email?.split('@')[0] ?? '—';
  const planLabel = PLAN_LABEL[sub.plan_type] ?? sub.plan_type;
  const potenciaKWp = Math.round((sub.modules_count * 550) / 1000 * 10) / 10;

  let clienteDesde = '—';
  if (sub.started_at) {
    const d = new Date(sub.started_at as string);
    clienteDesde = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  const props: PerfilProps = {
    nome,
    email: user.email ?? '—',
    cidade: profile?.city?.trim() ? profile.city : 'Jaraguá do Sul',
    phone: profile?.phone ?? '',
    plano: planLabel,
    mensalidade: sub.price_monthly,
    modulosCount: sub.modules_count,
    potenciaKWp,
    inversor: sub.inverter_brand ?? '—',
    clienteDesde,
    tecnico: '—',
    descontoIndicacao,
    indicacoesAtivas,
    isDemo: false,
  };

  return <PerfilView {...props} />;
}
