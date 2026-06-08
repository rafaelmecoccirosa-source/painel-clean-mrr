import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ConclusaoCliente, { type PrevistoData } from "@/components/tecnico/ConclusaoCliente";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRequestDB } from "@/lib/types";

export const metadata: Metadata = { title: "Concluir serviço — Técnico" };

export default async function ConclusaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createServiceClient();
  let service: ServiceRequestDB | null = null;
  let clienteNome = "Cliente";

  try {
    const { data } = await admin
      .from("service_requests")
      .select("*")
      .eq("id", id)
      .eq("technician_id", user.id)
      .single();
    service = data as ServiceRequestDB | null;

    if (service?.client_id) {
      const { data: prof } = await admin
        .from("profiles")
        .select("full_name")
        .eq("user_id", service.client_id)
        .maybeSingle();
      clienteNome = prof?.full_name ?? "Cliente";
    }
  } catch {
    // table may not exist yet
  }

  const modulos      = service?.module_count ?? 24;
  const endereco     = service ? `${service.address} — ${service.city}` : "Endereço não disponível";
  const dataServico  = service?.preferred_date ?? null;
  const valorServico = service?.price_estimate ?? 300;
  const repasse      = modulos * 13;

  const previsto: PrevistoData = {
    valorServico,
    repasse,
    custoCombustivel: 14.4,
    custoPedagio: 0,
    totalCustos: 14.4,
    lucroLiquido: repasse - 14.4,
    margem: ((repasse - 14.4) / valorServico) * 100,
  };

  return (
    <div className="page-container max-w-2xl">
      <Link
        href="/tecnico/chamados"
        className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-dark transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Voltar aos chamados
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Concluir serviço</h1>
        <p className="text-brand-muted text-sm mt-1">{endereco}</p>
      </div>

      <ConclusaoCliente
        servicoId={id}
        modulos={modulos}
        endereco={endereco}
        previsto={previsto}
        clienteNome={clienteNome}
        dataServico={dataServico}
      />
    </div>
  );
}
