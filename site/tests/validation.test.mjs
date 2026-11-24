import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { hashPassword, verifyPassword } from "../lib/password.mjs";
import { maxImageBytes, prepareImage } from "../lib/project-files.ts";
import { readId, readProject } from "../lib/project-input.ts";

test("a senha usa sal aleatório e só a senha correta passa", async () => {
  const password = "frase para teste local";
  const hash = await hashPassword(password);
  assert.notEqual(hash, await hashPassword(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("senha incorreta", hash), false);
  assert.equal(await verifyPassword(password, "inválido"), false);
  await assert.rejects(hashPassword("curta"));
});

test("uma foto PNG real é decodificada e convertida para WebP", async () => {
  const image = await sharp({ create: { width: 12, height: 8, channels: 3, background: "white" } })
    .png().toBuffer();
  const result = await prepareImage(new File([image], "foto.png", { type: "image/png" }));
  assert.equal((await sharp(result).metadata()).format, "webp");
});

test("upload recusa arquivo vazio, MIME forjado e tamanho excessivo", async () => {
  await assert.rejects(prepareImage(new File([], "vazio.jpg")), /Selecione uma foto/);
  await assert.rejects(
    prepareImage(new File(["<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'/>"], "foto.jpg", { type: "image/jpeg" })),
    /JPEG, PNG ou WebP válida/,
  );
  await assert.rejects(
    prepareImage(new File([Buffer.alloc(maxImageBytes + 1)], "grande.png")), /até 5 MB/,
  );
});

test("valida slug e ordem independentemente do navegador", () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ titulo: "Teste", slug: "teste-local", categoria: "Teste", descricao: "Descrição", ordem: "0" })) {
    form.set(key, value);
  }
  assert.equal(readProject(form).slug, "teste-local");
  form.set("ordem", "1.5");
  assert.throws(() => readProject(form), /ordem/);
  form.set("slug", "espaço/privado");
  assert.throws(() => readProject(form), /slug/);
  assert.equal(readId("4294967296"), null);
});
