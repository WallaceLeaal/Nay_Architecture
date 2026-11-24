"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, endAdminSession, requireAdmin, verifyAdminOrigin } from "../../lib/admin-auth";
import { prepareImage } from "../../lib/project-files";
import { InputError, readId, readProject, readText } from "../../lib/project-input";
import { addProjectImage, insertProject, updateProject } from "../../lib/project-store";

function actionError(error: unknown) {
  if (error instanceof InputError) return { error: error.message };
  if ((error as { code?: string })?.code === "ER_DUP_ENTRY") return { error: "Esse slug já está em uso." };
  console.error("Falha na operação do painel:", (error as { code?: string })?.code ?? "erro interno");
  return { error: "Não foi possível concluir a operação. Confira a configuração local e tente novamente." };
}

export async function login(form: FormData) {
  try {
    await verifyAdminOrigin();
    const email = readText(form, "email", "E-mail", 254);
    const password = form.get("password");
    if (typeof password !== "string" || !(await createAdminSession(email, password))) {
      return { error: "Não foi possível entrar. Confira os dados ou tente novamente em alguns minutos." };
    }
  } catch (error) {
    return actionError(error);
  }
  redirect("/admin");
}

export async function logout() {
  await verifyAdminOrigin();
  await requireAdmin();
  await endAdminSession();
  redirect("/admin/login");
}

export async function createProject(form: FormData) {
  await verifyAdminOrigin();
  await requireAdmin();
  let id;
  try {
    id = await insertProject(readProject(form));
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/admin");
  redirect(`/admin/projetos/${id}`);
}

export async function saveProject(rawId: string, form: FormData) {
  await verifyAdminOrigin();
  await requireAdmin();
  try {
    const id = readId(rawId);
    if (!id) throw new InputError("Projeto não encontrado.");
    await updateProject(id, readProject(form), form);
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/portfolio", "layout");
  revalidatePath("/admin");
  revalidatePath(`/admin/projetos/${rawId}`);
  return { message: "Projeto salvo." };
}

export async function uploadProjectImage(rawId: string, form: FormData) {
  await verifyAdminOrigin();
  await requireAdmin();
  try {
    const id = readId(rawId);
    if (!id) throw new InputError("Projeto não encontrado.");
    if (form.getAll("foto").length !== 1) throw new InputError("Envie uma foto por vez.");
    const alt = readText(form, "alt", "Texto alternativo", 255);
    await addProjectImage(id, await prepareImage(form.get("foto")), alt);
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/portfolio", "layout");
  revalidatePath(`/admin/projetos/${rawId}`);
  return { message: "Foto enviada." };
}
