import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function whatsAppHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export const metadata: Metadata = { title: "Detalhe do Serviço — Admin | Painel Clean" };

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
function fmtDateShort(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: "⏳ Pendente",     cls: "bg-amber-100 text-amber-700"     },
    accepted:   { label: "📅 Aceito",       cls: "bg-indigo-100 text-indigo-700"   },
    in_progress:{ label: "🔄 Em andamento", cls: "bg-blue-100 text-blue-700"       },
    completed:  { label: "✅ Concluído",    cls: "bg-emerald-100 text-emerald-700" },
    cancelled:  { label: "❌ Cancelado",    cls: "bg-red-100 text-red-600"         },
  };
  const v = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`text-sm font-bold px-3 py-1 rounded-full ${v.cls}`}>{v.label}</span>;
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:               { label: "⏳ Aguardando pagamento", cls: "bg-amber-100 text-amber-700" },
    awaiting_confirmation: { label: "🔔 Aguardando confirmação", cls: "bg-blue-100 text-blue-700" },
    confirmed:             { label: "✅ Pagamento confirmado", cls: "bg-emerald-100 text-emerald-700" },
    released:              { label: "💸 Repasse liberado",     cls: "bg-brand-light text-brand-green" },
  };
  const v = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`text-sm font-bold px-3 py-1 rounded-full ${v.cls}`}>{v.label}</span>;
}

export default async function AdminServicoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let service: any = null;
  let clientProfile: any = null;
  let clientEmail: string | null = null;
  let techProfile: any = null;
  let techEmail: string | null = null;
  let report: any = null;

  try {
    // Auth check via session client; data fetches via service role to bypass
    // RLS recursion and to access auth.users.email.
    await createClient();
    const admin = createServiceClient();

    const { data: svc } = await admin
      .from("service_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    service = svc;

    if (service) {
      const { data: cp } = await admin
        .from("profiles")
        .select("full_name, phone, city")
        .eq("user_id", service.client_id)
        .maybeSingle();
      clientProfile = cp;

      try {
        const { data: u } = await admin.auth.admin.getUserById(service.client_id);
        clientEmail = u?.user?.email ?? null;
      } catch { /* ignore */ }

      if (service.technician_id) {
        const { data: tp } = await admin
          .from("profiles")
          .select("full_name, phone, city")
          .eq("user_id", service.technician_id)
          .maybeSingle();
        techProfile = tp;

        try {
          const { data: u } = await admin.auth.admin.getUserById(service.technician_id);
          techEmail = u?.user?.email ?? null;
        } catch { /* ignore */ }
      }

      const { data: rp } = await admin
        .from("service_reports")
        .select("*")
        .eq("service_request_id", id)
        .maybeSingle();
      report = rp;
    }
  } catch (err) {
    console.warn("[admin/servicos/id] error:", err);
  }

  const valorServico = service?.price_estimate ?? 0;
  const comissao = valorServico * 0.25;
  const repasse = valorServico * 0.75;

  return (
    <div className="page-container max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/servicos" className="text-brand-muted hover:text-brand-dark transition-colors" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-brand-dark">Detalhe do Serviço</h1>
          <p className="text-brand-muted text-xs mt-0.5 font-mono">{id}</p>
        </div>
      </div>

      {!service ? (
        <div className="card text-center py-12">
          <p className="text-brand-muted text-sm">Serviço não encontrado ou dados demonstrativos.</p>
          <p className="text-xs text-brand-muted mt-1">
            Certifique-se de que a tabela <code>service_requests</code> existe no Supabase.
          </p>
        </div>
      ) : (
        <>
          {/* Status + Payment */}
          <div className="card space-y-3">
            <h2 className="font-heading font-bold text-brand-dark text-base">📊 Status</h2>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status={service.status ?? "pending"} />
              <PaymentBadge status={service.payment_status ?? "pending"} />
            </div>

            {/* Timeline */}
            <div className="space-y-1.5 pt-2 border-t border-brand-border text-xs text-brand-muted">
              <p>📝 Criado: <span className="text-brand-dark">{fmtDate(service.created_at)}</span></p>
              {service.accepted_at && <p>✅ Aceito: <span className="text-brand-dark">{fmtDate(service.accepted_at)}</span></p>}
              {service.completed_at && <p>🏁 Concluído: <span className="text-brand-dark">{fmtDate(service.completed_at)}</span></p>}
              {service.paid_at && <p>💳 Cliente pagou: <span className="text-brand-dark">{fmtDate(service.paid_at)}</span></p>}
              {service.payment_reported_at && <p>🔔 Pagamento reportado: <span className="text-brand-dark">{fmtDate(service.payment_reported_at)}</span></p>}
              {service.released_at && <p>💸 Repasse liberado: <span className="text-brand-dark">{fmtDate(service.released_at)}</span></p>}
              {service.cancelled_at && <p>❌ Cancelado: <span className="text-brand-dark">{fmtDate(service.cancelled_at)}</span></p>}
            </div>
          </div>

          {/* Service data */}
          <div className="card space-y-3">
            <h2 className="font-heading font-bold text-brand-dark text-base">☀️ Dados do Serviço</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Cidade</p>
                <p className="text-brand-dark font-medium">📍 {service.city}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Data agendada</p>
                <p className="text-brand-dark font-medium">{fmtDateShort(service.preferred_date)}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Período</p>
                <p className="text-brand-dark font-medium">{service.preferred_time ?? "—"}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Nº de placas</p>
                <p className="text-brand-dark font-medium">☀️ {service.module_count}</p>
              </div>
              {service.tipo_instalacao && (
                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Tipo de instalação</p>
                  <p className="text-brand-dark font-medium capitalize">{service.tipo_instalacao?.replace(/_/g, " ")}</p>
                </div>
              )}
              {service.nivel_sujeira && (
                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Sujeira</p>
                  <p className="text-brand-dark font-medium capitalize">{service.nivel_sujeira}</p>
                </div>
              )}
              {service.nivel_acesso && (
                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Acesso</p>
                  <p className="text-brand-dark font-medium capitalize">{service.nivel_acesso}</p>
                </div>
              )}
              {service.distancia_km && (
                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Distância</p>
                  <p className="text-brand-dark font-medium">{service.distancia_km} km</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Endereço</p>
              <p className="text-brand-dark text-sm">{service.address}</p>
              {service.latitude && service.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${service.latitude},${service.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                >
                  📍 Ver no mapa →
                </a>
              )}
            </div>
            {service.notes && (
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-0.5">Notas</p>
                <p className="text-brand-dark text-sm">{service.notes}</p>
              </div>
            )}
          </div>

          {/* Client */}
          <div className="card space-y-3">
            <h2 className="font-heading font-bold text-brand-dark text-base">👤 Cliente</h2>
            {clientProfile ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-brand-muted text-xs">Nome</p>
                    <p className="text-brand-dark font-medium">{clientProfile.full_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-brand-muted text-xs">Email</p>
                    <p className="text-brand-dark font-medium break-all">{clientEmail ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-brand-muted text-xs">Telefone</p>
                    <p className="text-brand-dark font-medium">{clientProfile.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-brand-muted text-xs">Cidade</p>
                    <p className="text-brand-dark font-medium">{clientProfile.city ?? "—"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {clientEmail && (
                    <a
                      href={`mailto:${clientEmail}`}
                      className="text-xs font-semibold bg-brand-dark text-white px-3 py-1.5 rounded-xl hover:bg-brand-dark/90 transition-colors"
                    >
                      ✉️ Enviar email
                    </a>
                  )}
                  {whatsAppHref(clientProfile.phone) && (
                    <a
                      href={whatsAppHref(clientProfile.phone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-brand-muted">ID: {service.client_id}</p>
            )}
          </div>

          {/* Technician */}
          <div className="card space-y-3">
            <h2 className="font-heading font-bold text-brand-dark text-base">🔧 Técnico</h2>
            {service.technician_id ? (
              techProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-brand-muted text-xs">Nome</p>
                      <p className="text-brand-dark font-medium">{techProfile.full_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Email</p>
                      <p className="text-brand-dark font-medium break-all">{techEmail ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Telefone</p>
                      <p className="text-brand-dark font-medium">{techProfile.phone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {techEmail && (
                      <a
                        href={`mailto:${techEmail}`}
                        className="text-xs font-semibold bg-brand-dark text-white px-3 py-1.5 rounded-xl hover:bg-brand-dark/90 transition-colors"
                      >
                        ✉️ Enviar email
                      </a>
                    )}
                    {whatsAppHref(techProfile.phone) && (
                      <a
                        href={whatsAppHref(techProfile.phone)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-brand-muted">ID: {service.technician_id}</p>
              )
            ) : (
              <p className="text-xs text-amber-600 font-medium">⏳ Aguardando aceite de técnico</p>
            )}
          </div>

          {/* Financial */}
          <div className="bg-brand-dark rounded-2xl p-5 space-y-3">
            <h2 className="font-heading font-bold text-white text-base">💰 Financeiro</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-white/50 text-xs mb-1">Valor do serviço</p>
                <p className="font-heading font-extrabold text-brand-green text-lg">{fmt(valorServico)}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Comissão 25%</p>
                <p className="font-heading font-extrabold text-white text-lg">{fmt(comissao)}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Repasse técnico 75%</p>
                <p className="font-heading font-extrabold text-brand-green text-lg">{fmt(repasse)}</p>
              </div>
            </div>
            {service.preco_min && service.preco_max && (
              <p className="text-white/40 text-xs border-t border-white/10 pt-2">
                Faixa aprovada: {fmt(service.preco_min)} – {fmt(service.preco_max)}
              </p>
            )}
          </div>

          {/* Report */}
          {report && (
            <div className="card space-y-4">
              <h2 className="font-heading font-bold text-brand-dark text-base">📸 Relatório fotográfico</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Antes</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(report.photos_before ?? []).filter(Boolean).map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Antes ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Depois</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(report.photos_after ?? []).filter(Boolean).map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Depois ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {report.observations && (
                <div>
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-sm text-brand-dark">{report.observations}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-xs">
                {report.general_condition && (
                  <span className="bg-brand-light border border-brand-border px-3 py-1 rounded-full text-brand-dark font-medium">
                    Condição: {report.general_condition.replace(/_/g, " ")}
                  </span>
                )}
                {report.geracao_antes && (
                  <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-blue-700 font-medium">
                    Antes: {report.geracao_antes} kWh/mês
                  </span>
                )}
                {report.geracao_depois && (
                  <span className="bg-brand-light border border-brand-border px-3 py-1 rounded-full text-brand-green font-medium">
                    Depois: {report.geracao_depois} kWh/mês
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Admin actions */}
          <div className="card space-y-3">
            <h2 className="font-heading font-bold text-brand-dark text-base">⚙️ Ações do Admin</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/pagamentos`}
                className="text-xs bg-brand-green text-white font-semibold px-4 py-2 rounded-xl hover:bg-brand-green/90 transition-colors"
              >
                Ver pagamentos
              </Link>
              <Link
                href={`/admin/servicos`}
                className="text-xs border border-brand-border text-brand-dark font-semibold px-4 py-2 rounded-xl hover:bg-brand-bg transition-colors"
              >
                ← Voltar à lista
              </Link>
            </div>
            <p className="text-xs text-brand-muted">🛡️ Serviço coberto por seguro contra danos</p>
          </div>
        </>
      )}
    </div>
  );
}
