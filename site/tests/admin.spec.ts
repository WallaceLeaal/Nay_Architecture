import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("administra um projeto e protege o conteúdo privado", async ({ page, playwright, context }, testInfo) => {
  const email = process.env.ADMIN_TEST_EMAIL;
  const password = process.env.ADMIN_TEST_PASSWORD;
  if (!email || !password) throw new Error("Configure ADMIN_TEST_EMAIL e ADMIN_TEST_PASSWORD para um banco exclusivo de teste.");
  const slug = `teste-local-${testInfo.project.name}-${Date.now()}`;
  const title = `Validação local ${slug}`;
  const publicPath = `/portfolio/${slug}`;
  const visitor = await playwright.request.newContext({ baseURL: testInfo.project.use.baseURL });

  try {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill("senha incorreta para teste");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Não foi possível entrar");
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("heading", { name: "Projetos", exact: true })).toBeVisible();
    const session = (await context.cookies()).find(({ name }) => name === "nayara_admin");
    expect(session).toMatchObject({ httpOnly: true, sameSite: "Strict", path: "/admin" });

    await page.getByRole("link", { name: "Novo projeto" }).click();
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Categoria").fill("Teste");
    await page.getByLabel("Descrição").fill("Descrição temporária de teste.");
    await page.getByRole("button", { name: "Criar rascunho" }).click();
    await expect(page.getByRole("heading", { name: "Editar projeto" })).toBeVisible();
    const editPath = new URL(page.url()).pathname;
    await expect(page.getByLabel("Status")).toHaveValue("rascunho");
    const privateEdit = await visitor.get(editPath, { maxRedirects: 0 });
    expect(privateEdit.headers().location).toBe("/admin/login");

    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Enviar foto" }) });
    const upload = async (alt: string, buffer: Buffer) => {
      await form.locator('input[type="file"]').setInputFiles({ name: "teste.png", mimeType: "image/png", buffer });
      await form.getByLabel("Texto alternativo da nova foto").fill(alt);
      await form.getByRole("button", { name: "Enviar foto" }).click();
    };
    await upload("Foto inválida", Buffer.from("não é uma foto"));
    await expect(form.getByRole("alert")).toContainText("JPEG, PNG ou WebP válida");
    const photo = await sharp({ create: { width: 120, height: 80, channels: 3, background: "#b88d78" } }).png().toBuffer();
    for (const alt of ["Capa de teste", "Galeria um", "Galeria dois"]) {
      await upload(alt, photo);
      await expect(form.getByRole("status")).toHaveText("Foto enviada.");
    }
    const source = await page.getByRole("img", { name: "Capa de teste" }).getAttribute("src");
    const mediaId = source?.split("/").at(-1);
    expect(mediaId).toMatch(/^\d+$/);
    const publicImage = `/projeto-foto/${mediaId}`;
    expect((await visitor.get(source!)).status()).toBe(404);
    expect((await visitor.get(publicImage)).status()).toBe(404);
    const draft = await visitor.get(publicPath);
    expect(draft.status()).toBe(404);
    expect(await draft.text()).not.toContain(title);
    expect(await (await visitor.get("/portfolio")).text()).not.toContain(title);

    await page.getByRole("combobox", { name: "Capa", exact: true }).selectOption({ label: "Capa de teste" });
    await page.locator("article").filter({ has: page.getByRole("img", { name: "Galeria dois" }) })
      .getByLabel("Ordem da foto").fill("0");
    const save = page.getByRole("button", { name: "Salvar projeto" });
    const saved = page.locator("form").filter({ has: save }).getByRole("status");
    await save.click();
    await expect(saved).toHaveText("Projeto salvo.");
    await page.getByRole("link", { name: "Pré-visualizar" }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("img").nth(1)).toHaveAttribute("alt", "Galeria dois");
    expect(await page.getByRole("img", { name: "Capa de teste" }).evaluate((image: HTMLImageElement) => image.decode().then(() => image.naturalWidth))).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    const previewPath = new URL(page.url()).pathname;
    expect((await visitor.get(previewPath, { maxRedirects: 0 })).headers().location).toBe("/admin/login");
    await page.getByRole("link", { name: "Voltar à edição" }).click();

    await page.getByLabel("Status").selectOption("publicado");
    await save.click();
    await expect(saved).toHaveText("Projeto salvo.");
    expect(await (await visitor.get("/portfolio")).text()).toContain(title);
    expect(await (await visitor.get(publicPath)).text()).toContain(title);
    const media = await visitor.get(publicImage);
    expect(media.status()).toBe(200);
    expect(media.headers()["cache-control"]).toContain("no-store");
    const publicPage = await context.newPage();
    await publicPage.goto("/portfolio");
    await publicPage.getByRole("link", { name: new RegExp(title) }).click();
    await expect(publicPage.getByRole("heading", { name: title, exact: true })).toBeVisible();
    expect(await publicPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(publicPage.viewportSize()!.width);
    await publicPage.close();

    await page.getByLabel("Título").fill(`${title} editado`);
    await save.click();
    await expect(saved).toHaveText("Projeto salvo.");
    expect(await (await visitor.get(publicPath)).text()).toContain(`${title} editado`);
    await page.getByLabel("Status").selectOption("rascunho");
    await save.click();
    await expect(saved).toHaveText("Projeto salvo.");
    expect((await visitor.get(publicPath)).status()).toBe(404);
    expect((await visitor.get(publicImage)).status()).toBe(404);
    expect(await (await visitor.get("/portfolio")).text()).not.toContain(title);

    // A sessão é revogada no servidor e o cookie antigo não abre o painel.
    const staleEditor = await context.newPage();
    await staleEditor.goto(editPath);
    await page.goto("/admin");
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    const signedOut = await visitor.get(editPath, {
      headers: { cookie: `nayara_admin=${session!.value}` }, maxRedirects: 0,
    });
    expect(signedOut.headers().location).toBe("/admin/login");
    await staleEditor.getByLabel("Status").selectOption("publicado");
    await staleEditor.getByRole("button", { name: "Salvar projeto" }).click();
    await expect(staleEditor).toHaveURL(/\/admin\/login$/);
    expect((await visitor.get(publicPath)).status()).toBe(404);
  } finally {
    await visitor.dispose();
  }
});
