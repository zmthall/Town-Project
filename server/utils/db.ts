import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

declare global {
  var __pgPool__: pg.Pool | undefined;
}

export const db = globalThis.__pgPool__ ?? new Pool();

if (import.meta.dev) {
  globalThis.__pgPool__ = db;
}
