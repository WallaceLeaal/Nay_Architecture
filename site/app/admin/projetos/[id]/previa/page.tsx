import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { readId } from "../../../../../lib/project-input";
import { findAdminProject, getProjectImages } from "../../../../../lib/project-store";
import ProjectView from "../../../../portfolio/project-view";

export default async function PreviewPage({ params }: PageProps<"/admin/projetos/[id]/previa">) {
  await requireAdmin();
  const id = readId((await params).id);
  if (!id) notFound();
  const project = await findAdminProject(id);
  if (!project) notFound();
  const images = await getProjectImages(id, false);
  return (
    <>
      <div className="panel-bar">
        <p>Prévia privada · {project.status === "publicado" ? "Publicado" : "Rascunho"}</p>
        <Link href={`/admin/projetos/${id}`} prefetch={false}>Voltar à edição</Link>
      </div>
      <ProjectView project={project} images={images} privatePreview />
    </>
  );
}
