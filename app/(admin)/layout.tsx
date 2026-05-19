import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import HeaderAdmin from "@/components/layout/HeaderAdmin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Painel Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the authenticated user (session client, safe)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Fetch profile via service role (bypasses RLS — admin needs full read)
  let userName = user.email?.split("@")[0] ?? "Administrador";
  let userRole: string | null = null;

  try {
    const admin = createServiceClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      userRole = profile.role ?? null;
      userName = profile.full_name ?? userName;
    }
  } catch { /* service client unavailable — proceed to JWT fallback */ }

  if (!userRole) {
    const metaRole = (user.user_metadata?.role as string | undefined) ?? null;
    userRole = metaRole;
  }

  // 3. Role guard OUTSIDE try/catch so redirect() exception is not swallowed
  if (userRole === "cliente") redirect("/cliente/home");
  if (userRole === "tecnico") redirect("/tecnico");
  if (!userRole)              redirect("/login");

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <HeaderAdmin userName={userName} />
      <main className="flex-1">{children}</main>
      <footer className="bg-brand-dark text-white/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-center space-y-1">
          <p>© {new Date().getFullYear()} CleanPass — Painel Administrativo.</p>
          <p>
            <Link href="/termos" className="text-white/40 hover:text-white/70 underline transition-colors">
              Termos de Uso
            </Link>
            {" · "}
            <span>Jaraguá do Sul, SC</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
