import type { Metadata } from 'next';
import './landing-v2.css';

export const metadata: Metadata = {
  title: 'CleanPass — Sua usina solar no máximo, o ano inteiro',
  description:
    'Plataforma de assinatura mensal de limpeza e monitoramento de painéis solares em Santa Catarina.',
};

export default function LandingV2Layout({ children }: { children: React.ReactNode }) {
  return <div className="landing-v2-root">{children}</div>;
}
