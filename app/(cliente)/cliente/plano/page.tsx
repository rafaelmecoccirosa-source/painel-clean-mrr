import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MOCK_CLIENTE } from '@/lib/mock-cliente';
import { calcularPrecoAvulso, calcularLimpezaExtra, mensalidadeComDesconto } from '@/lib/pricing';
import PlanoView, { type PlanoProps } from './PlanoView';

const PLAN_NAMES: Record<string, string> = {
  basic: 'Básico', standard: 'Padrão', plus: 'Plus', pro: 'Pro', business: 'Business',
};

export default async function PlanoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Sem assinatura no banco → dados demo com badge (padrão do dashboard)
  if (!sub) {
    const demo: PlanoProps = {
      isDemo: true,
      status: 'active',
      planType: 'standard',
      planName: 'Padrão',
      priceMonthly: MOCK_CLIENTE.mensalidadeOriginal,
      discountPct: MOCK_CLIENTE.descontoIndicacao,
      priceEffective: MOCK_CLIENTE.mensalidade,
      modulesCount: MOCK_CLIENTE.modulos,
      startedAt: new Date(Date.now() - 32 * 86_400_000).toISOString(),
      contractMonths: 12,
      cancelledAt: null,
      cancellationFee: null,
      nextInvoice: null,
      nextBillingAt: new Date(Date.now() + 12 * 86_400_000).toISOString(),
      extraPrice: calcularLimpezaExtra(MOCK_CLIENTE.modulos),
      avulsoPrice: calcularPrecoAvulso(MOCK_CLIENTE.modulos),
    };
    return <PlanoView {...demo} />;
  }

  const { data: nextInvoice } = await supabase
    .from('invoices')
    .select('amount, due_date, status, type')
    .eq('client_id', user.id)
    .in('status', ['pending', 'awaiting_confirmation'])
    .order('due_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  const discountPct = Number(sub.discount_pct ?? 0);
  const priceMonthly = Number(sub.price_monthly);
  const modules = sub.modules_count ?? 0;

  let extraPrice: number | null = null;
  let avulsoPrice: number | null = null;
  try {
    extraPrice = calcularLimpezaExtra(modules);
    avulsoPrice = calcularPrecoAvulso(modules);
  } catch {
    /* 100+ módulos: sob consulta */
  }

  const props: PlanoProps = {
    isDemo: false,
    status: sub.status,
    planType: sub.plan_type,
    planName: PLAN_NAMES[sub.plan_type] ?? sub.plan_type,
    priceMonthly,
    discountPct,
    priceEffective: mensalidadeComDesconto(priceMonthly, discountPct),
    modulesCount: modules,
    startedAt: sub.started_at,
    contractMonths: sub.contract_months ?? 12,
    cancelledAt: sub.cancelled_at ?? null,
    cancellationFee: sub.cancellation_fee !== null && sub.cancellation_fee !== undefined
      ? Number(sub.cancellation_fee) : null,
    nextInvoice: nextInvoice
      ? { amount: Number(nextInvoice.amount), dueDate: nextInvoice.due_date, status: nextInvoice.status, type: nextInvoice.type }
      : null,
    nextBillingAt: sub.next_billing_at ?? null,
    extraPrice,
    avulsoPrice,
  };

  return <PlanoView {...props} />;
}
