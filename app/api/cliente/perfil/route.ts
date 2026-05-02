import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Body = {
  full_name?: string | null;
  phone?:     string | null;
  city?:      string | null;
};

/**
 * Updates the authenticated user's profile (full_name, phone, city).
 * Uses service role to bypass any RLS edge case so the write reliably
 * persists. The client-side update path was failing intermittently in
 * production — funneling through this route keeps behavior consistent.
 */
export async function PATCH(req: NextRequest) {
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

  const update: Record<string, string | null> = {};
  if (body.full_name !== undefined) update.full_name = body.full_name?.trim() || null;
  if (body.phone     !== undefined) update.phone     = body.phone?.trim() || null;
  if (body.city      !== undefined) update.city      = body.city?.trim() || null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from("profiles")
    .update(update)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...update });
}
