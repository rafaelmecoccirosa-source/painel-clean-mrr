"use client";

import { useRef, useState } from "react";

export interface ReportData {
  serviceId: string;
  clientName: string;
  address: string;
  city: string;
  date: string;
  techName: string;
  moduleCount: number;
  tipoInstalacao?: string;
  nivelSujeira?: string;
  valorServico: number;
  paymentStatus?: string;
  paidAt?: string;
  photosBefore?: string[];
  photosAfter?: string[];
  checklist?: Record<string, boolean>;
  observations?: string;
  generalCondition?: string;
  geracaoAntes?: number | null;
  geracaoDepois?: number | null;
}

const CHECKLIST_LABELS: Record<string, string> = {
  visual_inspection: "Verificação visual das placas",
  connector_check:   "Verificação de conectores",
  cleaning_complete: "Limpeza com escova profissional",
  damage_test:       "Verificação de conexões",
  post_generation:   "Teste de geração pós-limpeza",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  data: ReportData;
  onClose: () => void;
}

export default function ServiceReport({ data, onClose }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const repasse = data.valorServico * 0.75;
  const ganhoKwh = data.geracaoDepois && data.geracaoAntes
    ? data.geracaoDepois - data.geracaoAntes
    : null;
  const ganhoReais = ganhoKwh ? Math.round(ganhoKwh * 0.85) : null;

  async function handleDownloadPDF() {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content is longer than one page, add pages
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 0;
      while (yPos < pdfHeight) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yPos, pdfWidth, pdfHeight);
        yPos += pageHeight;
      }

      const fileName = `painel-clean-relatorio-${data.serviceId.slice(0, 8)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-lg">📄 Relatório do Serviço</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="bg-[#3DC45A] text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-[#3DC45A]/90 transition-colors disabled:opacity-60"
            >
              {generating ? "Gerando PDF…" : "⬇️ Baixar PDF"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Report content (this is what gets converted to PDF) */}
        <div className="overflow-y-auto max-h-[80vh]">
          <div ref={reportRef} className="bg-white p-8 font-sans" style={{ fontFamily: "Arial, sans-serif" }}>

            {/* Logo + Header */}
            <div style={{ background: "#1B3A2D", padding: "24px", borderRadius: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#3DC45A", fontWeight: "900", fontSize: "22px", margin: 0 }}>CleanPass</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: "2px 0 0" }}>painelclean.com.br</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "white", fontWeight: "700", fontSize: "16px", margin: 0 }}>RELATÓRIO DE SERVIÇO</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", margin: "2px 0 0" }}>
                    Nº #PC-{data.serviceId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados do Serviço */}
            <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
              <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "13px", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                DADOS DO SERVIÇO
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Cliente", value: data.clientName },
                  { label: "Técnico", value: data.techName },
                  { label: "Data", value: fmtDate(data.date) },
                  { label: "Cidade", value: data.city },
                  { label: "Nº de placas", value: String(data.moduleCount) },
                  { label: "Tipo", value: data.tipoInstalacao?.replace(/_/g, " ") ?? "—" },
                  { label: "Sujeira", value: data.nivelSujeira ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ color: "#7A9A84", fontSize: "10px", margin: "0 0 2px", fontWeight: "600", textTransform: "uppercase" }}>{label}</p>
                    <p style={{ color: "#1B3A2D", fontSize: "13px", margin: 0, fontWeight: "500" }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <p style={{ color: "#7A9A84", fontSize: "10px", margin: "0 0 2px", fontWeight: "600", textTransform: "uppercase" }}>Endereço</p>
                <p style={{ color: "#1B3A2D", fontSize: "13px", margin: 0 }}>{data.address}</p>
              </div>
            </div>

            {/* Checklist */}
            {data.checklist && (
              <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
                <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "13px", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  CHECKLIST DE INSPEÇÃO
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {Object.entries(data.checklist).map(([key, done]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: done ? "#3DC45A" : "#ccc", fontSize: "14px" }}>{done ? "✅" : "⬜"}</span>
                      <span style={{ fontSize: "12px", color: "#1B3A2D" }}>{CHECKLIST_LABELS[key] ?? key}</span>
                    </div>
                  ))}
                </div>
                {data.generalCondition && (
                  <p style={{ marginTop: "12px", fontSize: "12px", color: "#7A9A84" }}>
                    Condição geral das placas: <strong style={{ color: "#1B3A2D" }}>{data.generalCondition.replace(/_/g, " ")}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Desempenho Energético */}
            {data.geracaoAntes && data.geracaoDepois && (
              <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
                <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "13px", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  DESEMPENHO ENERGÉTICO
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 4px" }}>Antes</p>
                    <p style={{ color: "#1B3A2D", fontSize: "20px", fontWeight: "700", margin: 0 }}>{data.geracaoAntes}</p>
                    <p style={{ color: "#7A9A84", fontSize: "10px", margin: "2px 0 0" }}>kWh/mês</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 4px" }}>Depois</p>
                    <p style={{ color: "#3DC45A", fontSize: "20px", fontWeight: "700", margin: 0 }}>{data.geracaoDepois}</p>
                    <p style={{ color: "#7A9A84", fontSize: "10px", margin: "2px 0 0" }}>kWh/mês</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 4px" }}>Ganho/mês</p>
                    <p style={{ color: "#3DC45A", fontSize: "20px", fontWeight: "700", margin: 0 }}>+{ganhoKwh}</p>
                    <p style={{ color: "#7A9A84", fontSize: "10px", margin: "2px 0 0" }}>kWh/mês</p>
                  </div>
                </div>
                {/* Bar chart */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#7A9A84", width: "50px" }}>Antes</span>
                    <div style={{ flex: 1, background: "#EBF3E8", borderRadius: "4px", height: "12px" }}>
                      <div style={{ width: `${Math.round((data.geracaoAntes / data.geracaoDepois) * 100)}%`, background: "#7A9A84", height: "12px", borderRadius: "4px" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "#1B3A2D", fontWeight: "600", width: "60px" }}>{data.geracaoAntes} kWh</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#7A9A84", width: "50px" }}>Depois</span>
                    <div style={{ flex: 1, background: "#EBF3E8", borderRadius: "4px", height: "12px" }}>
                      <div style={{ width: "100%", background: "#3DC45A", height: "12px", borderRadius: "4px" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "#3DC45A", fontWeight: "700", width: "60px" }}>{data.geracaoDepois} kWh</span>
                  </div>
                </div>
                {ganhoReais && (
                  <p style={{ fontSize: "12px", color: "#3DC45A", fontWeight: "700" }}>
                    💰 Economia estimada: +{fmt(ganhoReais)}/mês · +{fmt(ganhoReais * 12)}/ano
                  </p>
                )}
              </div>
            )}

            {/* Fotos */}
            {((data.photosBefore?.filter(Boolean).length ?? 0) > 0 || (data.photosAfter?.filter(Boolean).length ?? 0) > 0) && (
              <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
                <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "13px", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  FOTOS
                </p>
                {data.photosBefore && data.photosBefore.filter(Boolean).length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ color: "#7A9A84", fontSize: "11px", fontWeight: "600", margin: "0 0 8px" }}>ANTES</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {data.photosBefore.filter(Boolean).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`Antes ${i+1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} crossOrigin="anonymous" />
                      ))}
                    </div>
                  </div>
                )}
                {data.photosAfter && data.photosAfter.filter(Boolean).length > 0 && (
                  <div>
                    <p style={{ color: "#7A9A84", fontSize: "11px", fontWeight: "600", margin: "0 0 8px" }}>DEPOIS</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {data.photosAfter.filter(Boolean).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`Depois ${i+1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} crossOrigin="anonymous" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            {data.observations && (
              <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "12px", margin: "0 0 6px", textTransform: "uppercase" }}>OBSERVAÇÕES</p>
                <p style={{ color: "#1B3A2D", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{data.observations}</p>
              </div>
            )}

            {/* Recibo */}
            <div style={{ border: "1px solid #C8DFC0", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
              <p style={{ color: "#1B3A2D", fontWeight: "700", fontSize: "13px", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                RECIBO
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 2px" }}>Valor do serviço</p>
                  <p style={{ color: "#1B3A2D", fontSize: "18px", fontWeight: "700", margin: 0 }}>{fmt(data.valorServico)}</p>
                </div>
                <div>
                  <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 2px" }}>Status</p>
                  <p style={{ color: data.paymentStatus === "released" || data.paymentStatus === "confirmed" ? "#3DC45A" : "#F59E0B", fontSize: "13px", fontWeight: "600", margin: 0 }}>
                    {data.paymentStatus === "released" ? "✅ Pago e repassado" :
                     data.paymentStatus === "confirmed" ? "✅ Pago via PIX" :
                     data.paymentStatus === "awaiting_confirmation" ? "🔔 Aguardando confirmação" :
                     "⏳ Aguardando pagamento"}
                  </p>
                </div>
                {data.paidAt && (
                  <div>
                    <p style={{ color: "#7A9A84", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 2px" }}>Data do pagamento</p>
                    <p style={{ color: "#1B3A2D", fontSize: "13px", margin: 0 }}>{fmtDate(data.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: "#1B3A2D", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", margin: "0 0 4px" }}>
                🛡️ Serviço coberto por seguro contra danos acidentais
              </p>
              <p style={{ color: "#3DC45A", fontWeight: "700", fontSize: "13px", margin: "0 0 2px" }}>CleanPass</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", margin: 0 }}>painelclean.com.br · Obrigado pela confiança!</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
