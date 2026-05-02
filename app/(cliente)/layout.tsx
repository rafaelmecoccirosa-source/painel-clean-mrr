import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Header from '@/components/cliente/Header';
import { COLORS } from '@/lib/brand-tokens';
import { MOCK_CLIENTE } from '@/lib/mock-cliente';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Área do Cliente',
};

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let userName = user.email?.split('@')[0] ?? 'Cliente';
  let userRole: string | null = null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      userRole = profile.role ?? null;
      userName = profile.full_name ?? userName;
    }
  } catch {
    /* ignore — fallback handled below */
  }

  if (!userRole) {
    const metaRole = (user.user_metadata?.role as string | undefined) ?? null;
    userRole = metaRole;
  }

  if (userRole === 'tecnico') redirect('/tecnico');
  if (userRole === 'admin') redirect('/admin');
  if (!userRole) redirect('/completar-cadastro');

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
      <Header userName={userName} plano={MOCK_CLIENTE.plano} />
      {children}
    </div>
  );
}
