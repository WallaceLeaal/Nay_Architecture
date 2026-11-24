import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="header">
        <Link className="brand" href="/"><span>Nayara Leal</span><small>Arquitetura e Interiores</small></Link>
        <Link href="/#contato">Contato</Link>
      </header>
      <main className="frame portfolio-page" id="conteudo" tabIndex={-1}>{children}</main>
    </>
  );
}
