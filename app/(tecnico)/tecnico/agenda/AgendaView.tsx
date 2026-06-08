'use client';

import { useState } from 'react';
import Link from 'next/link';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function addHours(horario: string, duracao: number) {
  const [h, m] = horario.split(':').map(Number);
  const total = h * 60 + m + duracao * 60;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export type AgendaChamado = {
  id: string;
  data: string;
  horario: string;
  status: 'agendado' | 'confirmado' | 'concluido';
  cidade: string;
  endereco: string;
  modulos: number;
  valor: number;
  duracao: number;
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'agendado')
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Agendado</span>;
  if (status === 'confirmado')
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Confirmado</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Concluído</span>;
}

export default function AgendaView({ chamados }: { chamados: AgendaChamado[] }) {
  const TODAY = new Date();
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY.getDate());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  const chamadosByDay = new Map<string, AgendaChamado[]>();
  for (const c of chamados) {
    const arr = chamadosByDay.get(c.data) ?? [];
    arr.push(c);
    chamadosByDay.set(c.data, arr);
  }

  function dayKey(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isToday(day: number) {
    return viewYear === TODAY.getFullYear() && viewMonth === TODAY.getMonth() && day === TODAY.getDate();
  }

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
    return d < t;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  const selectedChamados = selectedDay
    ? (chamadosByDay.get(dayKey(selectedDay)) ?? []).slice().sort((a, b) => a.horario.localeCompare(b.horario))
    : [];

  const monthChamados = chamados.filter(c => {
    const [y, m] = c.data.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1;
  });
  const diasComChamado = new Set(monthChamados.map(c => c.data)).size;
  const ganhosPrevisto = monthChamados
    .filter(c => c.status !== 'concluido')
    .reduce((a, c) => a + c.modulos * 13, 0);
  const ganhosConcluidos = monthChamados
    .filter(c => c.status === 'concluido')
    .reduce((a, c) => a + c.modulos * 13, 0);

  let maxDay = '';
  let maxCount = 0;
  chamadosByDay.forEach((arr, key) => {
    const [ky, km] = key.split('-').map(Number);
    if (ky === viewYear && km === viewMonth + 1 && arr.length > maxCount) {
      maxCount = arr.length;
      const [, , kd] = key.split('-');
      maxDay = `${kd}/${String(viewMonth + 1).padStart(2, '0')} (${arr.length} chamados)`;
    }
  });

  const totalCells = firstDow + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">📅 Minha Agenda</h1>
        <p className="text-brand-muted text-sm mt-0.5">Chamados agendados e histórico do mês</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-bg">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light transition-colors text-brand-dark font-bold text-lg"
                aria-label="Mês anterior"
              >
                ‹
              </button>
              <h2 className="font-heading font-bold text-brand-dark text-base">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light transition-colors text-brand-dark font-bold text-lg"
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-brand-border">
              {WEEKDAYS.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: rows * 7 }).map((_, idx) => {
                const day = idx - firstDow + 1;
                const inMonth = day >= 1 && day <= daysInMonth;
                const key = inMonth ? dayKey(day) : '';
                const dayChamados = inMonth ? (chamadosByDay.get(key) ?? []) : [];
                const today = inMonth && isToday(day);
                const past = inMonth && isPast(day);
                const selected = inMonth && selectedDay === day;
                const hasChamados = dayChamados.length > 0;
                const isFull = dayChamados.length >= 3;

                return (
                  <div
                    key={idx}
                    className={`
                      relative min-h-[56px] p-1.5 border-r border-b border-brand-border
                      ${idx % 7 === 6 ? 'border-r-0' : ''}
                      ${inMonth && hasChamados ? 'cursor-pointer' : ''}
                      ${selected ? 'bg-brand-light' : inMonth && hasChamados ? 'hover:bg-brand-bg/60' : ''}
                      transition-colors
                    `}
                    onClick={() => {
                      if (!inMonth) return;
                      setSelectedDay(selected ? null : day);
                    }}
                  >
                    {inMonth && (
                      <>
                        <div
                          className={`
                            w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mx-auto
                            ${today ? 'bg-brand-green text-white' : ''}
                            ${past && !today ? 'text-brand-muted' : !today ? 'text-brand-dark' : ''}
                          `}
                        >
                          {day}
                        </div>
                        {hasChamados && (
                          <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                            {Array.from({ length: Math.min(dayChamados.length, 3) }).map((_, di) => (
                              <div
                                key={di}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: isFull ? '#F59E0B' : '#3DC45A' }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-brand-border bg-brand-bg flex flex-wrap gap-4 text-[10px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-green" /> Hoje
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green" /> 1–2 chamados
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 3+ chamados
              </span>
            </div>
          </div>

          {selectedDay && (
            <div className="mt-4 space-y-3">
              <h3 className="font-heading font-bold text-brand-dark text-sm">
                Chamados em {String(selectedDay).padStart(2, '0')}/{String(viewMonth + 1).padStart(2, '0')}/{viewYear}
              </h3>
              {selectedChamados.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-brand-muted text-sm">Nenhum chamado neste dia.</p>
                </div>
              ) : (
                selectedChamados.map(c => (
                  <div key={c.id} className="card space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-brand-muted">
                          ⏰ {c.horario} – {addHours(c.horario, c.duracao)}
                        </p>
                        <p className="font-semibold text-brand-dark text-sm">📍 {c.cidade}</p>
                        <p className="text-xs text-brand-muted">{c.endereco}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-brand-border">
                      <span className="text-brand-muted">🔋 {c.modulos} módulos</span>
                      <span className="font-bold text-brand-green">
                        💰 {fmt(c.modulos * 13)} <span className="font-normal text-brand-muted">(R$ 13/módulo)</span>
                      </span>
                    </div>
                    <Link
                      href="/tecnico/chamados"
                      className="block text-center text-xs font-semibold text-brand-green hover:underline"
                    >
                      Ver chamados →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="lg:w-64 space-y-4">
          <div className="card space-y-4">
            <h3 className="font-heading font-bold text-brand-dark text-sm">Resumo do mês</h3>
            <div className="space-y-3">
              {[
                { emoji: '📋', label: 'Total de chamados', value: String(monthChamados.length) },
                { emoji: '📅', label: 'Dias com chamado',  value: `${diasComChamado} de ${daysInMonth}` },
                { emoji: '🏆', label: 'Dia mais cheio',    value: maxDay || '—' },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="text-[10px] text-brand-muted uppercase tracking-wide font-semibold">{label}</p>
                    <p className="text-sm font-bold text-brand-dark mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-border pt-4 space-y-2">
              <div className="bg-brand-light rounded-xl p-3">
                <p className="text-[10px] text-brand-muted uppercase tracking-wide font-semibold">Concluídos</p>
                <p className="text-lg font-heading font-bold text-brand-green mt-0.5">{fmt(ganhosConcluidos)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: '#1B3A2D' }}>
                <p className="text-[10px] text-white/60 uppercase tracking-wide font-semibold">Ganho previsto</p>
                <p className="text-lg font-heading font-bold text-brand-green mt-0.5">{fmt(ganhosPrevisto + ganhosConcluidos)}</p>
                <p className="text-[10px] text-white/50 mt-0.5">incluindo pendentes</p>
              </div>
            </div>
          </div>

          <div className="card bg-brand-bg !shadow-none border border-brand-border text-xs text-brand-muted space-y-1">
            <p className="font-semibold text-brand-dark">💡 Dica</p>
            <p>Clique em qualquer dia com bolinhas para ver os chamados desse dia.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
