import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calcularEntrada, descontoIndicacaoPct } from "@/lib/pricing";
import { REFERRAL_VALIDITY_MONTHS, INVOICE_DUE_DAYS } from "@/lib/config";

export const dynamic = "force-dynamic";

const REF_COOKIE = "pc_ref";

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonths(d: Date, months: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

/**
 * Chamada uma única vez logo após a criação da assinatura (cadastro ou
 * completar-cadastro). Idempotente. Faz duas coisas:
 *
 * 1. Gera a fatura da taxa de adesão (50% do preço avulso — inclui a 1ª limpeza)
 * 2. Se o usuário chegou por link /ref/CODIGO (cookie), vincula a indicação,
 *    ativa o referral e recalcula o desconto na mensalidade de quem indicou
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const admin = createServiceClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, modules_count, price_monthly")
    .eq("client_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa" }, { status: 400 });
  }

  const now = new Date();

  // ── 1. Fatura de adesão (idempotente) ──────────────────────────────────────
  let adhesion: { amount: number } | null = null;
  const { data: existingAdhesion } = await admin
    .from("invoices")
    .select("id")
    .eq("subscription_id", sub.id)
    .eq("type", "adesao")
    .maybeSingle();

  if (!existingAdhesion) {
    let amount = 0;
    try {
      amount = calcularEntrada(sub.modules_count ?? 0);
    } catch {
      amount = 0; // 100+ módulos: sob consulta — admin define manualmente
    }
    if (amount > 0) {
      const { error: invErr } = await admin.from("invoices").insert({
        subscription_id: sub.id,
        client_id:       user.id,
        type:            "adesao",
        amount,
        due_date:        addDays(now, INVOICE_DUE_DAYS).toISOString().slice(0, 10),
        notes:           "Taxa de adesão — 50% do preço avulso, inclui a 1ª limpeza.",
      });
      if (!invErr) {
        adhesion = { amount };
        await admin.from("notifications").insert({
          user_id: user.id,
          title:   "💳 Taxa de adesão gerada",
          body:    `R$ ${amount.toFixed(2).replace(".", ",")} — 50% de uma limpeza avulsa, já inclui sua 1ª limpeza. Você receberá a chave PIX por WhatsApp/email.`,
          type:    "billing",
        });
      }
    }
  }

  // ── 2. Vincular indicação via cookie /ref/CODIGO ───────────────────────────
  let referralClaimed = false;
  const refCode = req.cookies.get(REF_COOKIE)?.value?.trim().toUpperCase();

  if (refCode && /^[A-Z0-9-]{4,16}$/.test(refCode)) {
    const { data: referrer } = await admin
      .from("profiles")
      .select("user_id, full_name")
      .eq("referral_code", refCode)
      .maybeSingle();

    if (referrer?.user_id && referrer.user_id !== user.id) {
      const { data: existingRef } = await admin
        .from("referrals")
        .select("id")
        .eq("referred_id", user.id)
        .maybeSingle();

      if (!existingRef) {
        const { error: refErr } = await admin.from("referrals").insert({
          referrer_id:  referrer.user_id,
          referred_id:  user.id,
          status:       "active",
          discount_pct: 6.0,
          expires_at:   addMonths(now, REFERRAL_VALIDITY_MONTHS).toISOString(),
        });

        if (!refErr) {
          referralClaimed = true;

          // Recalcula o desconto acumulado de quem indicou
          const { count } = await admin
            .from("referrals")
            .select("id", { count: "exact", head: true })
            .eq("referrer_id", referrer.user_id)
            .eq("status", "active");

          const pct = descontoIndicacaoPct(count ?? 0);
          await admin
            .from("subscriptions")
            .update({ discount_pct: pct })
            .eq("client_id", referrer.user_id)
            .eq("status", "active");

          await admin.from("notifications").insert({
            user_id: referrer.user_id,
            title:   "🎉 Sua indicação assinou!",
            body:    `Você ganhou +6% de desconto na mensalidade. Desconto atual: ${pct.toFixed(0)}%.`,
            type:    "billing",
          });
        }
      }
    }
  }

  const res = NextResponse.json({ ok: true, adhesion, referralClaimed });
  if (refCode) {
    res.cookies.set(REF_COOKIE, "", { maxAge: 0, path: "/" });
  }
  return res;
}
