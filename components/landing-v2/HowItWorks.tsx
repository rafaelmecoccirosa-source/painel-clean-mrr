'use client';

import type { ReactNode } from 'react';
import { COLORS, HERO_PHOTO, SectionHeadline, useIsMobile } from './shared';

type Step = { n: string; title: string; body: string; icon: ReactNode };

export default function HowItWorks() {
  const isMobile = useIsMobile(900);

  const steps: Step[] = [
    {
      n: '01',
      title: 'Assine em 2 minutos',
      body: 'Escolha o plano pelo número de módulos da sua usina. Cadastro pelo celular, PIX na hora.',
      icon: (
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="6" width="28" height="36" rx="4" />
          <line x1="16" y1="14" x2="32" y2="14" />
          <line x1="16" y1="22" x2="32" y2="22" />
          <line x1="16" y1="30" x2="24" y2="30" />
          <circle cx="24" cy="37" r="1.5" fill={COLORS.green} stroke="none" />
        </svg>
      ),
    },
    {
      n: '02',
      title: 'Conectamos ao seu inversor',
      body: 'Integração direta com a API do inversor (Growatt, Fronius, Deye e outros). Passamos a ver sua geração em tempo real.',
      icon: (
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="12" width="14" height="24" rx="2" />
          <rect x="26" y="12" width="14" height="24" rx="2" />
          <path d="M 22 24 L 26 24" />
          <circle cx="15" cy="20" r="1.5" fill={COLORS.green} stroke="none" />
          <path d="M 12 28 L 18 28 M 12 32 L 16 32" />
          <path d="M 30 20 L 36 20 M 30 24 L 36 24 M 30 28 L 36 28" />
        </svg>
      ),
    },
    {
      n: '03',
      title: 'Limpeza + checkup técnico',
      body: 'Técnico certificado agenda em até 48h. Você paga metade da 1ª limpeza ao entrar no plano.',
      icon: (
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 36 L 40 36 L 36 16 L 12 16 Z" />
          <line x1="14" y1="22" x2="34" y2="22" />
          <line x1="15" y1="28" x2="33" y2="28" />
          <circle cx="24" cy="10" r="3" fill={COLORS.green} stroke="none" />
          <path d="M 22 13 L 22 16 M 26 13 L 26 16" />
        </svg>
      ),
    },
    {
      n: '04',
      title: 'Relatório todo mês',
      body: 'Dashboard com geração, comparativo mês a mês e alerta proativo se algo cair — antes de você sentir na conta.',
      icon: (
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="10" width="36" height="28" rx="3" />
          <polyline points="12,30 18,24 24,27 30,18 36,22" stroke={COLORS.green} strokeWidth="2.5" />
          <circle cx="36" cy="22" r="2" fill={COLORS.green} stroke="none" />
          <line x1="12" y1="34" x2="36" y2="34" opacity="0.3" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="como-funciona"
      style={{
        position: 'relative',
        backgroundImage: `url('${HERO_PHOTO}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      {/* dark overlay so text and cards remain readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,56,43,0.70)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeadline
          eyebrow="✨ PROCESSO SIMPLES"
          title="Do cadastro ao relatório, em 4 passos"
          subtitle="Você não precisa entender de painel solar. A gente entende — e mantém tudo funcionando como o primeiro dia."
          dark
        />

        <div
          style={{
            marginTop: isMobile ? 36 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 14 : 20,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{
                position: 'relative',
                background: 'white',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: isMobile ? 18 : 24,
                transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease',
                animation: `pc-slideup .6s ${i * 0.08}s ease both`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -14,
                  left: 20,
                  background: COLORS.dark,
                  color: 'white',
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '.08em',
                  padding: '6px 12px',
                  borderRadius: 9999,
                }}
              >
                {s.n}
              </div>

              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: COLORS.light,
                  display: 'grid',
                  placeItems: 'center',
                  marginTop: 8,
                  marginBottom: 16,
                }}
              >
                {s.icon}
              </div>

              <h3
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 18,
                  color: COLORS.dark,
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {s.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: isMobile ? 13 : 14,
                  color: 'rgba(27,58,45,0.68)',
                  lineHeight: 1.55,
                  margin: '10px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {s.body}
              </p>

              {!isMobile && i < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    right: -14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 28,
                    height: 28,
                    display: 'grid',
                    placeItems: 'center',
                    color: COLORS.muted,
                    zIndex: 2,
                    opacity: 0.5,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M 6 10 L 14 10 M 11 7 L 14 10 L 11 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
