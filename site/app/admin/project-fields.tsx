import type { Project } from "../../lib/project-store";

export default function ProjectFields({ project }: { project?: Project }) {
  return (
    <>
      <div className="panel-grid">
        <label>Título<input name="titulo" defaultValue={project?.titulo} required maxLength={160} /></label>
        <label>Slug<input name="slug" defaultValue={project?.slug} required maxLength={180}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*" aria-describedby="slug-help" />
          <small id="slug-help">Identificador da URL. Use letras minúsculas, números e hífens.</small>
        </label>
        <label>Categoria<input name="categoria" defaultValue={project?.categoria} required maxLength={100} /></label>
        <label>Ordem do projeto<input name="ordem" type="number" min={0} max={999999} defaultValue={project?.ordem ?? 0} required /></label>
      </div>
      <label>Descrição<textarea name="descricao" rows={6} defaultValue={project?.descricao} required maxLength={10000} /></label>
    </>
  );
}
