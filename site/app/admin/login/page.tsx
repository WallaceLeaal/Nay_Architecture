import { redirect } from "next/navigation";
import { hasAdminSession } from "../../../lib/admin-auth";
import { login } from "../actions";
import ActionForm from "../action-form";

export default async function LoginPage() {
  if (await hasAdminSession()) redirect("/admin");
  return (
    <section className="panel-card panel-login">
      <h1>Entrar no painel</h1>
      <ActionForm action={login} submit="Entrar">
        <label>E-mail<input name="email" type="email" autoComplete="username" maxLength={254} required /></label>
        <label>Senha<input name="password" type="password" autoComplete="current-password" maxLength={128} required /></label>
      </ActionForm>
    </section>
  );
}
