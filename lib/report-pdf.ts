// Geração client-side do PDF do relatório mensal (MVP — sem servidor de email).
// O cliente baixa na aba Relatórios; o admin pode baixar e enviar por WhatsApp/email.

export type RelatorioPdfData = {
  mes: string;            // "Maio 2026"
  clienteNome?: string;
  kwh: number;            // gerado
  kwhEsperado: number | null;
  eficiencia: number;     // %
  economia: number | null; // R$
  alerta: string | null;
};

const DARK = "#1B3A2D";
const GREEN = "#3DC45A";
const LIGHT = "#EBF3E8";
const MUTED = "#7A9A84";

function hex(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export async function gerarRelatorioMensalPdf(d: RelatorioPdfData) {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 18; // margem

  // ── Header dark green ────────────────────────────────────────────────────
  doc.setFillColor(...hex(DARK));
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Painel Clean", M, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 223, 192);
  doc.text("Limpeza e Cuidado para Usinas Solares", M, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Relatório mensal — ${d.mes}`, M, 35);

  let y = 56;

  if (d.clienteNome) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...hex(MUTED));
    doc.text(`Cliente: ${d.clienteNome}`, M, y);
    y += 10;
  }

  // ── Destaque: geração do mês ─────────────────────────────────────────────
  doc.setFillColor(...hex(LIGHT));
  doc.roundedRect(M, y, W - 2 * M, 30, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...hex(DARK));
  doc.text(`${Math.round(d.kwh).toLocaleString("pt-BR")} kWh`, M + 8, y + 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hex(MUTED));
  doc.text("gerados pela sua usina neste mês", M + 8, y + 22);
  y += 40;

  // ── Eficiência com barra ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...hex(DARK));
  doc.text(`Eficiência: ${Math.round(d.eficiencia)}%`, M, y);
  if (d.kwhEsperado) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...hex(MUTED));
    doc.text(
      `esperado: ${Math.round(d.kwhEsperado).toLocaleString("pt-BR")} kWh`,
      W - M, y, { align: "right" },
    );
  }
  y += 4;
  const barW = W - 2 * M;
  doc.setFillColor(...hex("#C8DFC0"));
  doc.roundedRect(M, y, barW, 5, 2, 2, "F");
  const pct = Math.max(0, Math.min(100, d.eficiencia)) / 100;
  if (pct > 0.03) {
    doc.setFillColor(...hex(d.eficiencia >= 85 ? GREEN : "#D97706"));
    doc.roundedRect(M, y, barW * pct, 5, 2, 2, "F");
  }
  y += 16;

  // ── Economia estimada ────────────────────────────────────────────────────
  if (d.economia !== null && d.economia > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...hex(DARK));
    doc.text("Economia estimada no mês", M, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...hex(GREEN));
    doc.text(brl(d.economia), W - M, y, { align: "right" });
    y += 14;
  }

  // ── Alerta ───────────────────────────────────────────────────────────────
  if (d.alerta) {
    doc.setFillColor(...hex("#FFFBEB"));
    doc.setDrawColor(...hex("#FDE68A"));
    const alertLines = doc.splitTextToSize(d.alerta, W - 2 * M - 16) as string[];
    const boxH = 14 + alertLines.length * 5;
    doc.roundedRect(M, y, W - 2 * M, boxH, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...hex("#92400E"));
    doc.text("Atenção", M + 8, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(alertLines, M + 8, y + 14);
    y += boxH + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...hex(MUTED));
    const msg = d.eficiencia >= 85
      ? "Sua usina está saudável. Continue acompanhando os relatórios mensais."
      : "Eficiência abaixo do ideal — pode ser hora de antecipar a próxima limpeza.";
    doc.text(msg, M, y);
    y += 10;
  }

  // ── Rodapé ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...hex("#C8DFC0"));
  doc.line(M, 272, W - M, 272);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex(MUTED));
  doc.text("Painel Clean · painel-clean-mrr.vercel.app · Painéis sujos perdem até 30% de eficiência", M, 280);

  doc.save(`relatorio-painel-clean-${d.mes.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
