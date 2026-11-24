import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: "Painel | Nayara Leal",
  description: null,
  openGraph: null,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="frame panel">
      <header className="panel-bar">
        <Link className="brand" href="/admin"><span>Nayara Leal</span><small>Painel de projetos</small></Link>
        <Link href="/portfolio" prefetch={false}>Portfólio público</Link>
      </header>
      {children}
    </main>
  );
}
