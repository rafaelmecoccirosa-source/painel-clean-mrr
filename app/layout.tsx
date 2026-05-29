import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

export const metadata: Metadata = {
  title: {
    default: "CleanPass — Limpeza de Placas Solares",
    template: "%s | CleanPass",
  },
  description:
    "Marketplace especializado em limpeza profissional de placas solares. Conectamos clientes a técnicos certificados para maximizar a eficiência do seu sistema fotovoltaico.",
  keywords: [
    "limpeza de placas solares",
    "manutenção fotovoltaica",
    "energia solar",
    "técnico solar",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
