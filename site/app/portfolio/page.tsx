import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedProjects } from "../../lib/project-store";

export const metadata: Metadata = {
  title: "Portfólio | Nayara Leal",
  description: "Projetos de arquitetura e interiores de Nayara Leal.",
};

export default async function PortfolioPage() {
  const projects = await listPublishedProjects();
  return (
    <>
      <h1>Portfólio</h1>
      {projects.length ? (
        <div className="project-grid portfolio-grid">
          {projects.map((project) => (
            <Link className="project portfolio-card" href={`/portfolio/${project.slug}`} prefetch={false} key={project.id}>
              {project.capa_id && <Image src={`/projeto-foto/${project.capa_id}`} alt={project.capa_alt ?? ""}
                width={640} height={480} unoptimized />}
              <p className="label">{project.categoria}</p>
              <h2>{project.titulo}</h2>
            </Link>
          ))}
        </div>
      ) : <p className="portfolio-empty">Nenhum projeto publicado no momento.</p>}
    </>
  );
}
