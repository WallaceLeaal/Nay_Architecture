import Link from "next/link";
import { requireAdmin } from "../../lib/admin-auth";
import { listAdminProjects } from "../../lib/project-store";
import { logout } from "./actions";

export default async function AdminPage() {
  await requireAdmin();
  const projects = await listAdminProjects();
  return (
    <>
      <div className="panel-bar">
        <h1>Projetos</h1>
        <form action={logout}><button className="panel-link" type="submit">Sair</button></form>
      </div>
      <Link className="button panel-button" href="/admin/projetos/novo">Novo projeto</Link>
      {projects.length ? (
        <ul className="panel-list">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/admin/projetos/${project.id}`} prefetch={false}>{project.titulo}</Link>
              <span>{project.status === "publicado" ? "Publicado" : "Rascunho"}</span>
            </li>
          ))}
        </ul>
      ) : <p className="panel-empty">Nenhum projeto cadastrado.</p>}
    </>
  );
}
