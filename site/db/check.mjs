import { getDatabasePool } from "./connection.mjs";

const pool = getDatabasePool();

try {
  const [[result]] = await pool.query("SELECT DATABASE() AS banco, VERSION() AS versao");
  console.log(`Conexão OK com ${result.banco} (MySQL ${result.versao}).`);
} finally {
  await pool.end();
}
