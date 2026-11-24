import mysql from "mysql2/promise";

export function getConnectionOptions() {
  const { MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  const port = Number(process.env.MYSQL_PORT ?? 3306);

  if (!MYSQL_DATABASE || !MYSQL_USER || MYSQL_PASSWORD === undefined) {
    throw new Error("Configure MYSQL_DATABASE, MYSQL_USER e MYSQL_PASSWORD.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MYSQL_PORT deve ser um número inteiro entre 1 e 65535.");
  }

  return {
    host: "127.0.0.1",
    port,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    charset: "utf8mb4",
    dateStrings: true,
  };
}

let pool;

export function getDatabasePool() {
  pool ??= mysql.createPool(getConnectionOptions());
  return pool;
}
