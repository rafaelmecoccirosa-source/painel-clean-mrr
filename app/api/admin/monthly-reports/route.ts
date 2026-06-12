import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const TARIFF = 0.92; // R$/kWh — média SC (mesma da calculadora da landing)

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

type Body = {
  subscription_id?: string;
  period_month?: number;
  period_year?: number;
  kwh_generated?: number;
  kwh_expected?: number;
  alert_message?: string;
};

/** Admin preenche o relatório mensal de performance (MVP manual). */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const admin = createServiceClient();
  const { data: me } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { subscription_id, period_month, period_year, kwh_generated, kwh_expected } = body;

  if (!subscription_id) {
    return NextResponse.json({ error: "subscription_id é obrigatório" }, { status: 400 });
  }
  if (!period_month || period_month < 1 || period_month > 12 || !period_year) {
    return NextResponse.json({ error: "Período inválido" }, { status: 400 });
  }
  if (typeof kwh_generated !== "number" || kwh_generated < 0 ||
      typeof kwh_expected !== "number" || kwh_expected <= 0) {
    return NextResponse.json({ error: "kWh gerado/esperado inválidos" }, { status: 400 });
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, client_id")
    .eq("id", subscription_id)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
  }

  // Não duplicar relatório do mesmo período
  const { data: existing } = await admin
    .from("monthly_reports")
    .select("id")
    .eq("subscription_id", subscription_id)
    .eq("period_month", period_month)
    .eq("period_year", period_year)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: `Já existe relatório de ${MONTHS[period_month - 1]}/${period_year} para essa assinatura.` },
      { status: 409 },
    );
  }

  const efficiencyPct = Math.round((kwh_generated / kwh_expected) * 10000) / 100;
  const savings = Math.round(kwh_generated * TARIFF * 100) / 100;
  const alertMessage = body.alert_message?.trim() || null;

  const { data: inserted, error: insErr } = await admin
    .from("monthly_reports")
    .insert({
      subscription_id,
      client_id:         sub.client_id,
      period_month,
      period_year,
      kwh_generated,
      kwh_expected,
      efficiency_pct:    efficiencyPct,
      savings_estimated: savings,
      alert_message:     alertMessage,
      sent_at:           new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    return NextResponse.json({ error: insErr?.message ?? "Falha ao criar relatório" }, { status: 500 });
  }

  await admin.from("notifications").insert({
    user_id: sub.client_id,
    title:   `📊 Seu relatório de ${MONTHS[period_month - 1]} chegou`,
    body:    `Sua usina gerou ${Math.round(kwh_generated)} kWh (${efficiencyPct.toFixed(0)}% do esperado). Veja os detalhes na aba Relatórios.`,
    type:    "report_ready",
  });

  return NextResponse.json({ ok: true, id: inserted.id, efficiency_pct: efficiencyPct });
}
