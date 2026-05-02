import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * Fetches a single service_request (with its report and review) for the
 * técnico detail page. Bypasses RLS via service role so the técnico can
 * always inspect any chamado — the policy on service_requests recurses
 * through profiles when called from the client and silently returns
 * "não encontrado" when the chamado has been accepted by another técnico.
 *
 * The route surfaces a `takenByOther` flag so the UI can show the right
 * message instead of a generic 404.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const admin = createServiceClient();

  const [serviceRes, reportRes, reviewRes] = await Promise.all([
    admin.from("service_requests").select("*").eq("id", id).maybeSingle(),
    admin.from("service_reports").select("*").eq("service_request_id", id).maybeSingle(),
    admin.from("reviews").select("*").eq("service_request_id", id).maybeSingle(),
  ]);

  if (serviceRes.error) {
    return NextResponse.json({ error: serviceRes.error.message }, { status: 500 });
  }
  if (!serviceRes.data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const service = serviceRes.data as { technician_id: string | null };
  const takenByOther =
    service.technician_id != null && service.technician_id !== user.id;

  return NextResponse.json({
    service: serviceRes.data,
    report:  reportRes.data ?? null,
    review:  reviewRes.data ?? null,
    userId:  user.id,
    takenByOther,
  });
}
