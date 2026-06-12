import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calcularLimpezaExtra } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Body = {
  preferred_date?: string;
  preferred_time?: "manha" | "tarde";
  notes?: string;
};

export async function POST(req: NextRequest) {
  // 1. Authenticate via session client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { preferred_date, preferred_time, notes } = body;
  if (!preferred_date || !preferred_time) {
    return NextResponse.json(
      { error: "Data e turno são obrigatórios" },
      { status: 400 },
    );
  }
  if (preferred_time !== "manha" && preferred_time !== "tarde") {
    return NextResponse.json({ error: "Turno inválido" }, { status: 400 });
  }

  // 2. Fetch profile + active subscription via service role (bypass RLS recursion)
  const admin = createServiceClient();

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("city, cep")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  const { data: sub, error: subErr } = await admin
    .from("subscriptions")
    .select("id, modules_count")
    .eq("client_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  const city = profile?.city?.trim() || "Jaraguá do Sul";
  const modules = sub?.modules_count ?? 0;
  if (modules <= 0) {
    return NextResponse.json(
      { error: "Sem assinatura ativa — não foi possível identificar o número de módulos." },
      { status: 400 },
    );
  }

  const address = profile?.cep
    ? `CEP ${profile.cep}, ${city} (endereço a confirmar com o cliente)`
    : `${city} (endereço a confirmar com o cliente)`;

  // Preço SEMPRE calculado no servidor — nunca confiar no valor vindo do client.
  // Assinante ativo paga limpeza extra com 40% off sobre o avulso.
  let priceEstimate: number;
  try {
    priceEstimate = calcularLimpezaExtra(modules);
  } catch {
    return NextResponse.json(
      { error: "Usinas com mais de 100 módulos: preço sob consulta. Fale com a equipe." },
      { status: 400 },
    );
  }

  // 3. Insert with service role (bypasses the recursive profiles RLS check)
  const { data: inserted, error: insertErr } = await admin
    .from("service_requests")
    .insert({
      client_id:      user.id,
      status:         "pending",
      origin:         "avulso",
      city,
      address,
      module_count:   modules,
      preferred_date,
      preferred_time,
      notes:          notes?.trim() || null,
      price_estimate: priceEstimate,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Falha ao criar solicitação" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: inserted.id,
    protocolo: inserted.id.slice(0, 8).toUpperCase(),
  });
}
