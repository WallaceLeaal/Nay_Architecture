import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { InputError } from "./project-input.ts";

const directory = join(process.cwd(), ".private-uploads");
const fileKey = /^[a-f0-9-]{36}\.webp$/;
export const maxImageBytes = 5 * 1024 * 1024;
export const maxProjectImages = 20;

export async function prepareImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || !file.size) throw new InputError("Selecione uma foto.");
  if (file.size > maxImageBytes) throw new InputError("A foto deve ter até 5 MB.");

  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 24_000_000,
      failOn: "warning",
    });
    const { format, pages } = await image.metadata();
    if (!format || !["jpeg", "png", "webp"].includes(format) || (pages ?? 1) > 1) {
      throw new Error("Formato inválido");
    }
    return await image.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).toBuffer();
  } catch {
    throw new InputError("Envie uma foto JPEG, PNG ou WebP válida, sem animação e com até 24 megapixels.");
  }
}

export async function storeImage(image: Buffer) {
  const key = `${randomUUID()}.webp`;
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(join(directory, key), image, { flag: "wx", mode: 0o600 });
  return key;
}

export async function removeStoredImage(key: string) {
  if (fileKey.test(key)) await unlink(join(directory, key)).catch(() => {});
}

export async function serveStoredImage(key: string | undefined) {
  if (key && fileKey.test(key)) {
    try {
      const bytes = await readFile(join(directory, key));
      return new Response(bytes, { headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      } });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}
