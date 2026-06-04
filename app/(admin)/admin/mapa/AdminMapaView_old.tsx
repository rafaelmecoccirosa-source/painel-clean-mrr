'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

type Tecnico = {
  user_id: string
  full_name: string | null
  city: string | null
  cep: string | null
  lat: number | null
  lng: number | null
  last_seen: string | null
  online: boolean
}

type Servico = {
  id: string
  client_id: string
  client_name: string | null
  client_city: string | null
  city: string | null
  address: string | null
  module_count: number | null
  status: string
  payment_status: string
  preferred_date: string | null
  latitude: number
  longitude: number
}

type ClienteAgrupado = {
  client_id: string
  client_name: string | null
  client_city: string | null
  servicos: Servico[]
  totalPlacas: number
}

// Tab order: Técnicos / Clientes / Serviços / Todos
type Tab = 'tecnicos' | 'clientes' | 'servicos' | 'todos'

const TAB_LABELS: Record<Tab, string> = {
  tecnicos: 'Técnicos',
  clientes: 'Clientes',
  servicos: 'Serviços',
  todos:    'Todos',
}
const TAB_ORDER: Tab[] = ['tecnicos', 'clientes', 'servicos', 'todos']

const CORRIDOR_CENTER = { lat: -27.0, lng: -48.9 }
const CORRIDOR_ZOOM   = 8

const STATUS_LABEL: Record<string, string> = {
  pending:     'Aguardando',
  accepted:    'Aceito',
  in_progress: 'Em andamento',
  completed:   'Concluído',
  cancelled:   'Cancelado',
}

function formatLastSeen(last_seen: string | null): string {
  if (!last_seen) return 'Nunca acessou'
  const diff = Date.now() - new Date(last_seen).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'Agora mesmo'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

// Agrupa serviços por client_id para a tab Clientes
function agruparPorCliente(servicos: Servico[]): ClienteAgrupado[] {
  const map = new Map<string, ClienteAgrupado>()
  servicos.forEach(s => {
    if (!map.has(s.client_id)) {
      map.set(s.client_id, {
        client_id:   s.client_id,
        client_name: s.client_name,
        client_city: s.client_city ?? s.city,
        servicos:    [],
        totalPlacas: 0,
      })
    }
    const entry = map.get(s.client_id)!
    entry.servicos.push(s)
    entry.totalPlacas += s.module_count ?? 0
  })
  return Array.from(map.values()).sort((a, b) =>
    b.servicos.length - a.servicos.length
  )
}

export function AdminMapaView({
  tecnicos,
  servicos,
}: {
  tecnicos: Tecnico[]
  servicos: Servico[]
}) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markersRef     = useRef<unknown>(null)   // Leaflet LayerGroup
  const leafletRef     = useRef<unknown>(null)   // cached L after first import
  const [mapReady, setMapReady] = useState(false)
  const [tab, setTab]           = useState<Tab>('tecnicos')

  // ── Effect 1: inicializar mapa (uma vez) ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView(
        [CORRIDOR_CENTER.lat, CORRIDOR_CENTER.lng],
        CORRIDOR_ZOOM
      )
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const markersLayer = L.layerGroup().addTo(map)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapInstanceRef as any).current = map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(markersRef as any).current     = markersLayer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(leafletRef as any).current     = L

      setMapReady(true)
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapInstanceRef as any).current?.remove()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapInstanceRef as any).current = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(markersRef as any).current     = null
      setMapReady(false)
    }
  }, [])

  // ── Helpers para criar pins ────────────────────────────────────────────────
  const addTecnicoMarkers = useCallback((L: unknown, layer: unknown) => {
    const _L     = L     as typeof import('leaflet')
    const _layer = layer as import('leaflet').LayerGroup

    tecnicos
      .filter(t => t.lat != null && t.lng != null)
      .forEach(t => {
        const color = t.online ? '#3DC45A' : '#ef4444'
        const icon  = _L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8],
        })
        _L.marker([t.lat!, t.lng!], { icon })
          .addTo(_layer)
          .bindPopup(`
            <div style="font-family:'Open Sans',sans-serif;min-width:160px;">
              <div style="font-weight:600;color:#1B3A2D;margin-bottom:2px;">🔧 ${t.full_name ?? 'Sem nome'}</div>
              <div style="font-size:12px;color:#666;margin-bottom:6px;">${t.city ?? '—'}${t.cep ? ` · ${t.cep}` : ''}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
                <span style="width:8px;height:8px;background:${color};border-radius:50%;display:inline-block;"></span>
                <span style="color:${color};font-weight:500;">${t.online ? 'Online agora' : 'Offline'}</span>
              </div>
              <div style="font-size:11px;color:#999;margin-top:4px;">${formatLastSeen(t.last_seen)}</div>
            </div>
          `)
      })
  }, [tecnicos])

  const addServicoMarkers = useCallback((L: unknown, layer: unknown, servicosToPin: Servico[]) => {
    const _L     = L     as typeof import('leaflet')
    const _layer = layer as import('leaflet').LayerGroup

    const porCoordenada: Record<string, Servico[]> = {}
    servicosToPin.forEach(s => {
      const key = `${s.latitude.toFixed(5)},${s.longitude.toFixed(5)}`
      if (!porCoordenada[key]) porCoordenada[key] = []
      porCoordenada[key].push(s)
    })

    Object.values(porCoordenada).forEach(grupo => {
      const s          = grupo[0]
      const totalPlacas = grupo.reduce((sum, g) => sum + (g.module_count ?? 0), 0)

      const icon = _L.divIcon({
        className: '',
        html: `
          <div style="position:relative;">
            <div style="width:16px;height:16px;background:#3b82f6;border:2.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>
            ${grupo.length > 1 ? `
              <div style="position:absolute;top:-6px;right:-6px;width:14px;height:14px;background:#1d4ed8;border:1.5px solid white;border-radius:50%;font-size:9px;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;">${grupo.length}</div>
            ` : ''}
          </div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      })

      const servicosHtml = grupo.map(g => `
        <div style="border-top:1px solid #eee;padding-top:6px;margin-top:6px;font-size:11px;color:#555;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span>
              ${g.module_count ?? '?'} módulos ·
              <span style="color:${g.status === 'completed' ? '#3DC45A' : g.status === 'cancelled' ? '#ef4444' : '#f59e0b'}">
                ${STATUS_LABEL[g.status] ?? g.status}
              </span>
              ${g.preferred_date ? `· ${new Date(g.preferred_date + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
            </span>
            <a href="/admin/servicos/${g.id}" style="color:#1B3A2D;font-weight:600;font-size:11px;white-space:nowrap;text-decoration:none;" onclick="event.stopPropagation()">Ver →</a>
          </div>
        </div>`).join('')

      _L.marker([s.latitude, s.longitude], { icon })
        .addTo(_layer)
        .bindPopup(`
          <div style="font-family:'Open Sans',sans-serif;min-width:170px;max-width:220px;">
            <div style="font-weight:600;color:#1B3A2D;margin-bottom:2px;">
              ☀️ ${s.client_name ? `${s.client_name}` : (s.address ?? s.city ?? 'Endereço não informado')}
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">
              ${s.address ?? s.city ?? '—'}
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">
              ${grupo.length} serviço${grupo.length > 1 ? 's' : ''} · ${totalPlacas} módulos total
            </div>
            ${servicosHtml}
          </div>
        `)
    })
  }, [])

  // ── Effect 2: atualizar markers ao trocar tab ou dados ─────────────────────
  useEffect(() => {
    if (!mapReady) return
    const L     = (leafletRef as any).current     // eslint-disable-line @typescript-eslint/no-explicit-any
    const layer = (markersRef as any).current     // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!L || !layer) return

    ;(layer as import('leaflet').LayerGroup).clearLayers()

    if (tab === 'tecnicos' || tab === 'todos') {
      addTecnicoMarkers(L, layer)
    }
    if (tab === 'servicos' || tab === 'todos') {
      addServicoMarkers(L, layer, servicos)
    }
    if (tab === 'clientes') {
      // Pins de serviços agrupados por client_id (cor azul igual a serviços)
      addServicoMarkers(L, layer, servicos)
    }
  }, [mapReady, tab, tecnicos, servicos, addTecnicoMarkers, addServicoMarkers])

  // ── Pan/zoom para serviços de um cliente ──────────────────────────────────
  const focusCliente = useCallback((clientId: string) => {
    const map = (mapInstanceRef as any).current  // eslint-disable-line @typescript-eslint/no-explicit-any
    const L   = (leafletRef as any).current      // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!map || !L) return

    const pts = servicos.filter(s => s.client_id === clientId)
    if (pts.length === 0) return

    const _L = L as typeof import('leaflet')
    const _m = map as import('leaflet').Map

    if (pts.length === 1) {
      _m.setView([pts[0].latitude, pts[0].longitude], 14)
    } else {
      const bounds = _L.latLngBounds(pts.map(s => [s.latitude, s.longitude] as [number, number]))
      _m.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [servicos])

  // ── Dados derivados para lista lateral ────────────────────────────────────
  const tecnicosOrdenados = [
    ...tecnicos.filter(t => t.online && t.lat),
    ...tecnicos.filter(t => !t.online && t.lat),
    ...tecnicos.filter(t => !t.lat),
  ]
  const clientesAgrupados = agruparPorCliente(servicos)

  return (
    <div className="space-y-3">
      {/* Legenda */}
      <div className="flex items-center gap-4 flex-wrap text-sm text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-green inline-block" /> Online
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Offline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Serviço
        </span>
      </div>

      {/* Mapa + lista lateral */}
      <div className="flex gap-4 h-[580px] w-full min-w-0">
        {/* Mapa */}
        <div className="flex-1 min-w-0 bg-gray-100 rounded-2xl overflow-hidden border border-brand-border">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Lista lateral */}
        <div className="w-72 bg-white border border-brand-border rounded-2xl overflow-hidden flex flex-col">
          {/* Tabs: Técnicos / Clientes / Serviços / Todos */}
          <div className="px-3 py-3 border-b border-gray-100 flex gap-1 flex-wrap">
            {TAB_ORDER.map(f => (
              <button
                key={f}
                onClick={() => setTab(f)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                  tab === f
                    ? 'bg-brand-light text-brand-dark'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                {TAB_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">

            {/* ── Tab: Técnicos ── */}
            {tab === 'tecnicos' && (
              <>
                {tecnicosOrdenados.map(t => (
                  <div key={t.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-bg transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-semibold text-xs">
                        {t.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: !t.lat ? '#d1d5db' : t.online ? '#3DC45A' : '#ef4444' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-dark truncate">{t.full_name ?? 'Sem nome'}</p>
                      <p className="text-xs text-brand-muted truncate">
                        {t.lat ? `${t.city ?? '—'} · ${formatLastSeen(t.last_seen)}` : 'Sem CEP cadastrado'}
                      </p>
                    </div>
                  </div>
                ))}
                {tecnicos.length === 0 && (
                  <p className="px-4 py-6 text-xs text-brand-muted text-center">Nenhum técnico cadastrado</p>
                )}
              </>
            )}

            {/* ── Tab: Clientes ── */}
            {tab === 'clientes' && (
              <>
                {clientesAgrupados.map(c => (
                  <button
                    key={c.client_id}
                    onClick={() => focusCliente(c.client_id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-bg transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-semibold text-xs flex-shrink-0">
                      {c.client_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-medium text-brand-dark truncate">
                          {c.client_name ?? 'Cliente desconhecido'}
                        </p>
                        {c.servicos.length > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                            {c.servicos.length} usinas
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted truncate">
                        {c.client_city ?? '—'} · {c.totalPlacas} módulos
                      </p>
                    </div>
                  </button>
                ))}
                {clientesAgrupados.length === 0 && (
                  <p className="px-4 py-6 text-xs text-brand-muted text-center">Nenhum cliente com serviço no mapa</p>
                )}
              </>
            )}

            {/* ── Tab: Serviços ── */}
            {tab === 'servicos' && (
              <>
                {servicos.slice(0, 30).map(s => (
                  <a key={s.id} href={`/admin/servicos/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-bg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">☀️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-dark truncate">
                        {s.client_name ?? s.city ?? 'Cidade não informada'}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {s.module_count ?? '?'} módulos · {STATUS_LABEL[s.status] ?? s.status}
                      </p>
                    </div>
                  </a>
                ))}
                {servicos.length === 0 && (
                  <p className="px-4 py-6 text-xs text-brand-muted text-center">Nenhum serviço com pin no mapa</p>
                )}
                {servicos.length > 30 && (
                  <p className="px-4 py-3 text-xs text-brand-muted text-center">+{servicos.length - 30} serviços no mapa</p>
                )}
              </>
            )}

            {/* ── Tab: Todos ── */}
            {tab === 'todos' && (
              <>
                <p className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wide bg-gray-50">
                  Técnicos
                </p>
                {tecnicosOrdenados.map(t => (
                  <div key={t.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-bg transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-semibold text-xs">
                        {t.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: !t.lat ? '#d1d5db' : t.online ? '#3DC45A' : '#ef4444' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-dark truncate">{t.full_name ?? 'Sem nome'}</p>
                      <p className="text-xs text-brand-muted truncate">
                        {t.lat ? `${t.city ?? '—'} · ${formatLastSeen(t.last_seen)}` : 'Sem CEP cadastrado'}
                      </p>
                    </div>
                  </div>
                ))}
                {tecnicos.length === 0 && (
                  <p className="px-4 py-4 text-xs text-brand-muted text-center">Nenhum técnico</p>
                )}

                <p className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wide bg-gray-50">
                  Serviços
                </p>
                {servicos.slice(0, 20).map(s => (
                  <a key={s.id} href={`/admin/servicos/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-bg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">☀️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-dark truncate">
                        {s.client_name ?? s.city ?? 'Cidade não informada'}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {s.module_count ?? '?'} módulos · {STATUS_LABEL[s.status] ?? s.status}
                      </p>
                    </div>
                  </a>
                ))}
                {servicos.length === 0 && (
                  <p className="px-4 py-4 text-xs text-brand-muted text-center">Nenhum serviço</p>
                )}
                {servicos.length > 20 && (
                  <p className="px-4 py-3 text-xs text-brand-muted text-center">+{servicos.length - 20} serviços</p>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
