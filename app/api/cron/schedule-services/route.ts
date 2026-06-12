import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS  = 7  * 24 * 60 * 60 * 1000;

type SubscriptionRow = {
  id: string;
  client_id: string;
  modules_count: number | null;
  next_service_at: string | null;
};

type ProfileRow = {
  user_id: string;
  city: string | null;
};

type ExistingRequestRow = {
  client_id: string;
};

/**
 * Daily cron: scans active subscriptions and auto-creates a pending
 * service_request for any whose next_service_at is within the next 7 days
 * and which doesn't already have a recent subscription-origin request.
 *
 * Authenticated via `Authorization: Bearer <CRON_SECRET>` (Vercel sets this
 * automatically when the cron runs against /api/cron/*).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + SEVEN_DAYS_MS).toISOString();

  const { data: subs, error: subsErr } = await admin
    .from("subscriptions")
    .select("id, client_id, modules_count, next_service_at")
    .eq("status", "active")
    .not("next_service_at", "is", null)
    .lte("next_service_at", horizon);

  if (subsErr) {
    return NextResponse.json({ error: subsErr.message }, { status: 500 });
  }
  const subscriptions = (subs ?? []) as SubscriptionRow[];
  if (subscriptions.length === 0) {
    return NextResponse.json({ scanned: 0, created: 0, skipped: 0 });
  }

  const clientIds = Array.from(new Set(subscriptions.map((s) => s.client_id)));

  // Fetch client cities in one round-trip
  const { data: profileRows } = await admin
    .from("profiles")
    .select("user_id, city")
    .in("user_id", clientIds);
  const cityByClient = new Map<string, string | null>();
  for (const p of (profileRows ?? []) as ProfileRow[]) {
    cityByClient.set(p.user_id, p.city);
  }

  // Find clients who already have a recent subscription-origin request still
  // open (pending / accepted / in_progress) — we'll skip those.
  const { data: existing } = await admin
    .from("service_requests")
    .select("client_id")
    .eq("origin", "subscription")
    .in("client_id", clientIds)
    .in("status", ["pending", "accepted", "in_progress"]);
  const blockedClients = new Set(
    ((existing ?? []) as ExistingRequestRow[]).map((r) => r.client_id),
  );

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const sub of subscriptions) {
    if (blockedClients.has(sub.client_id)) {
      skipped++;
      continue;
    }

    const city = cityByClient.get(sub.client_id);
    if (!city) {
      skipped++;
      errors.push(`subscription ${sub.id}: client without city`);
      continue;
    }

    const preferredDate = (sub.next_service_at ?? now.toISOString()).slice(0, 10);

    const { error: insErr } = await admin.from("service_requests").insert({
      client_id:       sub.client_id,
      subscription_id: sub.id,
      status:          "pending",
      origin:          "subscription",
      city,
      address:         "A confirmar com o cliente",
      module_count:    sub.modules_count ?? 0,
      preferred_date:  preferredDate,
      preferred_time:  "manha",
      price_estimate:  0,
      notes:           "Limpeza incluída na assinatura — agendamento automático.",
    });

    if (insErr) {
      errors.push(`subscription ${sub.id}: ${insErr.message}`);
      continue;
    }

    // Push next_service_at by 6 months so we don't reschedule on tomorrow's run
    const next = new Date(sub.next_service_at ?? now.toISOString());
    next.setMonth(next.getMonth() + 6);
    const { error: updErr } = await admin
      .from("subscriptions")
      .update({ next_service_at: next.toISOString() })
      .eq("id", sub.id);
    if (updErr) {
      errors.push(`subscription ${sub.id} update: ${updErr.message}`);
    }

    blockedClients.add(sub.client_id);
    created++;
  }

  return NextResponse.json({
    scanned: subscriptions.length,
    created,
    skipped,
    errors: errors.length ? errors : undefined,
  });
}
