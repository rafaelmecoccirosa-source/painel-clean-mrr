import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REF_COOKIE = "pc_ref";
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

/**
 * Link de indicação: /ref/CODIGO
 * Grava o código num cookie de 30 dias e manda o visitante para o cadastro.
 * O vínculo é efetivado em /api/cliente/pos-assinatura quando o indicado assina.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = (params.code ?? "").trim().toUpperCase();

  const url = req.nextUrl.clone();
  url.pathname = "/cadastro";
  url.search = "?role=cliente";

  const res = NextResponse.redirect(url);
  if (/^[A-Z0-9-]{4,16}$/.test(code)) {
    res.cookies.set(REF_COOKIE, code, {
      maxAge: THIRTY_DAYS_S,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
