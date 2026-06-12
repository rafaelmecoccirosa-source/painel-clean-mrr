import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { mensalidadeComDesconto, descontoIndicacaoPct } from "@/lib/pricing";
import { INVOICE_DUE_DAYS } from "@/lib/config";

export const dynamic = "force-dynamic";

type SubRow = {
  id: string;
  client_id: string;
  price_monthly: number;
  discount_pct: number | null;
  next_billing_at: string | null;
};

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Cron diário de cobrança (PIX manual no MVP):
 *
 * 1. Expira referrals vencidos e recalcula o desconto dos indicadores afetados
 * 2. Para cada assinatura ativa com next_billing_at vencido:
 *    - gera a fatura da mensalidade (com desconto de indicações aplicado)
 *    - avança next_billing_at em 1 mês
 *    - notifica o cliente
 *
 * Autenticado via `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const errors: string[] = [];

  // ── 1. Expirar referrals vencidos e recalcular descontos ───────────────────
  const { data: expiredRefs } = await admin
    .from("referrals")
    .select("id, referrer_id")
    .eq("status", "active")
    .lt("expires_at", nowIso);

  let referralsExpired = 0;
  if (expiredRefs && expiredRefs.length > 0) {
    const ids = expiredRefs.map((r) => r.id);
    const { error: expErr } = await admin
      .from("referrals")
      .update({ status: "expired" })
      .in("id", ids);

    if (expErr) {
      errors.push(`expire referrals: ${expErr.message}`);
    } else {
      referralsExpired = ids.length;
      const referrerIds = Array.from(new Set(expiredRefs.map((r) => r.referrer_id)));
      for (const referrerId of referrerIds) {
        const { count } = await admin
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", referrerId)
          .eq("status", "active");
        await admin
          .from("subscriptions")
          .update({ discount_pct: descontoIndicacaoPct(count ?? 0) })
          .eq("client_id", referrerId)
          .eq("status", "active");
      }
    }
  }

  // ── 2. Gerar faturas de mensalidade vencidas ───────────────────────────────
  const { data: subs, error: subsErr } = await admin
    .from("subscriptions")
    .select("id, client_id, price_monthly, discount_pct, next_billing_at")
    .eq("status", "active")
    .not("next_billing_at", "is", null)
    .lte("next_billing_at", nowIso);

  if (subsErr) {
    return NextResponse.json({ error: subsErr.message }, { status: 500 });
  }

  let invoicesCreated = 0;
  let skipped = 0;

  for (const sub of (subs ?? []) as SubRow[]) {
    const billingDate = new Date(sub.next_billing_at ?? nowIso);
    const periodMonth = billingDate.getMonth() + 1;
    const periodYear  = billingDate.getFullYear();

    // Idempotência: não duplicar fatura do mesmo período
    const { data: existing } = await admin
      .from("invoices")
      .select("id")
      .eq("subscription_id", sub.id)
      .eq("type", "mensalidade")
      .eq("period_month", periodMonth)
      .eq("period_year", periodYear)
      .maybeSingle();

    if (existing) {
      skipped++;
    } else {
      const amount = mensalidadeComDesconto(sub.price_monthly, sub.discount_pct ?? 0);
      const { error: invErr } = await admin.from("invoices").insert({
        subscription_id: sub.id,
        client_id:       sub.client_id,
        type:            "mensalidade",
        amount,
        period_month:    periodMonth,
        period_year:     periodYear,
        due_date:        addDays(now, INVOICE_DUE_DAYS).toISOString().slice(0, 10),
        notes: (sub.discount_pct ?? 0) > 0
          ? `Mensalidade com ${Number(sub.discount_pct).toFixed(0)}% de desconto (indicações).`
          : null,
      });

      if (invErr) {
        errors.push(`subscription ${sub.id}: ${invErr.message}`);
        continue;
      }

      invoicesCreated++;
      await admin.from("notifications").insert({
        user_id: sub.client_id,
        title:   "💳 Sua mensalidade chegou",
        body:    `R$ ${amount.toFixed(2).replace(".", ",")} — vence em ${INVOICE_DUE_DAYS} dias. Pague via PIX (chave enviada por WhatsApp/email).`,
        type:    "billing",
      });
    }

    // Avança o próximo ciclo mesmo se a fatura já existia (evita loop diário)
    const next = new Date(billingDate);
    next.setMonth(next.getMonth() + 1);
    const { error: updErr } = await admin
      .from("subscriptions")
      .update({ next_billing_at: next.toISOString() })
      .eq("id", sub.id);
    if (updErr) errors.push(`subscription ${sub.id} advance: ${updErr.message}`);
  }

  return NextResponse.json({
    scanned: subs?.length ?? 0,
    invoicesCreated,
    skipped,
    referralsExpired,
    errors: errors.length ? errors : undefined,
  });
}
