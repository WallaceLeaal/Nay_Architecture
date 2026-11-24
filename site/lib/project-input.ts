export class InputError extends Error {}

export function readText(form: FormData, name: string, label: string, max: number) {
  const raw = form.get(name);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value || value.length > max) throw new InputError(`${label} deve ter de 1 a ${max} caracteres.`);
  return value;
}

export function readOrder(form: FormData, name: string) {
  const value = form.get(name);
  if (typeof value !== "string" || !/^\d{1,6}$/.test(value)) {
    throw new InputError("Informe uma ordem de 0 a 999999.");
  }
  return Number(value);
}

export function readProject(form: FormData) {
  const slug = readText(form, "slug", "Slug", 180);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new InputError("Use letras minúsculas sem acentos, números e hífens no slug.");
  }
  return {
    titulo: readText(form, "titulo", "Título", 160),
    slug,
    categoria: readText(form, "categoria", "Categoria", 100),
    descricao: readText(form, "descricao", "Descrição", 10000),
    ordem: readOrder(form, "ordem"),
  };
}

export function readId(value: string) {
  const id = Number(value);
  return /^[1-9]\d{0,9}$/.test(value) && id <= 4294967295 ? id : null;
}
