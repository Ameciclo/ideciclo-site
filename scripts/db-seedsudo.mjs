import { config as loadEnv } from "dotenv";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import pg from "pg";

const { Pool } = pg;

loadEnv({ path: ".env.local", override: false });
loadEnv({ override: false });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || "ideciclo"}:${
    process.env.POSTGRES_PASSWORD || "change_me_local_password"
  }@127.0.0.1:${process.env.POSTGRES_PORT || 54322}/${process.env.POSTGRES_DATABASE || "ideciclo"}`;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória para rodar o seed de admin global.");
}

const normalizeEmail = (value) => value.trim().toLowerCase();
const isValidEmail = (value) => value.includes("@") && value.includes(".");

const emailFromArgs = process.argv[2] ? normalizeEmail(process.argv[2]) : "";

const promptEmail = async () => {
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question("E-mail do admin global inicial: ");
    return normalizeEmail(answer);
  } finally {
    rl.close();
  }
};

const seedAdminGlobal = async (email) => {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
        INSERT INTO auth.users (email, name, active)
        VALUES ($1, $2, true)
        ON CONFLICT ((lower(email)))
        DO UPDATE SET
          active = true,
          name = COALESCE(auth.users.name, EXCLUDED.name)
        RETURNING id, email
      `,
      [email, "Administrador IDECICLO"]
    );

    await client.query(
      `
        INSERT INTO auth.permissions (user_id, role, state, city, module)
        VALUES ($1, 'admin_global', null, null, 'admin')
        ON CONFLICT DO NOTHING
      `,
      [userResult.rows[0].id]
    );

    await client.query("COMMIT");
    console.log(`Admin global preparado para ${userResult.rows[0].email}.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

const email = emailFromArgs || (await promptEmail());

if (!isValidEmail(email)) {
  throw new Error("Informe um e-mail válido para criar o admin global inicial.");
}

await seedAdminGlobal(email);
