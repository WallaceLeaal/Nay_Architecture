import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  if (password.length < 14 || password.length > 128) {
    throw new Error("Use uma senha de 14 a 128 caracteres.");
  }
  const salt = randomBytes(16);
  const key = await derive(password, salt, 64, options);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password, hash) {
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(hash);
  if (!match || password.length > 128) return false;
  const key = await derive(password, Buffer.from(match[1], "hex"), 64, options);
  return timingSafeEqual(key, Buffer.from(match[2], "hex"));
}
