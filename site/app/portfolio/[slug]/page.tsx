import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedProject, getProjectImages } from "../../../lib/project-store";
import ProjectView from "../project-view";

const getPublished = cache(findPublishedProject);

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const project = await getPublished((await params).slug);
  if (!project) notFound();
  return {
    title: `${project.titulo} | Nayara Leal`,
    description: project.descricao.slice(0, 160),
    openGraph: { title: project.titulo, description: project.descricao.slice(0, 160), locale: "pt_BR" },
  };
}

export default async function PublicProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const project = await getPublished((await params).slug);
  if (!project) notFound();
  const images = await getProjectImages(project.id, true);
  return (
    <>
      <Link href="/portfolio" prefetch={false}>Voltar ao portfólio</Link>
      <ProjectView project={project} images={images} />
    </>
  );
}
