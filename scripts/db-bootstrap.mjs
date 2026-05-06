import { config as loadEnv } from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

loadEnv({ path: ".env.local", override: false });
loadEnv({ override: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bootstrapFilePath = path.resolve(__dirname, "../supabase/bootstrap_full_schema.sql");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || "ideciclo"}:${
    process.env.POSTGRES_PASSWORD || "change_me_local_password"
  }@127.0.0.1:${process.env.POSTGRES_PORT || 54322}/${process.env.POSTGRES_DB || "ideciclo"}`;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória para rodar o bootstrap do banco.");
}

const sql = await readFile(bootstrapFilePath, "utf8");

if (!sql.trim()) {
  throw new Error(`Arquivo de bootstrap vazio: ${bootstrapFilePath}`);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

try {
  await pool.query(sql);
  console.log(`Bootstrap aplicado com sucesso usando ${path.relative(process.cwd(), bootstrapFilePath)}.`);
} finally {
  await pool.end();
}
