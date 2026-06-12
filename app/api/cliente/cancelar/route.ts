import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calcularSaldoDevedor } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Cancelamento da assinatura.
 *
 * GET  → simulação: retorna meses restantes e saldo devedor sem cancelar
 * POST → efetiva: marca cancelled + cancelled_at, registra cancellation_fee
 *        e gera fatura de saldo devedor se ainda estiver na carência de 12 meses
 */
async function getActiveSubscription(userId: string) {
  const admin = createServiceClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, price_monthly, discount_pct, started_at, contract_months")
    .eq("client_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { admin, sub };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { sub } = await getActiveSubscription(user.id);
  if (!sub) return NextResponse.json({ error: "Nenhuma assinatura ativa" }, { status: 404 });

  const { mesesUsados, mesesRestantes, saldo } = calcularSaldoDevedor(
    new Date(sub.started_at),
    Number(sub.price_monthly),
    Number(sub.discount_pct ?? 0),
    sub.contract_months ?? 12,
  );

  return NextResponse.json({ mesesUsados, mesesRestantes, saldo });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let reason: string | null = null;
  try {
    const body = await req.json();
    reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) || null : null;
  } catch {
    /* corpo opcional */
  }

  const { admin, sub } = await getActiveSubscription(user.id);
  if (!sub) return NextResponse.json({ error: "Nenhuma assinatura ativa" }, { status: 404 });

  const now = new Date();
  const { mesesRestantes, saldo } = calcularSaldoDevedor(
    new Date(sub.started_at),
    Number(sub.price_monthly),
    Number(sub.discount_pct ?? 0),
    sub.contract_months ?? 12,
  );

  const { error: updErr } = await admin
    .from("subscriptions")
    .update({
      status:           "cancelled",
      cancelled_at:     now.toISOString(),
      cancellation_fee: saldo,
    })
    .eq("id", sub.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  if (saldo > 0) {
    await admin.from("invoices").insert({
      subscription_id: sub.id,
      client_id:       user.id,
      type:            "cancelamento",
      amount:          saldo,
      due_date:        addDays(now, 7).toISOString().slice(0, 10),
      notes: `Saldo devedor de cancelamento antes da carência — ${mesesRestantes} ${mesesRestantes === 1 ? "mês restante" : "meses restantes"} do contrato.${reason ? ` Motivo: ${reason}` : ""}`,
    });
  }

  // Notifica cliente e admins
  await admin.from("notifications").insert({
    user_id: user.id,
    title:   "Assinatura cancelada",
    body: saldo > 0
      ? `Cancelamento dentro da carência: saldo devedor de R$ ${saldo.toFixed(2).replace(".", ",")} (${mesesRestantes} meses restantes). Fatura gerada com vencimento em 7 dias.`
      : "Sua assinatura foi cancelada sem multa. Sentiremos sua falta!",
    type: "billing",
  });

  const { data: admins } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", "admin");
  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a) => ({
        user_id: a.user_id,
        title:   "⚠️ Assinatura cancelada",
        body:    `Cliente cancelou a assinatura. Saldo devedor: R$ ${saldo.toFixed(2).replace(".", ",")}.${reason ? ` Motivo: ${reason}` : ""}`,
        type:    "system",
      })),
    );
  }

  return NextResponse.json({ ok: true, saldo, mesesRestantes });
}
