'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusLabel(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    completed:   { label: '✅ Concluído',    cls: 'bg-emerald-100 text-emerald-700' },
    in_progress: { label: '🔄 Em andamento', cls: 'bg-blue-100 text-blue-700'       },
    accepted:    { label: '📅 Aceito',       cls: 'bg-indigo-100 text-indigo-700'   },
    pending:     { label: '⏳ Pendente',     cls: 'bg-amber-100 text-amber-700'     },
    cancelled:   { label: '❌ Cancelado',    cls: 'bg-red-100 text-red-600'         },
  };
  const v = map[s] ?? { label: s, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${v.cls}`}>{v.label}</span>;
}

export type Servico = {
  id: string;
  data: string;
  cidade: string;
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  tecnicoNome: string;
  modulos: number;
  valor: number;
  margem: number;
  status: string;
};

export type Tecnico = {
  user_id: string;
  full_name: string;
  city: string;
};

type Props = {
  servicos: Servico[];
  tecnicos: Tecnico[];
};

export default function ServicosView({ servicos, tecnicos }: Props) {
  const [filtro, setFiltro] = useState<string>('todos');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [localServicos, setLocalServicos] = useState<Servico[]>(servicos);

  const filtros = [
    { key: 'todos',       label: 'Todos' },
    { key: 'pending',     label: 'Pendentes' },
    { key: 'accepted',    label: 'Aceitos' },
    { key: 'in_progress', label: 'Em andamento' },
    { key: 'completed',   label: 'Concluídos' },
    { key: 'cancelled',   label: 'Cancelados' },
  ];

  const shown = filtro === 'todos' ? localServicos : localServicos.filter(s => s.status === filtro);

  const concluidos     = localServicos.filter(s => s.status === 'completed');
  const totalReceita   = concluidos.reduce((a, s) => a + s.valor, 0);
  const totalMargem    = concluidos.reduce((a, s) => a + s.margem, 0);

  async function assignTecnico(servicoId: string, tecnicoId: string) {
    if (!tecnicoId) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await fetch('/api/admin/assign-technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicoId, tecnicoId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Erro ao designar técnico');
      }
      const { tecnicoNome } = await res.json();
      setLocalServicos(prev =>
        prev.map(s => s.id === servicoId
          ? { ...s, status: 'accepted', tecnicoNome: tecnicoNome ?? '' }
          : s,
        ),
      );
      setAssigningId(null);
    } catch (e: any) {
      setAssignError(e.message);
    } finally {
      setAssignLoading(false);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-brand-muted hover:text-brand-dark transition-colors" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1">Gestão</p>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark leading-tight">Serviços</h1>
          <p className="text-brand-muted text-sm mt-0.5">Todos os serviços da plataforma</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { emoji: '📋', label: 'Total de serviços',  value: String(localServicos.length) },
          { emoji: '✅', label: 'Concluídos',         value: String(concluidos.length) },
          { emoji: '💰', label: 'Receita total',      value: fmt(totalReceita) },
          { emoji: '🏦', label: 'Margem plataforma',   value: fmt(totalMargem) },
        ].map(({ emoji, label, value }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm">
            <span className="text-2xl">{emoji}</span>
            <p className="font-heading font-bold text-brand-dark text-xl mt-2">{value}</p>
            <p className="text-xs text-brand-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {filtros.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filtro === f.key
                ? 'bg-brand-dark text-white'
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-dark'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filtro === f.key ? 'bg-white/20' : 'bg-brand-bg'}`}>
              {f.key === 'todos' ? localServicos.length : localServicos.filter(s => s.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {assignError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {assignError}
        </div>
      )}

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-brand-bg">
              <tr>
                {['#', 'Data', 'Cidade', 'Cliente', 'Técnico', 'Módulos', 'Valor', 'Margem', 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {shown.map(s => (
                <tr key={s.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="px-4 py-3 text-brand-muted font-mono text-[10px]">{s.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-brand-muted">{s.data}</td>
                  <td className="px-4 py-3 font-medium text-brand-dark">📍 {s.cidade}</td>
                  <td className="px-4 py-3 text-brand-dark">
                    <div className="font-medium">{s.clienteNome}</div>
                    {(s.clienteEmail || s.clienteTelefone) && (
                      <div className="text-[10px] text-brand-muted leading-tight mt-0.5 space-y-0.5">
                        {s.clienteEmail && (
                          <div className="truncate max-w-[180px]" title={s.clienteEmail}>✉️ {s.clienteEmail}</div>
                        )}
                        {s.clienteTelefone && <div>📞 {s.clienteTelefone}</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.status === 'pending' && s.tecnicoNome === '—' ? (
                      assigningId === s.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="text-xs border border-brand-border rounded-lg px-2 py-1 bg-white"
                            defaultValue=""
                            onChange={async (e) => { if (e.target.value) await assignTecnico(s.id, e.target.value); }}
                            disabled={assignLoading}
                          >
                            <option value="">Selecionar técnico…</option>
                            {tecnicos
                              .filter(t => !t.city || t.city === s.cidade)
                              .map(t => (
                                <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
                              ))}
                          </select>
                          <button onClick={() => setAssigningId(null)} className="text-brand-muted hover:text-brand-dark text-xs">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(s.id)}
                          className="text-xs font-semibold text-brand-green hover:underline"
                        >
                          + Designar técnico
                        </button>
                      )
                    ) : (
                      <span className="text-brand-dark">{s.tecnicoNome}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-brand-muted">{s.modulos}</td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">{s.valor > 0 ? fmt(s.valor) : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-green">{s.margem > 0 ? fmt(s.margem) : '—'}</td>
                  <td className="px-4 py-3">{statusLabel(s.status)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/servicos/${s.id}`} className="text-xs text-brand-green font-semibold hover:underline whitespace-nowrap">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="text-center py-10 text-brand-muted text-sm">Nenhum serviço neste filtro.</p>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-brand-border">
          {shown.map(s => (
            <div key={s.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-brand-dark text-sm">{s.clienteNome}</p>
                {statusLabel(s.status)}
              </div>
              {(s.clienteEmail || s.clienteTelefone) && (
                <div className="text-[11px] text-brand-muted space-y-0.5">
                  {s.clienteEmail && <div className="truncate">✉️ {s.clienteEmail}</div>}
                  {s.clienteTelefone && <div>📞 {s.clienteTelefone}</div>}
                </div>
              )}
              <p className="text-xs text-brand-muted">📍 {s.cidade} · {s.data} · ☀️ {s.modulos} módulos</p>
              <div className="flex items-center gap-3 text-xs justify-between">
                <div className="flex gap-3">
                  <span className="font-bold text-brand-dark">{s.valor > 0 ? fmt(s.valor) : '—'}</span>
                  <span className="text-brand-green font-semibold">margem: {s.margem > 0 ? fmt(s.margem) : '—'}</span>
                </div>
                <Link href={`/admin/servicos/${s.id}`} className="text-brand-green font-semibold">Ver →</Link>
              </div>
              {s.status === 'pending' && s.tecnicoNome === '—' && (
                <div className="pt-1">
                  <select
                    className="w-full text-xs border border-brand-border rounded-lg px-2 py-1.5 bg-white"
                    defaultValue=""
                    onChange={async (e) => { if (e.target.value) await assignTecnico(s.id, e.target.value); }}
                  >
                    <option value="">Designar técnico…</option>
                    {tecnicos.filter(t => !t.city || t.city === s.cidade).map(t => (
                      <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          {shown.length === 0 && (
            <p className="text-center py-10 text-brand-muted text-sm">Nenhum serviço neste filtro.</p>
          )}
        </div>
      </div>
    </div>
  );
}
