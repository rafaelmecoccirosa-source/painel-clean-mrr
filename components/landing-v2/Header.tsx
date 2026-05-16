'use client';

import { useEffect, useState } from 'react';
import { Button, COLORS, LogoLockup } from './shared';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(100, (y / docH) * 100) : 0);
    };
    const r = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', r);
    update();
    r();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', r);
    };
  }, []);

  const navItems = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Planos', href: '#planos' },
    { label: 'Cobertura', href: '#cobertura' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(244,248,242,0.88)' : COLORS.bg,
        backdropFilter: scrolled ? 'saturate(180%) blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : '1px solid transparent',
        transition: 'background .25s ease, border-color .25s ease, backdrop-filter .25s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
        {/* Barra de progresso de leitura */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORS.green}, #6EE7A0)`,
            borderRadius: '0 2px 2px 0',
            transition: 'width .1s linear',
            opacity: scrolled ? 1 : 0,
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: isMobile ? '14px 20px' : '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <a href="#top" style={{ textDecoration: 'none' }}>
            <LogoLockup showTagline={!isMobile} />
          </a>

          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              {navItems.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  style={{
                    fontFamily: "'Open Sans',sans-serif",
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: COLORS.dark,
                    textDecoration: 'none',
                    padding: '6px 0',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.green)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.dark)}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && (
              <Button variant="ghost" size="md" onClick={() => { window.location.href = '/login'; }}>
                Entrar
              </Button>
            )}
            <Button variant="primary" size={isMobile ? 'sm' : 'md'} onClick={() => { window.location.href = '/login'; }}>
              Assinar →
            </Button>
            {isMobile && (
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Abrir menu"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ width: 18, height: 2, background: COLORS.dark, borderRadius: 2, transition: 'transform .2s', transform: mobileOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
                  <span style={{ width: 18, height: 2, background: COLORS.dark, borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: 'opacity .15s' }} />
                  <span style={{ width: 18, height: 2, background: COLORS.dark, borderRadius: 2, transition: 'transform .2s', transform: mobileOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
                </div>
              </button>
            )}
          </div>
        </div>

        {isMobile && mobileOpen && (
          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
              padding: '12px 20px 20px',
              display: 'grid',
              gap: 4,
              animation: 'pc-fade .18s ease',
            }}
          >
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 8px', fontFamily: "'Open Sans',sans-serif", fontSize: 16, fontWeight: 600, color: COLORS.dark, textDecoration: 'none', borderBottom: `1px solid ${COLORS.border}` }}
              >
                {n.label}
              </a>
            ))}
            <a href="/login" onClick={() => setMobileOpen(false)} style={{ padding: '14px 8px 4px', fontFamily: "'Open Sans',sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.dark, textDecoration: 'none' }}>
              Entrar →
            </a>
          </div>
        )}
    </header>
  );
}

