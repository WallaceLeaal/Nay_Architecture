import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "../db/connection.mjs";
import { InputError, readOrder, readText, type readProject } from "./project-input";
import { maxProjectImages, removeStoredImage, storeImage } from "./project-files";

type Status = "rascunho" | "publicado";
type ProjectInput = ReturnType<typeof readProject>;

export interface Project extends RowDataPacket, ProjectInput {
  id: number;
  status: Status;
}

export interface ProjectImage extends RowDataPacket {
  id: number;
  tipo: "capa" | "galeria";
  texto_alternativo: string;
  ordem: number;
}

interface StoredImage extends ProjectImage {
  caminho: string;
}

interface PublishedCard extends Project {
  capa_id: number | null;
  capa_alt: string | null;
}

const projectColumns = "id, titulo, slug, categoria, descricao, ordem, status";

function databaseConfigured() {
  return Boolean(process.env.MYSQL_DATABASE && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD !== undefined);
}

export async function listAdminProjects() {
  const [rows] = await getDatabasePool().execute<Project[]>(
    `SELECT ${projectColumns} FROM projetos ORDER BY ordem, id`,
  );
  return rows;
}

export async function listPublishedProjects() {
  if (!databaseConfigured()) return [];
  const [rows] = await getDatabasePool().execute<PublishedCard[]>(
    `SELECT p.id, p.titulo, p.slug, p.categoria, p.descricao, p.ordem, p.status,
      i.id AS capa_id, i.texto_alternativo AS capa_alt
     FROM projetos p LEFT JOIN imagens_do_projeto i ON i.projeto_com_capa = p.id
     WHERE p.status = 'publicado' ORDER BY p.ordem, p.id`,
  );
  return rows;
}

export async function findPublishedProject(slug: string) {
  if (!databaseConfigured()) return null;
  const [[project]] = await getDatabasePool().execute<Project[]>(
    `SELECT ${projectColumns} FROM projetos WHERE slug = ? AND status = 'publicado'`, [slug],
  );
  return project ?? null;
}

export async function findAdminProject(id: number) {
  const [[project]] = await getDatabasePool().execute<Project[]>(
    `SELECT ${projectColumns} FROM projetos WHERE id = ?`, [id],
  );
  return project ?? null;
}

export async function getProjectImages(id: number, publishedOnly: boolean) {
  const [images] = await getDatabasePool().execute<ProjectImage[]>(
    `SELECT i.id, i.tipo, i.texto_alternativo, i.ordem
     FROM imagens_do_projeto i JOIN projetos p ON p.id = i.projeto_id
     WHERE i.projeto_id = ? AND (? = 0 OR p.status = 'publicado')
     ORDER BY i.ordem, i.id`, [id, publishedOnly],
  );
  return images;
}

export async function getImageKey(id: number, publishedOnly: boolean) {
  if (!databaseConfigured()) return undefined;
  const [[image]] = await getDatabasePool().execute<StoredImage[]>(
    `SELECT i.caminho FROM imagens_do_projeto i JOIN projetos p ON p.id = i.projeto_id
     WHERE i.id = ? AND (? = 0 OR p.status = 'publicado')`, [id, publishedOnly],
  );
  return image?.caminho;
}

export async function insertProject(project: ProjectInput) {
  const [result] = await getDatabasePool().execute<ResultSetHeader>(
    "INSERT INTO projetos (titulo, slug, categoria, descricao, ordem) VALUES (?, ?, ?, ?, ?)",
    [project.titulo, project.slug, project.categoria, project.descricao, project.ordem],
  );
  return result.insertId;
}

async function withLockedProject<T>(id: number, work: (db: PoolConnection) => Promise<T>) {
  const db = await getDatabasePool().getConnection();
  try {
    await db.beginTransaction();
    const [[row]] = await db.execute<RowDataPacket[]>("SELECT id FROM projetos WHERE id = ? FOR UPDATE", [id]);
    if (!row) throw new InputError("Projeto não encontrado.");
    const result = await work(db);
    await db.commit();
    return result;
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    db.release();
  }
}

export async function updateProject(id: number, project: ProjectInput, form: FormData) {
  const status = form.get("status");
  if (status !== "publicado" && status !== "rascunho") throw new InputError("Selecione um status válido.");
  const cover = form.get("capa");
  const removed = await withLockedProject(id, async (db) => {
    const [images] = await db.execute<StoredImage[]>(
      "SELECT id, caminho FROM imagens_do_projeto WHERE projeto_id = ?", [id],
    );
    const deleted = images.filter((image) => form.get(`remover-${image.id}`) === "on");
    const kept = images.filter((image) => !deleted.includes(image));
    const selected = kept.find((image) => String(image.id) === cover);
    if (cover && !selected) throw new InputError("Escolha uma capa que será mantida.");
    if (status === "publicado" && !selected) throw new InputError("Envie uma foto e escolha a capa antes de publicar.");

    await db.execute("UPDATE imagens_do_projeto SET tipo = 'galeria' WHERE projeto_id = ? AND tipo = 'capa'", [id]);
    for (const image of kept) {
      const alt = readText(form, `alt-${image.id}`, "Texto alternativo", 255);
      const order = readOrder(form, `ordem-${image.id}`);
      await db.execute(
        "UPDATE imagens_do_projeto SET tipo = ?, texto_alternativo = ?, ordem = ? WHERE id = ?",
        [image === selected ? "capa" : "galeria", alt, order, image.id],
      );
    }
    for (const image of deleted) await db.execute("DELETE FROM imagens_do_projeto WHERE id = ?", [image.id]);
    await db.execute(
      `UPDATE projetos SET titulo = ?, slug = ?, categoria = ?, descricao = ?, ordem = ?, status = ?,
       publicado_em = IF(? = 'publicado', COALESCE(publicado_em, UTC_TIMESTAMP(3)), NULL) WHERE id = ?`,
      [project.titulo, project.slug, project.categoria, project.descricao, project.ordem, status, status, id],
    );
    return deleted;
  });
  await Promise.all(removed.map((image) => removeStoredImage(image.caminho)));
}

export async function addProjectImage(id: number, image: Buffer, alt: string) {
  await withLockedProject(id, async (db) => {
    const [[current]] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, COALESCE(MAX(ordem), 0) AS ultima FROM imagens_do_projeto WHERE projeto_id = ?", [id],
    );
    if (current.total >= maxProjectImages) throw new InputError(`Cada projeto aceita até ${maxProjectImages} fotos.`);
    const key = await storeImage(image);
    try {
      await db.execute(
        "INSERT INTO imagens_do_projeto (projeto_id, caminho, texto_alternativo, ordem) VALUES (?, ?, ?, ?)",
        [id, key, alt, Math.min(current.ultima + 1, 999999)],
      );
    } catch (error) {
      await removeStoredImage(key);
      throw error;
    }
  });
}
