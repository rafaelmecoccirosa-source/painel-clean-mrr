import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Sem isto o Next 14 pre-renderiza o GET no build e serve a resposta antiga
// para sempre: o health reportava ok sem consultar o banco.
export const dynamic = "force-dynamic";

// Expõe só o código do erro (PGRST205, 42P01, "network"...), nunca a mensagem,
// para o alerta do Keep Alive apontar a causa sem vazar detalhes do banco.
function fail(reason: string, http?: number) {
  return NextResponse.json(
    { status: "error", db: false, reason, ...(http ? { http } : {}) },
    { status: 503 }
  );
}

export async function GET() {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return fail("config");
  }

  try {
    const { error, status } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error) {
      return fail(error.code || (status === 0 ? "network" : "unknown"), status || undefined);
    }

    return NextResponse.json(
      { status: "ok", db: true, ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch {
    return fail("network");
  }
}
