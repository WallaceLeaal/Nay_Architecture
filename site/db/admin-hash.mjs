import { readFileSync } from "node:fs";
import { hashPassword } from "../lib/password.mjs";

try {
  const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
  console.log(await hashPassword(password));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
