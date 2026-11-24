import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/admin-auth";
import { maxProjectImages } from "../../../../lib/project-files";
import { readId } from "../../../../lib/project-input";
import { findAdminProject, getProjectImages } from "../../../../lib/project-store";
import { saveProject, uploadProjectImage } from "../../actions";
import ActionForm from "../../action-form";
import ProjectFields from "../../project-fields";

export default async function EditProjectPage({ params }: PageProps<"/admin/projetos/[id]">) {
  await requireAdmin();
  const { id: rawId } = await params;
  const id = readId(rawId);
  if (!id) notFound();
  const project = await findAdminProject(id);
  if (!project) notFound();
  const images = await getProjectImages(id, false);
  const cover = images.find((image) => image.tipo === "capa");

  return (
    <>
      <div className="panel-bar">
        <h1>Editar projeto</h1>
        <Link href={`/admin/projetos/${id}/previa`} prefetch={false}>Pré-visualizar</Link>
      </div>
      <section className="panel-card">
        <ActionForm action={saveProject.bind(null, rawId)} submit="Salvar projeto">
          <ProjectFields project={project} />
          <label>Status<select name="status" defaultValue={project.status}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select></label>
          <p>Para retirar do portfólio, selecione Rascunho e salve.</p>
          <label>Capa<select name="capa" defaultValue={cover?.id ?? ""}>
            <option value="">Sem capa</option>
            {images.map((image) => <option key={image.id} value={image.id}>{image.texto_alternativo}</option>)}
          </select></label>
          {images.length > 0 && <section aria-labelledby="gallery-heading">
            <h2 id="gallery-heading">Galeria</h2>
            <p>As fotos aparecem da menor para a maior ordem.</p>
            <div className="panel-photos">
              {images.map((image) => (
                <article key={image.id}>
                  <Image src={`/admin/foto/${image.id}`} width={360} height={240} unoptimized alt={image.texto_alternativo} />
                  <label>Texto alternativo<input name={`alt-${image.id}`} maxLength={255} defaultValue={image.texto_alternativo} /></label>
                  <label>Ordem da foto<input name={`ordem-${image.id}`} type="number" min={0} max={999999} defaultValue={image.ordem} /></label>
                  <label className="panel-checkbox"><input type="checkbox" name={`remover-${image.id}`} /> Remover ao salvar</label>
                </article>
              ))}
            </div>
          </section>}
        </ActionForm>
      </section>
      <section className="panel-card" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Enviar foto</h2>
        <p>{images.length} de {maxProjectImages} fotos. JPEG, PNG ou WebP, até 5 MB por foto.</p>
        {images.length < maxProjectImages && (
          <ActionForm action={uploadProjectImage.bind(null, rawId)} submit="Enviar foto" resetOnSuccess>
            <label>Foto<input type="file" name="foto" accept="image/jpeg,image/png,image/webp" required /></label>
            <label>Texto alternativo da nova foto<input name="alt" maxLength={255} required /></label>
          </ActionForm>
        )}
      </section>
    </>
  );
}
