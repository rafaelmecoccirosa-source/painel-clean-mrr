import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_REDIRECT: Record<string, string> = {
  cliente: "/cliente",
  tecnico: "/tecnico",
  admin:   "/admin",
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  // Exchange OAuth code for session (needs anon client with cookie handling)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Use service client to read profile — bypasses RLS so it always works
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  let role = profile?.role ?? null;

  // Fallback: take role from user_metadata when the profile row hasn't been
  // created yet (fresh signup) or is missing its role column. Backfill the
  // profile so subsequent redirects don't loop.
  if (!role) {
    const metaRole = (data.user.user_metadata?.role as string | undefined) ?? null;
    if (metaRole) {
      const fullName =
        (data.user.user_metadata?.full_name as string | undefined) ??
        data.user.email?.split("@")[0] ??
        null;
      await serviceClient.from("profiles").upsert(
        {
          user_id:   data.user.id,
          role:      metaRole,
          full_name: fullName,
        },
        { onConflict: "user_id" },
      );
      role = metaRole;
    }
  }

  if (!role) {
    // Truly new user with no role anywhere — needs to complete registration
    return NextResponse.redirect(`${origin}/completar-cadastro`);
  }

  const destination = ROLE_REDIRECT[role] ?? "/cliente";
  return NextResponse.redirect(`${origin}${destination}`);
}
