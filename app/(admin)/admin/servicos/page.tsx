export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import ServicosView, { type Servico, type Tecnico } from "./ServicosView";

export const metadata: Metadata = { title: "Serviços — Admin | Painel Clean" };

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function ServicosPage() {
  const admin = createServiceClient();

  const [servicosRes, tecnicosRes] = await Promise.all([
    admin
      .from("service_requests")
      .select("id, status, city, module_count, price_estimate, preferred_date, created_at, client_id, technician_id")
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("profiles")
      .select("user_id, full_name, city")
      .eq("role", "tecnico")
      .order("full_name", { ascending: true }),
  ]);

  const raw = servicosRes.data ?? [];
  const tecnicosRaw = (tecnicosRes.data ?? []) as Tecnico[];

  // Batch-fetch profile + auth.users data for both clients and technicians
  const clientIds = Array.from(new Set(raw.map((s: any) => s.client_id).filter(Boolean))) as string[];
  const techIds   = Array.from(new Set(raw.map((s: any) => s.technician_id).filter(Boolean))) as string[];
  const allIds    = Array.from(new Set([...clientIds, ...techIds]));

  const nameMap:  Record<string, string> = {};
  const phoneMap: Record<string, string> = {};
  const emailMap: Record<string, string> = {};

  if (allIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", allIds);
    (profiles ?? []).forEach((p: any) => {
      nameMap[p.user_id]  = p.full_name ?? "—";
      if (p.phone) phoneMap[p.user_id] = p.phone;
    });

    // auth.users.email — só acessível via service role.
    // listUsers tem cap de 1000/page; para escala maior, paginar.
    try {
      const { data: { users } } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      users.forEach((u) => {
        if (u.email && allIds.includes(u.id)) emailMap[u.id] = u.email;
      });
    } catch (err) {
      console.warn("[admin/servicos] listUsers falhou:", err);
    }
  }

  const servicos: Servico[] = raw.map((s: any) => ({
    id:              s.id,
    data:            fmtDate(s.preferred_date ?? s.created_at),
    cidade:          s.city ?? "—",
    clienteNome:     nameMap[s.client_id] ?? s.client_id?.slice(0, 8) ?? "—",
    clienteEmail:    emailMap[s.client_id] ?? null,
    clienteTelefone: phoneMap[s.client_id] ?? null,
    tecnicoNome:     s.technician_id ? (nameMap[s.technician_id] ?? s.technician_id.slice(0, 8)) : "—",
    modulos:         s.module_count ?? 0,
    valor:           s.status === "completed" ? (s.price_estimate ?? 0) : 0,
    comissao:        s.status === "completed" ? (s.price_estimate ?? 0) * 0.25 : 0,
    status:          s.status ?? "pending",
  }));

  return <ServicosView servicos={servicos} tecnicos={tecnicosRaw} />;
}
