import { createHash, randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabasePool } from "../db/connection.mjs";
import { verifyPassword } from "./password.mjs";

const cookieName = "nayara_admin";
const lifetime = 8 * 60 * 60;

function tokenHash(token: string) {
  return createHash("sha256").update(token).update(process.env.ADMIN_PASSWORD_HASH ?? "")
    .update(process.env.ADMIN_EMAIL ?? "").digest();
}

export async function verifyAdminOrigin() {
  const origin = (await headers()).get("origin");
  if (!origin || origin !== process.env.ADMIN_ORIGIN) throw new Error("Origem inválida.");
  const url = new URL(origin);
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) throw new Error("O painel exige HTTPS fora do ambiente local.");
}

export async function hasAdminSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_EMAIL) return false;
  const [rows] = await getDatabasePool().execute<RowDataPacket[]>(
    "SELECT 1 FROM admin_sessoes WHERE token_hash = ? AND expira_em > UTC_TIMESTAMP()",
    [tokenHash(token)],
  );
  return rows.length === 1;
}

export async function requireAdmin() {
  if (!(await hasAdminSession())) redirect("/admin/login");
}

export async function createAdminSession(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !hash || !process.env.ADMIN_ORIGIN) return false;

  const pool = getDatabasePool();
  const window = Math.floor(Date.now() / 600_000);
  await pool.execute("DELETE FROM admin_tentativas WHERE janela < ?", [window]);
  await pool.execute(
    "INSERT INTO admin_tentativas VALUES (?, 1) ON DUPLICATE KEY UPDATE total = LEAST(total + 1, 13)",
    [window],
  );
  const [[attempts]] = await pool.execute<RowDataPacket[]>(
    "SELECT total FROM admin_tentativas WHERE janela = ?", [window],
  );
  if (!attempts || attempts.total > 12) return false;
  const validPassword = await verifyPassword(password, hash);
  if (!validPassword || email.trim().toLowerCase() !== configuredEmail) return false;

  const jar = await cookies();
  const previousToken = jar.get(cookieName)?.value;
  if (previousToken) await pool.execute("DELETE FROM admin_sessoes WHERE token_hash = ?", [tokenHash(previousToken)]);
  await pool.execute("DELETE FROM admin_sessoes WHERE expira_em <= UTC_TIMESTAMP()");
  const token = randomBytes(32).toString("hex");
  await pool.execute(
    "INSERT INTO admin_sessoes VALUES (?, TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP()))", [tokenHash(token), lifetime],
  );
  jar.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.ADMIN_ORIGIN.startsWith("https://"),
    sameSite: "strict",
    path: "/admin",
    maxAge: lifetime,
  });
  return true;
}

export async function endAdminSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await getDatabasePool().execute("DELETE FROM admin_sessoes WHERE token_hash = ?", [tokenHash(token)]);
  jar.set(cookieName, "", { path: "/admin", maxAge: 0 });
}
