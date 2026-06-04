"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_USUARIOS } from "@/lib/mock-data";

type Filtro = "todos" | "cliente" | "tecnico" | "admin";
const CIDADES = ["Todas", "Jaraguá do Sul", "Pomerode", "Florianópolis"];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function initialsColor(nome: string) {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  return colors[(nome?.charCodeAt(0) ?? 0) % colors.length];
}

function initials(nome: string) {
  return (nome ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    cliente: { label: "Cliente", cls: "bg-blue-100 text-blue-700" },
    tecnico: { label: "Técnico", cls: "bg-emerald-100 text-emerald-700" },
    admin:   { label: "Admin",   cls: "bg-violet-100 text-violet-700" },
  };
  const s = map[tipo] ?? { label: tipo, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Normalize real profiles from Supabase to the display shape ──────────────

interface RealProfile {
  user_id?: string;
  id?: string;
  full_name?: string;
  role?: string;
  city?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  approved_at?: string | null;
  [key: string]: unknown;
}

function ApproveTechButton({ userId, onApproved }: { userId: string; onApproved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve-technician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tecnicoUserId: userId }),
      });
      if (res.ok) { setDone(true); onApproved(); }
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">✓ Aprovado</span>;
  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-[10px] font-bold text-white bg-brand-green px-3 py-1.5 rounded-full hover:bg-brand-green/90 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Aprovando…" : "Aprovar técnico"}
    </button>
  );
}

function normalizeProfile(p: RealProfile, idx: number) {
  return {
    id: idx + 1,
    nome: p.full_name ?? p.email ?? "Usuário",
    email: p.email ?? "",
    tipo: (p.role ?? "cliente") as "cliente" | "tecnico" | "admin",
    cidade: p.city ?? "—",
    cadastro: p.created_at ?? "",
    status: "ativo" as const,
  };
}

interface Props {
  profiles: RealProfile[];
  hasError: boolean;
}

export default function UsuariosClient({ profiles, hasError }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("Todas");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const onApproved = useCallback((uid: string) => {
    setApprovedIds((prev) => new Set(Array.from(prev).concat(uid)));
  }, []);

  // Use mock ONLY on query error; empty real data stays empty
  const usuarios = useMemo(() => {
    if (hasError) {
      return MOCK_USUARIOS.map((u) => ({ ...u, id: u.id }));
    }
    return profiles.map(normalizeProfile);
  }, [profiles, hasError]);

  // Técnicos pendentes de aprovação (role=tecnico, approved_at null, not yet approved optimistically)
  const tecnicosPendentes = useMemo(() => {
    if (hasError) return [];
    return profiles.filter(
      (p) => p.role === "tecnico" && !p.approved_at && p.user_id && !approvedIds.has(p.user_id!),
    );
  }, [profiles, hasError, approvedIds]);

  const inicioMes = new Date("2026-03-01");

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtro !== "todos" && u.tipo !== filtro) return false;
      if (cidade !== "Todas" && u.cidade !== cidade) return false;
      if (busca) {
        const b = busca.toLowerCase();
        if (!u.nome.toLowerCase().includes(b) && !u.email.toLowerCase().includes(b)) return false;
      }
      return true;
    });
  }, [usuarios, filtro, busca, cidade]);

  const counters = {
    total: usuarios.length,
    clientes: usuarios.filter((u) => u.tipo === "cliente").length,
    tecnicos: usuarios.filter((u) => u.tipo === "tecnico").length,
    novosMes: usuarios.filter((u) => u.cadastro && new Date(u.cadastro) >= inicioMes).length,
  };

  const tabs: { key: Filtro; label: string; emoji: string }[] = [
    { key: "todos",   label: "Todos",    emoji: "👥" },
    { key: "cliente", label: "Clientes", emoji: "👤" },
    { key: "tecnico", label: "Técnicos", emoji: "🔧" },
    { key: "admin",   label: "Admins",   emoji: "🛡️" },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-brand-muted hover:text-brand-dark transition-colors" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-brand-dark">👥 Usuários</h1>
            {hasError && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                📊 Dados demonstrativos
              </span>
            )}
          </div>
          <p className="text-brand-muted text-sm mt-0.5">Clientes, técnicos e admins cadastrados na plataforma</p>
        </div>
      </div>

      {/* ── Técnicos pendentes de aprovação ── */}
      {tecnicosPendentes.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 space-y-3">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            🔔 {tecnicosPendentes.length} técnico{tecnicosPendentes.length > 1 ? "s" : ""} aguardando aprovação
          </p>
          <div className="space-y-2">
            {tecnicosPendentes.map((p) => (
              <div
                key={p.user_id}
                className="flex items-center justify-between gap-4 bg-white border border-amber-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{p.full_name ?? "—"}</p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    📍 {p.city ?? "—"}
                    {p.created_at && <> · cadastro {new Date(p.created_at).toLocaleDateString("pt-BR")}</>}
                  </p>
                </div>
                <ApproveTechButton userId={p.user_id!} onApproved={() => onApproved(p.user_id!)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { emoji: "👥", label: "Total de usuários", value: counters.total },
          { emoji: "👤", label: "Clientes",           value: counters.clientes },
          { emoji: "🔧", label: "Técnicos",           value: counters.tecnicos },
          { emoji: "🌟", label: "Novos este mês",     value: counters.novosMes },
        ].map(({ emoji, label, value }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm">
            <span className="text-2xl">{emoji}</span>
            <p className="font-heading font-bold text-brand-dark text-2xl mt-2">{value}</p>
            <p className="text-xs text-brand-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFiltro(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filtro === t.key
                  ? "bg-brand-dark text-white"
                  : "bg-brand-bg text-brand-muted hover:text-brand-dark"
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border text-sm text-brand-dark placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white"
          />
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-brand-border text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white min-w-[180px]"
          >
            {CIDADES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <p className="text-xs text-brand-muted">
          {filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table — desktop */}
      <div className="card !p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-brand-bg">
              <tr>
                {["", "Nome", "Email", "Tipo", "Cidade", "Cadastro", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((u) => {
                const isNew = u.cadastro ? new Date(u.cadastro) >= inicioMes : false;
                const rawProfile = !hasError ? profiles.find((p) => p.user_id === u.email || normalizeProfile(p, 0).nome === u.nome) : null;
                const isPendingTech = u.tipo === "tecnico" && rawProfile && !rawProfile.approved_at;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-brand-bg/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${initialsColor(u.nome)}`}>
                        {initials(u.nome)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-dark whitespace-nowrap">
                      {u.nome}
                      {isNew && <span className="ml-1.5 text-[9px] bg-brand-light text-brand-green font-bold px-1.5 py-0.5 rounded-full">NOVO</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{u.email}</td>
                    <td className="px-4 py-3"><TipoBadge tipo={u.tipo} /></td>
                    <td className="px-4 py-3 text-brand-dark whitespace-nowrap">📍 {u.cidade}</td>
                    <td className="px-4 py-3 text-brand-muted whitespace-nowrap">{fmtData(u.cadastro)}</td>
                    <td className="px-4 py-3">
                      {isPendingTech ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                          ⏳ Pendente
                        </span>
                      ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700`}>
                        Ativo
                      </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-brand-muted text-sm">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => {
          const isNew = u.cadastro ? new Date(u.cadastro) >= inicioMes : false;
          return (
            <div key={u.id} className="card space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${initialsColor(u.nome)}`}>
                  {initials(u.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-brand-dark text-sm">{u.nome}</p>
                    {isNew && <span className="text-[9px] bg-brand-light text-brand-green font-bold px-1.5 py-0.5 rounded-full">NOVO</span>}
                  </div>
                  <p className="text-xs text-brand-muted truncate">{u.email}</p>
                </div>
                <TipoBadge tipo={u.tipo} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-brand-muted">
                <span>📍 {u.cidade}</span>
                {u.cadastro && <><span>·</span><span>Cadastro: {fmtData(u.cadastro)}</span></>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-brand-muted text-sm">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
