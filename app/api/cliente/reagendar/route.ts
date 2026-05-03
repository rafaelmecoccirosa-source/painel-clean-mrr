import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Body = {
  service_request_id?: string | null;
  preferred_date?: string;
  preferred_time?: "manha" | "tarde";
};

/**
 * Reagenda a próxima limpeza do cliente.
 *
 * Se um service_request específico foi informado, atualiza esse registro
 * (mantendo a checagem client_id para evitar que um cliente edite serviço
 * de outro). Caso contrário, empurra o next_service_at da assinatura ativa
 * — útil quando ainda não há service_request criado para o ciclo.
 *
 * Toda a escrita passa pelo service role para evitar a recursão de RLS
 * em profiles que afeta queries client-side. A checagem de propriedade é
 * feita explicitamente no .eq("client_id", user.id).
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

  const { service_request_id, preferred_date, preferred_time } = body;

  if (!preferred_date) {
    return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
  }
  if (preferred_time && preferred_time !== "manha" && preferred_time !== "tarde") {
    return NextResponse.json({ error: "Turno inválido" }, { status: 400 });
  }

  const admin = createServiceClient();

  if (service_request_id) {
    const update: Record<string, string> = {
      preferred_date,
      updated_at:    new Date().toISOString(),
    };
    if (preferred_time) update.preferred_time = preferred_time;

    const { error, data } = await admin
      .from("service_requests")
      .update(update)
      .eq("id", service_request_id)
      .eq("client_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou não pertence a este cliente." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  }

  // Sem service_request: empurra a próxima limpeza programada da assinatura.
  const { error: subErr, data: subData } = await admin
    .from("subscriptions")
    .update({ next_service_at: preferred_date })
    .eq("client_id", user.id)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }
  if (!subData) {
    return NextResponse.json(
      { error: "Nenhuma assinatura ativa encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
