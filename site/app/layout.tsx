import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const description = "Nayara Leal Arquitetura e Interiores. Consultoria, projeto, marcenaria e detalhamento para criar espaços com a identidade de quem vive neles.";

export const metadata: Metadata = {
  title: "Nayara Leal | Arquitetura e Interiores",
  description,
  openGraph: {
    title: "Nayara Leal | Arquitetura e Interiores",
    description,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}