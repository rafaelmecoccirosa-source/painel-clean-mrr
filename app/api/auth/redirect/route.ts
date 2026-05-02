import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ROLE_REDIRECT: Record<string, string> = {
  cliente: "/cliente/home",
  tecnico: "/tecnico",
  admin:   "/admin",
};

/**
 * Server-side role redirect after login.
 * Reads the session via the anon-key server client; if no profile row exists
 * yet (fresh signup), creates a minimal one using user_metadata.role.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  let role: string | null = null;
  let profileExists = false;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile) {
      profileExists = true;
      role = profile.role ?? null;
    }
  } catch {
    /* fall through to JWT fallback */
  }

  if (!profileExists) {
    const metaRole = (user.user_metadata?.role as string | undefined) ?? "cliente";
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      null;

    try {
      const admin = createServiceClient();
      await admin.from("profiles").insert({
        user_id: user.id,
        role: metaRole,
        full_name: fullName,
      });
    } catch {
      /* best-effort — fall through to redirect with metaRole */
    }
    role = metaRole;
  }

  if (!role) {
    const metaRole = (user.user_metadata?.role as string | undefined) ?? undefined;
    role = metaRole ?? "cliente";
  }

  const destination = ROLE_REDIRECT[role] ?? "/cliente/home";
  return NextResponse.redirect(`${origin}${destination}`);
}
