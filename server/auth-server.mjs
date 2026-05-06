import { config as loadEnv } from "dotenv";
import http from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { URL } from "node:url";
import nodemailer from "nodemailer";
import pg from "pg";

const { Pool } = pg;

loadEnv({ path: ".env.local", override: false });
loadEnv({ override: false });

const PORT = Number(process.env.AUTH_SERVER_PORT || 3001);
const HOST = process.env.AUTH_SERVER_HOST || "127.0.0.1";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || "ideciclo"}:${
    process.env.POSTGRES_PASSWORD || "change_me_local_password"
  }@127.0.0.1:${process.env.POSTGRES_PORT || 54322}/${process.env.POSTGRES_DB || "ideciclo"}`;
const APP_URL = process.env.APP_URL || "http://127.0.0.1:8080";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@ideciclo.local";
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "";
const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME || "ideciclo_session";
const COOKIE_SECURE =
  process.env.AUTH_COOKIE_SECURE === "true" ||
  (process.env.AUTH_COOKIE_SECURE !== "false" &&
    APP_URL.toLowerCase().startsWith("https://"));

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória para iniciar o servidor de autenticação.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || "",
          }
        : undefined,
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

const GENERIC_LOGIN_MESSAGE =
  "Se este e-mail estiver autorizado, enviaremos um link de acesso.";
const MAGIC_LINK_TTL_MINUTES = 30;
const SESSION_TTL_DAYS = 7;
const ALLOWED_ROLES = new Set([
  "admin_global",
  "admin_estado",
  "admin_cidade",
  "avaliador_estrutura_cicloviaria",
  "refinador_dados_cidade",
  "visualizador",
]);
const ALLOWED_MODULES = new Set([
  "admin",
  "avaliacao_estrutura_cicloviaria",
  "refinamento_dados_cidade",
]);

const normalizeEmail = (value) => value.trim().toLowerCase();
const BOOTSTRAP_ADMIN_EMAIL = normalizeEmail(
  process.env.AUTH_BOOTSTRAP_ADMIN_EMAIL || "contato@ideciclo.org"
);
const normalizeScopeValue = (value) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const hashSecretValue = (value) =>
  createHash("sha256")
    .update(`${value}:${MAGIC_LINK_SECRET}`)
    .digest("hex");

const generateOpaqueToken = () => randomBytes(32).toString("base64url");

const toCamelPermission = (row) => ({
  id: row.id,
  userId: row.user_id,
  role: row.role,
  state: row.state,
  city: row.city,
  module: row.module,
  createdAt: row.created_at,
});

const toSessionPayload = (sessionRow, permissions) => ({
  session: {
    user: {
      id: sessionRow.user_id,
      email: sessionRow.email,
      name: sessionRow.name,
      active: sessionRow.active,
    },
    expiresAt: sessionRow.expires_at,
    permissions: permissions.map(toCamelPermission),
  },
});

const parseCookies = (headerValue) => {
  if (!headerValue) return {};

  return headerValue.split(";").reduce((accumulator, part) => {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (!rawName) return accumulator;
    accumulator[rawName] = decodeURIComponent(rawValueParts.join("=") || "");
    return accumulator;
  }, {});
};

const serializeCookie = (name, value, options = {}) => {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  segments.push(`Path=${options.path || "/"}`);

  if (options.httpOnly !== false) {
    segments.push("HttpOnly");
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    segments.push("Secure");
  }

  if (options.expires instanceof Date) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }

  return segments.join("; ");
};

const json = (response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
};

const notFound = (response) => json(response, 404, { error: "Not found" });

const sanitizeRedirectPath = (value) => {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/")) return "/admin";
  if (value.startsWith("//")) return "/admin";
  return value;
};

const parseJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("JSON inválido.");
  }
};

const sendMagicLinkEmail = async ({ email, token, redirectTo }) => {
  const verifyUrl = new URL("/auth/verify", APP_URL);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("redirect", sanitizeRedirectPath(redirectTo));

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Seu acesso ao IDECICLO",
    text: [
      "Use o link abaixo para acessar o IDECICLO:",
      verifyUrl.toString(),
      "",
      `O link expira em ${MAGIC_LINK_TTL_MINUTES} minutos e só pode ser usado uma vez.`,
    ].join("\n"),
    html: `
      <p>Use o link abaixo para acessar o IDECICLO:</p>
      <p><a href="${verifyUrl.toString()}">${verifyUrl.toString()}</a></p>
      <p>O link expira em ${MAGIC_LINK_TTL_MINUTES} minutos e só pode ser usado uma vez.</p>
    `,
  });

  if (!process.env.SMTP_HOST) {
    console.log("Magic link gerado em modo local:", info.message);
  }
};

const getSessionFromRequest = async (request) => {
  const cookies = parseCookies(request.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];

  if (!sessionToken) {
    return { session: null, sessionToken: null };
  }

  const sessionHash = hashSecretValue(sessionToken);
  const sessionResult = await pool.query(
    `
      SELECT
        s.id,
        s.user_id,
        s.expires_at,
        u.email,
        u.name,
        u.active
      FROM auth.sessions s
      INNER JOIN auth.users u ON u.id = s.user_id
      WHERE s.session_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
      LIMIT 1
    `,
    [sessionHash]
  );

  const sessionRow = sessionResult.rows[0];

  if (!sessionRow || !sessionRow.active) {
    return { session: null, sessionToken };
  }

  const permissionsResult = await pool.query(
    `
      SELECT id, user_id, role, state, city, module, created_at
      FROM auth.permissions
      WHERE user_id = $1
      ORDER BY created_at ASC
    `,
    [sessionRow.user_id]
  );

  return {
    session: toSessionPayload(sessionRow, permissionsResult.rows).session,
    sessionToken,
  };
};

const revokeSessionToken = async (sessionToken) => {
  if (!sessionToken) return;
  const sessionHash = hashSecretValue(sessionToken);
  await pool.query(
    `
      UPDATE auth.sessions
      SET revoked_at = COALESCE(revoked_at, now())
      WHERE session_hash = $1
    `,
    [sessionHash]
  );
};

const clearSessionCookieHeader = serializeCookie(SESSION_COOKIE_NAME, "", {
  httpOnly: true,
  sameSite: "Lax",
  secure: COOKIE_SECURE,
  path: "/",
  maxAge: 0,
  expires: new Date(0),
});

const matchesScope = (permission, state, city) => {
  const permissionState = normalizeScopeValue(permission.state)?.toLowerCase() || null;
  const permissionCity = normalizeScopeValue(permission.city)?.toLowerCase() || null;
  const requestedState = normalizeScopeValue(state)?.toLowerCase() || null;
  const requestedCity = normalizeScopeValue(city)?.toLowerCase() || null;

  if (permissionState && requestedState && permissionState !== requestedState) {
    return false;
  }

  if (permissionState && !requestedState) {
    return true;
  }

  if (permissionCity && requestedCity && permissionCity !== requestedCity) {
    return false;
  }

  if (permissionCity && !requestedCity) {
    return true;
  }

  return true;
};

const isAdminGlobal = (session) =>
  session.permissions.some((permission) => permission.role === "admin_global");

const canAccessModule = ({ permissions, module, state, city, allowViewer = false }) => {
  return permissions.some((permission) => {
    if (permission.role === "admin_global") return true;

    if (
      (permission.role === "admin_estado" || permission.role === "admin_cidade") &&
      matchesScope(permission, state, city)
    ) {
      return true;
    }

    if (allowViewer && permission.role === "visualizador" && matchesScope(permission, state, city)) {
      return true;
    }

    if (!module) {
      return matchesScope(permission, state, city);
    }

    return permission.module === module && matchesScope(permission, state, city);
  });
};

const ensureBootstrapAdminUser = async (email, client = pool) => {
  if (!email || email !== BOOTSTRAP_ADMIN_EMAIL) return;

  await client.query(
    `
      INSERT INTO auth.users (email, name, active)
      VALUES ($1, $2, true)
      ON CONFLICT ((lower(email)))
      DO UPDATE SET
        active = true,
        name = COALESCE(auth.users.name, EXCLUDED.name)
    `,
    [BOOTSTRAP_ADMIN_EMAIL, "Administrador IDECICLO"]
  );

  await client.query(
    `
      INSERT INTO auth.permissions (user_id, role, state, city, module)
      SELECT id, 'admin_global', null, null, 'admin'
      FROM auth.users
      WHERE lower(email) = lower($1)
      ON CONFLICT DO NOTHING
    `,
    [BOOTSTRAP_ADMIN_EMAIL]
  );
};

const requireSession = async (request, response) => {
  const { session, sessionToken } = await getSessionFromRequest(request);

  if (!session) {
    json(
      response,
      401,
      { error: "Sessão inválida ou expirada." },
      { "Set-Cookie": clearSessionCookieHeader }
    );
    return null;
  }

  return { session, sessionToken };
};

const requireAdminGlobal = async (request, response) => {
  const auth = await requireSession(request, response);
  if (!auth) return null;

  if (!isAdminGlobal(auth.session)) {
    json(response, 403, { error: "Acesso restrito a administradores globais." });
    return null;
  }

  return auth;
};

const listUsersWithPermissions = async () => {
  const [usersResult, permissionsResult] = await Promise.all([
    pool.query(
      `
        SELECT id, email, name, active, created_at
        FROM auth.users
        ORDER BY created_at DESC, email ASC
      `
    ),
    pool.query(
      `
        SELECT id, user_id, role, state, city, module, created_at
        FROM auth.permissions
        ORDER BY created_at ASC
      `
    ),
  ]);

  const permissionsByUserId = permissionsResult.rows.reduce((accumulator, permission) => {
    const currentList = accumulator.get(permission.user_id) || [];
    currentList.push(toCamelPermission(permission));
    accumulator.set(permission.user_id, currentList);
    return accumulator;
  }, new Map());

  return usersResult.rows.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    active: user.active,
    createdAt: user.created_at,
    permissions: permissionsByUserId.get(user.id) || [],
  }));
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "GET" && requestUrl.pathname === "/api/auth/session") {
      const { session, sessionToken } = await getSessionFromRequest(request);

      if (!session) {
        json(
          response,
          200,
          { session: null },
          sessionToken ? { "Set-Cookie": clearSessionCookieHeader } : {}
        );
        return;
      }

      json(response, 200, { session });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/request-magic-link") {
      const body = await parseJsonBody(request);
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const redirectTo = sanitizeRedirectPath(body.redirectTo);

      if (!email || !email.includes("@")) {
        json(response, 200, { message: GENERIC_LOGIN_MESSAGE });
        return;
      }

      await ensureBootstrapAdminUser(email);

      const userResult = await pool.query(
        `
          SELECT id, email, active
          FROM auth.users
          WHERE lower(email) = lower($1)
          LIMIT 1
        `,
        [email]
      );

      const user = userResult.rows[0];

      if (user?.active) {
        const token = generateOpaqueToken();
        const tokenHash = hashSecretValue(token);

        await pool.query(
          `
            INSERT INTO auth.magic_links (email, token_hash, expires_at)
            VALUES ($1, $2, now() + interval '30 minutes')
          `,
          [user.email, tokenHash]
        );

        await sendMagicLinkEmail({
          email: user.email,
          token,
          redirectTo,
        });
      }

      json(response, 200, { message: GENERIC_LOGIN_MESSAGE });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/verify") {
      const body = await parseJsonBody(request);
      const token = typeof body.token === "string" ? body.token.trim() : "";
      const redirectTo = sanitizeRedirectPath(body.redirectTo);

      if (!token) {
        json(response, 400, { error: "Token inválido." });
        return;
      }

      const tokenHash = hashSecretValue(token);
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const magicLinkResult = await client.query(
          `
            SELECT
              m.id,
              m.email,
              m.expires_at,
              m.used_at,
              u.id AS user_id,
              u.email AS user_email,
              u.active
            FROM auth.magic_links m
            INNER JOIN auth.users u ON lower(u.email) = lower(m.email)
            WHERE m.token_hash = $1
            FOR UPDATE
          `,
          [tokenHash]
        );

        const magicLink = magicLinkResult.rows[0];

        if (!magicLink || !magicLink.active) {
          await client.query("ROLLBACK");
          json(response, 401, { error: "Link inválido ou expirado." });
          return;
        }

        if (magicLink.used_at || new Date(magicLink.expires_at).getTime() <= Date.now()) {
          await client.query("ROLLBACK");
          json(response, 401, { error: "Link inválido ou expirado." });
          return;
        }

        await client.query(
          `
            UPDATE auth.magic_links
            SET used_at = now()
            WHERE id = $1
          `,
          [magicLink.id]
        );

        const sessionToken = generateOpaqueToken();
        const sessionHash = hashSecretValue(sessionToken);

        await client.query(
          `
            INSERT INTO auth.sessions (user_id, session_hash, expires_at)
            VALUES ($1, $2, now() + interval '7 days')
          `,
          [magicLink.user_id, sessionHash]
        );

        await client.query("COMMIT");

        json(
          response,
          200,
          {
            ok: true,
            redirectTo,
          },
          {
            "Set-Cookie": serializeCookie(SESSION_COOKIE_NAME, sessionToken, {
              httpOnly: true,
              sameSite: "Lax",
              secure: COOKIE_SECURE,
              path: "/",
              maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
              expires: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
            }),
          }
        );
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/logout") {
      const cookies = parseCookies(request.headers.cookie);
      await revokeSessionToken(cookies[SESSION_COOKIE_NAME]);
      json(
        response,
        200,
        { ok: true },
        {
          "Set-Cookie": clearSessionCookieHeader,
        }
      );
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/auth/admin/users") {
      const auth = await requireAdminGlobal(request, response);
      if (!auth) return;

      const users = await listUsersWithPermissions();
      json(response, 200, { users });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/admin/users") {
      const auth = await requireAdminGlobal(request, response);
      if (!auth) return;

      const body = await parseJsonBody(request);
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const name = normalizeScopeValue(body.name);

      if (!email || !email.includes("@")) {
        json(response, 400, { error: "Informe um e-mail válido." });
        return;
      }

      try {
        await pool.query(
          `
            INSERT INTO auth.users (email, name)
            VALUES ($1, $2)
          `,
          [email, name]
        );
      } catch (error) {
        if (error?.code === "23505") {
          json(response, 409, { error: "Este e-mail já está cadastrado." });
          return;
        }

        throw error;
      }

      const users = await listUsersWithPermissions();
      json(response, 201, { users });
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/admin/users/")
    ) {
      const auth = await requireAdminGlobal(request, response);
      if (!auth) return;

      const userId = requestUrl.pathname.split("/").pop();
      const body = await parseJsonBody(request);
      const name = Object.prototype.hasOwnProperty.call(body, "name")
        ? normalizeScopeValue(body.name)
        : undefined;
      const active = Object.prototype.hasOwnProperty.call(body, "active")
        ? Boolean(body.active)
        : undefined;

      if (!userId) {
        json(response, 400, { error: "Usuário inválido." });
        return;
      }

      if (name === undefined && active === undefined) {
        json(response, 400, { error: "Nenhuma alteração recebida." });
        return;
      }

      const fields = [];
      const values = [];

      if (name !== undefined) {
        values.push(name);
        fields.push(`name = $${values.length}`);
      }

      if (active !== undefined) {
        values.push(active);
        fields.push(`active = $${values.length}`);
      }

      values.push(userId);
      await pool.query(
        `
          UPDATE auth.users
          SET ${fields.join(", ")}
          WHERE id = $${values.length}
        `,
        values
      );

      const users = await listUsersWithPermissions();
      json(response, 200, { users });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/admin/permissions") {
      const auth = await requireAdminGlobal(request, response);
      if (!auth) return;

      const body = await parseJsonBody(request);
      const userId = typeof body.userId === "string" ? body.userId : "";
      const role = typeof body.role === "string" ? body.role : "";
      const state = normalizeScopeValue(body.state);
      const city = normalizeScopeValue(body.city);
      const moduleValue = normalizeScopeValue(body.module);

      if (!userId || !ALLOWED_ROLES.has(role)) {
        json(response, 400, { error: "Permissão inválida." });
        return;
      }

      if (moduleValue && !ALLOWED_MODULES.has(moduleValue)) {
        json(response, 400, { error: "Módulo inválido." });
        return;
      }

      try {
        await pool.query(
          `
            INSERT INTO auth.permissions (user_id, role, state, city, module)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [userId, role, state, city, moduleValue]
        );
      } catch (error) {
        if (error?.code === "23505") {
          json(response, 409, { error: "Essa permissão já existe para o usuário." });
          return;
        }

        throw error;
      }

      const users = await listUsersWithPermissions();
      json(response, 201, { users });
      return;
    }

    if (
      request.method === "DELETE" &&
      requestUrl.pathname.startsWith("/api/auth/admin/permissions/")
    ) {
      const auth = await requireAdminGlobal(request, response);
      if (!auth) return;

      const permissionId = requestUrl.pathname.split("/").pop();

      if (!permissionId) {
        json(response, 400, { error: "Permissão inválida." });
        return;
      }

      await pool.query(`DELETE FROM auth.permissions WHERE id = $1`, [permissionId]);
      const users = await listUsersWithPermissions();
      json(response, 200, { users });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/auth/me") {
      const auth = await requireSession(request, response);
      if (!auth) return;

      json(response, 200, { session: auth.session });
      return;
    }

    if (
      request.method === "POST" &&
      requestUrl.pathname === "/api/auth/can-access"
    ) {
      const auth = await requireSession(request, response);
      if (!auth) return;

      const body = await parseJsonBody(request);
      const allowed = canAccessModule({
        permissions: auth.session.permissions,
        module: normalizeScopeValue(body.module),
        state: normalizeScopeValue(body.state),
        city: normalizeScopeValue(body.city),
        allowViewer: Boolean(body.allowViewer),
      });

      json(response, 200, { allowed });
      return;
    }

    notFound(response);
  } catch (error) {
    console.error("Erro no servidor de autenticação:", error);
    json(response, 500, {
      error: error instanceof Error ? error.message : "Erro interno do servidor.",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Auth server rodando em http://${HOST}:${PORT}`);
});
