import { readdir, readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import { getConnectionOptions } from "./connection.mjs";

const directory = new URL("./migrations/", import.meta.url);
const migrations = (await readdir(directory)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
const connection = await mysql.createConnection({
  ...getConnectionOptions(),
  multipleStatements: true,
});

try {
  for (const name of migrations) {
    await connection.query(await readFile(new URL(name, directory), "utf8"));
    console.log(`Migração aplicada: ${name}`);
  }
} finally {
  await connection.end();
}
