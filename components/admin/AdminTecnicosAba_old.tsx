"use client";

import { useState } from "react";

type Aba = "pendentes" | "aprovados" | "recusados";

interface TecnicoPendente {
  id: string;
  nome: string;
  cidade: string;
  cadastro: string;
  experiencia: string;
  treinamento: number;
}

interface TecnicoAprovado {
  id: string;
  nome: string;
  cidade: string;
  nota: number;
  servicos: number;
  aprovadoEm: string;
}

interface TecnicoRecusado {
  id: string;
  nome: string;
  cidade: string;
  motivo: string;
  recusadoEm: string;
}

const pendentes: TecnicoPendente[] = [
  {
    id: "t1",
    nome: "Carlos Mendes",
    cidade: "Jaraguá do Sul",
    cadastro: "27/03/2026",
    experiencia: "5 anos como eletricista industrial",
    treinamento: 100,
  },
  {
    id: "t2",
    nome: "Ana Rodrigues",
    cidade: "Pomerode",
    cadastro: "25/03/2026",
    experiencia: "Técnico em elétrica, 3 anos",
    treinamento: 75,
  },
  {
    id: "t3",
    nome: "Pedro Santos",
    cidade: "Florianópolis",
    cadastro: "20/03/2026",
    experiencia: "Eletricista residencial, 2 anos",
    treinamento: 40,
  },
];

const aprovados: TecnicoAprovado[] = [
  { id: "a1", nome: "João Lima",      cidade: "Jaraguá do Sul", nota: 4.9, servicos: 28, aprovadoEm: "10/01/2026" },
  { id: "a2", nome: "Marcos Ferreira", cidade: "Pomerode",      nota: 4.7, servicos: 14, aprovadoEm: "15/01/2026" },
  { id: "a3", nome: "Rafael Costa",   cidade: "Florianópolis",  nota: 5.0, servicos: 31, aprovadoEm: "08/01/2026" },
  { id: "a4", nome: "Luiz Oliveira",  cidade: "Jaraguá do Sul", nota: 4.8, servicos: 19, aprovadoEm: "20/01/2026" },
];

const recusados: TecnicoRecusado[] = [
  { id: "r1", nome: "Fábio Nascimento", cidade: "Florianópolis", motivo: "Treinamento incompleto (30%)", recusadoEm: "14/03/2026" },
  { id: "r2", nome: "Tiago Alves",      cidade: "Pomerode",      motivo: "Documentação inválida", recusadoEm: "08/03/2026" },
];

export default function AdminTecnicosAba() {
  const [aba, setAba] = useState<Aba>("pendentes");
  const [aprovados_, setAprovados_] = useState<string[]>([]);
  const [recusados_, setRecusados_] = useState<string[]>([]);
  const [motivoAberto, setMotivoAberto] = useState<string | null>(null);
  const [motivoTexto, setMotivoTexto] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  function showToast(msg: string, tipo: "ok" | "err") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  const pendentesVisiveis = pendentes.filter(
    (p) => !aprovados_.includes(p.id) && !recusados_.includes(p.id)
  );
  const pendentesCount = pendentesVisiveis.length;

  function aprovar(id: string) {
    const nome = pendentes.find((p) => p.id === id)?.nome ?? "Técnico";
    setAprovados_((prev) => [...prev, id]);
    setMotivoAberto(null);
    showToast(`✅ ${nome} aprovado com sucesso!`, "ok");
  }

  function confirmarRecusa(id: string) {
    const nome = pendentes.find((p) => p.id === id)?.nome ?? "Técnico";
    setRecusados_((prev) => [...prev, id]);
    setMotivoAberto(null);
    showToast(`❌ ${nome} recusado.`, "err");
  }

  const abas: { key: Aba; label: string; count?: number }[] = [
    { key: "pendentes", label: "Pendentes", count: pendentesCount },
    { key: "aprovados", label: "Aprovados", count: aprovados.length + aprovados_.length },
    { key: "recusados", label: "Recusados", count: recusados.length + recusados_.length },
  ];

  return (
    <div className="card space-y-4">
      <h2 className="font-heading font-bold text-brand-dark text-base">
        🧑‍🔧 Gestão de técnicos
      </h2>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            toast.tipo === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.msg}
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-brand-light rounded-xl p-1 gap-1">
        {abas.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              aba === key
                ? "bg-white text-brand-dark shadow-sm"
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  aba === key
                    ? key === "pendentes"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-brand-green/20 text-brand-green"
                    : "bg-brand-border text-brand-muted"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pendentes ── */}
      {aba === "pendentes" && (
        <div className="space-y-3">
          {pendentesVisiveis.length === 0 ? (
            <div className="text-center py-8 text-brand-muted text-sm">
              ✅ Nenhum técnico aguardando aprovação
            </div>
          ) : (
            pendentesVisiveis.map((t) => (
              <div
                key={t.id}
                className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-brand-dark text-sm">🧑‍🔧 {t.nome}</p>
                    <p className="text-xs text-brand-muted">📍 {t.cidade}</p>
                    <p className="text-xs text-brand-muted">📅 Cadastro: {t.cadastro}</p>
                    <p className="text-xs text-brand-muted">🔧 {t.experiencia}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      t.treinamento === 100
                        ? "bg-brand-green/15 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.treinamento === 100 ? "✅" : "⏳"} Treinamento {t.treinamento}%
                  </span>
                </div>

                {/* Motivo recusa */}
                {motivoAberto === t.id && (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Motivo da recusa (opcional)…"
                      className="w-full text-xs border border-brand-border rounded-xl px-3 py-2 focus:outline-none focus:border-brand-dark resize-none"
                      value={motivoTexto[t.id] ?? ""}
                      onChange={(e) =>
                        setMotivoTexto((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmarRecusa(t.id)}
                        className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Confirmar recusa
                      </button>
                      <button
                        onClick={() => setMotivoAberto(null)}
                        className="text-xs text-brand-muted px-3 py-1.5 rounded-lg hover:bg-brand-border transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {motivoAberto !== t.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => aprovar(t.id)}
                      disabled={t.treinamento < 100}
                      className="flex-1 text-xs font-bold py-2 rounded-xl bg-brand-green text-white hover:bg-brand-green/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✅ Aprovar
                    </button>
                    <button
                      onClick={() => setMotivoAberto(t.id)}
                      className="flex-1 text-xs font-bold py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      ❌ Recusar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Aprovados ── */}
      {aba === "aprovados" && (
        <div className="space-y-2">
          {aprovados.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 bg-brand-bg rounded-xl border border-brand-border px-4 py-3 flex-wrap"
            >
              <div className="space-y-0.5">
                <p className="font-semibold text-brand-dark text-sm">🧑‍🔧 {t.nome}</p>
                <p className="text-xs text-brand-muted">📍 {t.cidade} · aprovado em {t.aprovadoEm}</p>
              </div>
              <div className="flex items-center gap-4 text-xs flex-shrink-0">
                <span className="text-amber-500 font-bold">⭐ {t.nota.toFixed(1)}</span>
                <span className="text-brand-muted">{t.servicos} serviços</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recusados ── */}
      {aba === "recusados" && (
        <div className="space-y-2">
          {recusados.length === 0 ? (
            <p className="text-center py-8 text-brand-muted text-sm">Nenhum técnico recusado</p>
          ) : (
            recusados.map((t) => (
              <div
                key={t.id}
                className="bg-red-50 rounded-xl border border-red-200 px-4 py-3 space-y-0.5"
              >
                <p className="font-semibold text-brand-dark text-sm">🧑‍🔧 {t.nome}</p>
                <p className="text-xs text-brand-muted">📍 {t.cidade} · recusado em {t.recusadoEm}</p>
                <p className="text-xs text-red-600 font-medium mt-1">Motivo: {t.motivo}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
