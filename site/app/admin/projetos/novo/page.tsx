import { requireAdmin } from "../../../../lib/admin-auth";
import { createProject } from "../../actions";
import ActionForm from "../../action-form";
import ProjectFields from "../../project-fields";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <section className="panel-card">
      <h1>Novo projeto</h1>
      <ActionForm action={createProject} submit="Criar rascunho">
        <ProjectFields />
      </ActionForm>
    </section>
  );
}
