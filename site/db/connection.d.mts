import type { Pool, ConnectionOptions } from "mysql2/promise";

export function getConnectionOptions(): ConnectionOptions;
export function getDatabasePool(): Pool;
