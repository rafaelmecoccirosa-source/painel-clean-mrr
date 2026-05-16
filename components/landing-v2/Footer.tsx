'use client';

import { COLORS, LogoLockup, useIsMobile } from './shared';

type Link = { label: string; href: string };
type Col = { title: string; links: Link[] };

export default function Footer() {
  const isMobile = useIsMobile(768);

  const cols: Col[] = [
    {
      title: 'Produto',
      links: [
        { label: 'Como funciona', href: '#como-funciona' },
        { label: 'Planos', href: '#planos' },
        { label: 'Calculadora', href: '#calculadora' },
        { label: 'Cobertura', href: '#cobertura' },
        { label: 'Depoimentos', href: '#depoimentos' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre a CleanPass', href: '#' },
        { label: 'Para técnicos', href: '#para-tecnicos' },
        { label: 'Parcerias', href: '#' },
        { label: 'Imprensa', href: '#' },
        { label: 'Blog', href: '#' },
      ],
    },
    {
      title: 'Suporte',
      links: [
        { label: 'FAQ', href: '#faq' },
        { label: 'Central de ajuda', href: '#' },
        { label: 'Contato', href: '#contato' },
        { label: 'Política de privacidade (LGPD)', href: '#' },
        { label: 'Termos de uso', href: '#' },
      ],
    },
  ];

  const socials = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/painelclean',
      path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/company/painel-clean',
      path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
      label: 'Facebook',
      href: '#',
      path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
  ];

  return (
    <footer
      style={{
        background: '#081A12',
        color: 'rgba(255,255,255,0.7)',
        padding: isMobile ? '56px 20px 28px' : '80px 32px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr 1fr 1fr',
            gap: isMobile ? 36 : 48,
          }}
        >
          <div>
            <LogoLockup inverted />
            <p
              style={{
                marginTop: 18,
                fontFamily: "'Open Sans',sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.55)',
                maxWidth: 320,
              }}
            >
              Plataforma de limpeza e monitoramento de painéis solares. Sua usina no máximo, o ano inteiro.
            </p>

            <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
              <a
                href="https://wa.me/5547997175878"
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                📱 (47) 99717-5878
              </a>
              <a
                href="mailto:contato@painelclean.com.br"
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                ✉ contato@painelclean.com.br
              </a>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.green;
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = COLORS.green;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h5
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                {col.title}
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={{
                        color: 'rgba(255,255,255,0.65)',
                        textDecoration: 'none',
                        fontFamily: "'Open Sans',sans-serif",
                        fontSize: 14,
                        transition: 'color .15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.green)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
            gap: isMobile ? 16 : 32,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
              Painel Clean Tecnologia Ltda.
            </strong>{' '}
            · CNPJ 32.852.325/0001-99
            <br />
            Rua Cesare Valentini, 265, sala 17 — Novale Ind, Jaraguá do Sul/SC, CEP 89254-193
          </div>
          <div
            style={{
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              textAlign: isMobile ? 'left' : 'right',
            }}
          >
            © 2026 CleanPass · Feito em Santa Catarina 🇧🇷
            <br />
            <span style={{ opacity: 0.8 }}>Em conformidade com a LGPD (Lei nº 13.709/2018)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
