'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { COLORS } from '@/components/landing-v2/shared';
import { createClient } from '@/lib/supabase/client';
import { initialsOf } from '@/lib/mock-cliente';
import CleanPassLogo from '@/components/ui/CleanPassLogo';

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: '/cliente/home',       label: 'Início' },
  { href: '/cliente/relatorios', label: 'Relatórios' },
  { href: '/cliente/historico',  label: 'Histórico' },
  { href: '/cliente/avulsa',     label: 'Solicitar Limpeza' },
  { href: '/cliente/indicacoes', label: 'Indicações' },
  { href: '/cliente/perfil',     label: 'Perfil' },
];

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  created_at: string;
  read_at: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? "agora" : `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

const TYPE_EMOJI: Record<string, string> = {
  service_update: '📅',
  report_ready:   '📊',
  billing:        '💳',
  system:         '🔔',
};

export default function Header({
  userName = 'Cliente',
  plano = 'Padrão',
}: {
  userName?: string;
  plano?: string;
}) {
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifs, setNotifs]         = useState<Notification[]>([]);
  const pathname  = usePathname();
  const router    = useRouter();
  const notifRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const initials  = initialsOf(userName);

  const loadNotifs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, type, created_at, read_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifs(data as Notification[]);
  }, []);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Auto-close drawer when route changes (covers cases where the user
  // navigates via bell/profile dropdowns instead of the drawer links).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  const unreadCount = notifs.filter((n) => !n.read_at).length;

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setNotifs((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const handleOpenNotifs = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`,
        boxShadow: '0 1px 2px rgba(27,58,45,.04)',
      }}
    >
      <div className="pc-mobile-h-pad-tight" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/cliente/home" style={{ textDecoration: 'none' }}>
          <CleanPassLogo variant="light" size={28} showWordmark={true} />
        </Link>

        <nav className="pc-mobile-hidden" style={{ display: 'flex', gap: 2 }}>
          {NAV_ITEMS.map((item) => <NavPill key={item.href} item={item} active={isActive(pathname, item.href)} />)}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
            className="pc-mobile-only"
            style={{
              display: 'none',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: COLORS.dark, padding: 9, borderRadius: 10,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Menu size={22} />
          </button>

          {/* Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={handleOpenNotifs}
              aria-label="Notificações"
              style={{
                position: 'relative', background: notifOpen ? 'white' : 'transparent',
                border: 'none', cursor: 'pointer', color: COLORS.dark,
                padding: 9, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#DC2626', color: 'white', fontSize: 9, fontWeight: 800,
                  minWidth: 16, height: 16, padding: '0 4px', borderRadius: 9999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 0 2px ${COLORS.light}`,
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="pc-notif-dropdown" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340,
                background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12,
                boxShadow: '0 16px 32px rgba(27,58,45,.18)', overflow: 'hidden', zIndex: 60,
              }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.dark }}>
                    Notificações {unreadCount > 0 && <span style={{ color: COLORS.muted, fontWeight: 400 }}>({unreadCount} novas)</span>}
                  </div>
                  {unreadCount > 0 && (
                    <span onClick={handleMarkAllRead} style={{ fontSize: 11, color: COLORS.green, fontWeight: 600, cursor: 'pointer' }}>
                      Marcar todas como lidas
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '24px 18px', textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                      Nenhuma notificação
                    </div>
                  ) : notifs.map((n, i) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 18px',
                        borderBottom: i < notifs.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                        display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12, alignItems: 'flex-start',
                        background: !n.read_at ? 'rgba(61,196,90,.04)' : 'white',
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        {TYPE_EMOJI[n.type] ?? '🔔'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, lineHeight: 1.35 }}>{n.title}</div>
                        {n.body && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>}
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.muted, whiteSpace: 'nowrap', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="pc-profile-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 10, marginLeft: 2, borderLeft: `1px solid ${COLORS.border}` }}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9999, background: COLORS.dark, color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(27,58,45,.15)', fontFamily: "'Montserrat',sans-serif", letterSpacing: '.02em' }}>
                {initials}
              </div>
              <div className="pc-mobile-hidden" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, color: COLORS.dark, fontWeight: 600 }}>{userName}</span>
                <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'Open Sans',sans-serif", marginTop: 2 }}>Plano {plano}</span>
              </div>
            </button>

            {profileOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 200, background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 12px 24px rgba(27,58,45,.15)', padding: 6, zIndex: 60 }}>
                <Link href="/cliente/perfil" onClick={() => setProfileOpen(false)} style={{ ...dropdownItemStyle, color: COLORS.dark }}>
                  Meu perfil
                </Link>
                <div style={{ height: 1, background: COLORS.border, margin: '6px 0' }} />
                <button onClick={handleLogout} style={{ ...dropdownItemStyle, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: '#B91C1C' }}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="pc-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="pc-drawer-panel" role="dialog" aria-label="Menu">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.dark }}>
                Menu
              </span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: COLORS.dark, cursor: 'pointer', padding: 6, borderRadius: 8 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    color: isActive(pathname, item.href) ? COLORS.dark : COLORS.muted,
                    background: isActive(pathname, item.href) ? COLORS.light : 'transparent',
                    fontFamily: "'Open Sans',sans-serif",
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ height: 1, background: COLORS.border, margin: '12px 0' }} />
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: '#B91C1C',
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                Sair
              </button>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/cliente/home') return pathname === '/cliente' || pathname.startsWith('/cliente/home');
  return pathname.startsWith(href);
}

const dropdownItemStyle: React.CSSProperties = {
  display: 'block', padding: '9px 12px', fontSize: 13, fontWeight: 500,
  borderRadius: 8, textDecoration: 'none', fontFamily: "'Open Sans',sans-serif",
};

function NavPill({ item, active }: { item: NavItem; active: boolean }) {
  const [hover, setHover] = useState(false);
  const color = active ? COLORS.dark : hover ? COLORS.dark : COLORS.muted;
  const background = active ? 'white' : hover ? 'rgba(255,255,255,.55)' : 'transparent';
  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600, background, color, fontFamily: "'Open Sans',sans-serif", transition: 'background .15s, color .15s', boxShadow: active ? '0 1px 3px rgba(27,58,45,.08)' : 'none' }}
    >
      {item.label}
    </Link>
  );
}
