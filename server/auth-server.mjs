import { config as loadEnv } from "dotenv";
import http from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { URL, pathToFileURL } from "node:url";
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
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const HAS_SMTP = Boolean(process.env.SMTP_HOST);
const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME || "ideciclo_session";
const COOKIE_SECURE =
  process.env.AUTH_COOKIE_SECURE === "true" ||
  (process.env.AUTH_COOKIE_SECURE !== "false" &&
    APP_URL.toLowerCase().startsWith("https://"));
const MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES = Number(
  process.env.AUTH_MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES || 15
);
const MAGIC_LINK_RATE_LIMIT_EMAIL_MAX = Number(
  process.env.AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_MAX || 5
);
const MAGIC_LINK_RATE_LIMIT_IP_MAX = Number(
  process.env.AUTH_MAGIC_LINK_RATE_LIMIT_IP_MAX || 20
);
const MAGIC_LINK_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS = Number(
  process.env.AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS || 60
);

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória para iniciar o servidor de autenticação.");
}

const assertProductionConfig = () => {
  const errors = [];

  if (!process.env.APP_URL) {
    errors.push("APP_URL deve ser definido explicitamente em produção.");
  } else if (!/^https:\/\//i.test(APP_URL)) {
    errors.push("APP_URL deve usar https em produção.");
  }

  if (
    !process.env.MAGIC_LINK_SECRET ||
    MAGIC_LINK_SECRET === "change_me_magic_link_secret" ||
    MAGIC_LINK_SECRET.trim().length < 32
  ) {
    errors.push("MAGIC_LINK_SECRET deve ser definido com pelo menos 32 caracteres.");
  }

  if (!process.env.EMAIL_FROM || EMAIL_FROM.endsWith(".local")) {
    errors.push("EMAIL_FROM deve ser configurado com um remetente real em produção.");
  }

  if (!HAS_SMTP) {
    errors.push("SMTP_HOST é obrigatório em produção; jsonTransport não é permitido.");
  }

  if (!COOKIE_SECURE) {
    errors.push("AUTH_COOKIE_SECURE precisa estar habilitado em produção.");
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuração inválida para produção:\n- ${errors.join("\n- ")}`
    );
  }
};

if (IS_PRODUCTION) {
  assertProductionConfig();
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

const getClientIp = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  return request.socket?.remoteAddress || null;
};

const cleanupExpiredAuthState = async (client = pool) => {
  await client.query(
    `
      DELETE FROM auth.magic_links
      WHERE used_at IS NOT NULL
         OR expires_at <= now()
    `
  );

  await client.query(
    `
      DELETE FROM auth.sessions
      WHERE revoked_at IS NOT NULL
         OR expires_at <= now()
    `
  );

  await client.query(
    `
      DELETE FROM auth.magic_link_requests
      WHERE requested_at <= now() - interval '7 days'
    `
  );
};

const assertMagicLinkRateLimit = async (email, ipAddress, client = pool) => {
  const emailStatsResult = await client.query(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE requested_at > now() - make_interval(mins => $2::int)
        )::int AS recent_count,
        MAX(requested_at) AS last_request_at
      FROM auth.magic_link_requests
      WHERE lower(email) = lower($1)
    `,
    [email, MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES]
  );

  const emailStats = emailStatsResult.rows[0];
  const emailRecentCount = Number(emailStats?.recent_count || 0);
  const lastRequestAt = emailStats?.last_request_at
    ? new Date(emailStats.last_request_at).getTime()
    : null;

  if (emailRecentCount >= MAGIC_LINK_RATE_LIMIT_EMAIL_MAX) {
    return { allowed: false, reason: "email_window" };
  }

  if (
    lastRequestAt &&
    Date.now() - lastRequestAt <
      MAGIC_LINK_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS * 1000
  ) {
    return { allowed: false, reason: "email_cooldown" };
  }

  if (ipAddress) {
    const ipStatsResult = await client.query(
      `
        SELECT COUNT(*)::int AS recent_count
        FROM auth.magic_link_requests
        WHERE ip_address = $1
          AND requested_at > now() - make_interval(mins => $2::int)
      `,
      [ipAddress, MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES]
    );

    const ipRecentCount = Number(ipStatsResult.rows[0]?.recent_count || 0);
    if (ipRecentCount >= MAGIC_LINK_RATE_LIMIT_IP_MAX) {
      return { allowed: false, reason: "ip_window" };
    }
  }

  return { allowed: true, reason: null };
};

const recordMagicLinkRequest = async (email, ipAddress, client = pool) => {
  await client.query(
    `
      INSERT INTO auth.magic_link_requests (email, ip_address)
      VALUES ($1, $2)
    `,
    [email, ipAddress]
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

const JSON_COLUMN_CASTS = {
  geometry: "jsonb",
  merged_segments: "jsonb",
  responses: "jsonb",
  osm_advanced: "jsonb",
};

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const hasAnyOwn = (value, keys) => keys.some((key) => hasOwn(value, key));

const asJsonb = (value) =>
  value === undefined ? undefined : value === null ? null : JSON.stringify(value);

const SEGMENT_TECHNICAL_FIELDS = [
  "ideciclo_prefill",
  "osm_confidence",
  "osm_tags",
  "osm_raw",
  "osm_improvement_suggestions",
  "intersections_preview",
  "selected_intersections",
  "estimated_blocks_count",
  "estimated_intersections_count",
  "blocks_count",
  "intersections_count",
  "relevant_intersections_count",
  "connected_intersections_count",
  "osm_id",
  "osm_type",
];

const buildUpdateAssignments = (payload, columnCasts = {}) => {
  const assignments = [];
  const values = [];

  Object.entries(payload).forEach(([column, rawValue]) => {
    if (rawValue === undefined) return;

    const cast = columnCasts[column] ? `::${columnCasts[column]}` : "";
    const value =
      columnCasts[column] === "jsonb" ? asJsonb(rawValue) : rawValue;

    values.push(value);
    assignments.push(`${column} = $${values.length}${cast}`);
  });

  return { assignments, values };
};

const canAccessAnyModule = ({ permissions, modules, state, city }) =>
  modules.some((module) =>
    canAccessModule({
      permissions,
      module,
      state,
      city,
    })
  );

const ensurePrefixedSegmentId = (segmentId, cityId) => {
  if (!segmentId) return segmentId;
  if (segmentId.includes("_")) return segmentId;
  if (!cityId) return segmentId;
  return `${cityId}_${segmentId}`;
};

const buildSegmentTechnicalPatch = (segment) => {
  const patch = {};

  SEGMENT_TECHNICAL_FIELDS.forEach((field) => {
    if (hasOwn(segment, field)) {
      patch[field] = segment[field] ?? null;
    }
  });

  if (hasOwn(segment, "estimated_blocks_count") && !hasOwn(segment, "blocks_count")) {
    patch.blocks_count = segment.estimated_blocks_count ?? null;
  }

  if (hasOwn(segment, "blocks_count") && !hasOwn(segment, "estimated_blocks_count")) {
    patch.estimated_blocks_count = segment.blocks_count ?? null;
  }

  if (
    hasOwn(segment, "estimated_intersections_count") &&
    !hasOwn(segment, "intersections_count")
  ) {
    patch.intersections_count = segment.estimated_intersections_count ?? null;
  }

  if (
    hasOwn(segment, "intersections_count") &&
    !hasOwn(segment, "estimated_intersections_count")
  ) {
    patch.estimated_intersections_count = segment.intersections_count ?? null;
  }

  return patch;
};

const mergeSegmentTechnicalEnvelope = (currentEnvelope, patch) => ({
  ...(currentEnvelope &&
  typeof currentEnvelope === "object" &&
  !Array.isArray(currentEnvelope)
    ? currentEnvelope
    : {}),
  version: 1,
  updated_at: new Date().toISOString(),
  ...patch,
});

const normalizeCityPayload = (city) => ({
  id: city.id,
  name: city.name,
  state: city.state,
  extensao_avaliada: city.extensao_avaliada || 0,
  ideciclo: city.ideciclo || 0,
  vias_estruturais_km: city.vias_estruturais_km || 0,
  vias_alimentadoras_km: city.vias_alimentadoras_km || 0,
  vias_locais_km: city.vias_locais_km || 0,
  show_in_ranking:
    typeof city.show_in_ranking === "boolean" ? city.show_in_ranking : false,
});

const normalizeSegmentPayload = (segment) => {
  const cityId = segment.id_cidade;
  const technicalPatch = buildSegmentTechnicalPatch(segment);

  return {
    id: ensurePrefixedSegmentId(segment.id, cityId),
    id_cidade: cityId,
    id_form: segment.id_form ?? null,
    name: segment.name,
    type: segment.type,
    length: segment.length,
    neighborhood: segment.neighborhood ?? null,
    geometry: segment.geometry ?? null,
    selected: segment.selected ?? false,
    evaluated: segment.evaluated ?? false,
    is_merged: segment.is_merged ?? false,
    parent_segment_id: segment.parent_segment_id
      ? ensurePrefixedSegmentId(segment.parent_segment_id, cityId)
      : null,
    merged_segments: segment.merged_segments ?? [],
    classification: segment.classification ?? null,
    osm_advanced: hasOwn(segment, "osm_advanced")
      ? segment.osm_advanced ?? null
      : Object.keys(technicalPatch).length > 0
      ? mergeSegmentTechnicalEnvelope(null, technicalPatch)
      : null,
    deleted_at: hasOwn(segment, "deleted_at") ? segment.deleted_at ?? null : undefined,
  };
};

const normalizeSegmentPatchPayload = (segment, cityId) => {
  const payload = {};

  if (hasOwn(segment, "id_form")) payload.id_form = segment.id_form ?? null;
  if (hasOwn(segment, "name")) payload.name = segment.name;
  if (hasOwn(segment, "type")) payload.type = segment.type;
  if (hasOwn(segment, "length")) payload.length = segment.length;
  if (hasOwn(segment, "neighborhood")) payload.neighborhood = segment.neighborhood ?? null;
  if (hasOwn(segment, "geometry")) payload.geometry = segment.geometry ?? null;
  if (hasOwn(segment, "selected")) payload.selected = segment.selected ?? false;
  if (hasOwn(segment, "evaluated")) payload.evaluated = segment.evaluated ?? false;
  if (hasOwn(segment, "is_merged")) payload.is_merged = segment.is_merged ?? false;
  if (hasOwn(segment, "parent_segment_id")) {
    payload.parent_segment_id = segment.parent_segment_id
      ? ensurePrefixedSegmentId(segment.parent_segment_id, cityId)
      : null;
  }
  if (hasOwn(segment, "merged_segments")) payload.merged_segments = segment.merged_segments ?? [];
  if (hasOwn(segment, "classification")) payload.classification = segment.classification ?? null;
  if (hasOwn(segment, "osm_advanced")) payload.osm_advanced = segment.osm_advanced ?? null;
  if (hasOwn(segment, "deleted_at")) payload.deleted_at = segment.deleted_at ?? null;

  return payload;
};

const normalizeFormPayload = (form) => ({
  id: form.id,
  segment_id: ensurePrefixedSegmentId(form.segment_id, form.city_id),
  city_id: form.city_id,
  researcher: form.researcher ?? null,
  date:
    form.date instanceof Date
      ? form.date.toISOString()
      : form.date || new Date().toISOString(),
  street_name: form.street_name ?? null,
  neighborhood: form.neighborhood ?? null,
  extension: form.extension ?? null,
  start_point: form.start_point ?? null,
  end_point: form.end_point ?? null,
  hierarchy: form.hierarchy ?? null,
  velocity: form.velocity ?? null,
  blocks_count: form.blocks_count ?? null,
  intersections_count: form.intersections_count ?? null,
  observations: form.observations ?? null,
  responses: form.responses ?? null,
});

const normalizeFormPatchPayload = (form) => {
  const payload = {};

  if (hasOwn(form, "segment_id")) {
    payload.segment_id = ensurePrefixedSegmentId(form.segment_id, form.city_id);
  }
  if (hasOwn(form, "city_id")) payload.city_id = form.city_id;
  if (hasOwn(form, "researcher")) payload.researcher = form.researcher ?? null;
  if (hasOwn(form, "date")) {
    payload.date =
      form.date instanceof Date
        ? form.date.toISOString()
        : form.date ?? null;
  }
  if (hasOwn(form, "street_name")) payload.street_name = form.street_name ?? null;
  if (hasOwn(form, "neighborhood")) payload.neighborhood = form.neighborhood ?? null;
  if (hasOwn(form, "extension")) payload.extension = form.extension ?? null;
  if (hasOwn(form, "start_point")) payload.start_point = form.start_point ?? null;
  if (hasOwn(form, "end_point")) payload.end_point = form.end_point ?? null;
  if (hasOwn(form, "hierarchy")) payload.hierarchy = form.hierarchy ?? null;
  if (hasOwn(form, "velocity")) payload.velocity = form.velocity ?? null;
  if (hasOwn(form, "blocks_count")) payload.blocks_count = form.blocks_count ?? null;
  if (hasOwn(form, "intersections_count")) {
    payload.intersections_count = form.intersections_count ?? null;
  }
  if (hasOwn(form, "observations")) payload.observations = form.observations ?? null;
  if (hasOwn(form, "responses")) payload.responses = form.responses ?? null;

  return payload;
};

const normalizeReviewPayload = (review) => ({
  id: review.id,
  form_id: review.form_id,
  rating_name: review.rating_name,
  rating: review.rating,
  weight: review.weight,
});

const fetchCityScope = async (cityId, client = pool) => {
  const result = await client.query(
    `
      SELECT id, name, state
      FROM public.cities
      WHERE id = $1
      LIMIT 1
    `,
    [cityId]
  );

  return result.rows[0] || null;
};

const resolveSegmentRecord = async (segmentId, cityId, client = pool) => {
  const exactIds = Array.from(
    new Set(
      segmentId.includes("_")
        ? [segmentId]
        : [ensurePrefixedSegmentId(segmentId, cityId), segmentId].filter(Boolean)
    )
  );

  for (const candidateId of exactIds) {
    const result = await client.query(
      `
        SELECT id, id_cidade, parent_segment_id
        FROM public.segments
        WHERE id = $1
        LIMIT 1
      `,
      [candidateId]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }
  }

  if (!segmentId.includes("_")) {
    const result = await client.query(
      `
        SELECT id, id_cidade, parent_segment_id
        FROM public.segments
        WHERE id LIKE $1
        ORDER BY id ASC
        LIMIT 1
      `,
      [`%_${segmentId}`]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }
  }

  return null;
};

const fetchSegmentScope = async (segmentId, cityId, client = pool) => {
  const segment = await resolveSegmentRecord(segmentId, cityId, client);
  if (!segment) return null;

  const city = await fetchCityScope(segment.id_cidade, client);
  if (!city) return null;

  return {
    cityId: city.id,
    city: city.name,
    state: city.state,
    segmentId: segment.id,
  };
};

const fetchFormScope = async (formId, client = pool) => {
  const result = await client.query(
    `
      SELECT f.id, f.city_id, c.name AS city, c.state
      FROM public.forms f
      INNER JOIN public.cities c ON c.id = f.city_id
      WHERE f.id = $1
      LIMIT 1
    `,
    [formId]
  );

  return result.rows[0] || null;
};

const requireScopedModules = async (request, response, options) => {
  const auth = await requireSession(request, response);
  if (!auth) return null;

  const { modules, state, city } = options;
  const allowed = canAccessAnyModule({
    permissions: auth.session.permissions,
    modules,
    state: state || null,
    city: city || null,
  });

  if (!allowed) {
    json(response, 403, { error: "Acesso negado para esta operação." });
    return null;
  }

  return auth;
};

const upsertCityRow = async (city, client = pool) => {
  const payload = normalizeCityPayload(city);
  const result = await client.query(
    `
      INSERT INTO public.cities (
        id,
        name,
        state,
        extensao_avaliada,
        ideciclo,
        vias_estruturais_km,
        vias_alimentadoras_km,
        vias_locais_km,
        show_in_ranking
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        state = EXCLUDED.state,
        extensao_avaliada = EXCLUDED.extensao_avaliada,
        ideciclo = EXCLUDED.ideciclo,
        vias_estruturais_km = EXCLUDED.vias_estruturais_km,
        vias_alimentadoras_km = EXCLUDED.vias_alimentadoras_km,
        vias_locais_km = EXCLUDED.vias_locais_km,
        show_in_ranking = EXCLUDED.show_in_ranking
      RETURNING *
    `,
    [
      payload.id,
      payload.name,
      payload.state,
      payload.extensao_avaliada,
      payload.ideciclo,
      payload.vias_estruturais_km,
      payload.vias_alimentadoras_km,
      payload.vias_locais_km,
      payload.show_in_ranking,
    ]
  );

  return result.rows[0] || null;
};

const upsertSegmentRow = async (segment, client = pool) => {
  const payload = normalizeSegmentPayload(segment);
  const result = await client.query(
    `
      INSERT INTO public.segments (
        id,
        id_cidade,
        id_form,
        name,
        type,
        length,
        neighborhood,
        geometry,
        selected,
        evaluated,
        is_merged,
        parent_segment_id,
        merged_segments,
        classification,
        osm_advanced,
        deleted_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13::jsonb, $14, $15::jsonb, $16
      )
      ON CONFLICT (id)
      DO UPDATE SET
        id_cidade = EXCLUDED.id_cidade,
        id_form = EXCLUDED.id_form,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        length = EXCLUDED.length,
        neighborhood = EXCLUDED.neighborhood,
        geometry = EXCLUDED.geometry,
        selected = EXCLUDED.selected,
        evaluated = EXCLUDED.evaluated,
        is_merged = EXCLUDED.is_merged,
        parent_segment_id = EXCLUDED.parent_segment_id,
        merged_segments = EXCLUDED.merged_segments,
        classification = EXCLUDED.classification,
        osm_advanced = EXCLUDED.osm_advanced,
        deleted_at = EXCLUDED.deleted_at
      RETURNING *
    `,
    [
      payload.id,
      payload.id_cidade,
      payload.id_form,
      payload.name,
      payload.type,
      payload.length,
      payload.neighborhood,
      asJsonb(payload.geometry),
      payload.selected,
      payload.evaluated,
      payload.is_merged,
      payload.parent_segment_id,
      asJsonb(payload.merged_segments),
      payload.classification,
      asJsonb(payload.osm_advanced),
      payload.deleted_at ?? null,
    ]
  );

  return result.rows[0] || null;
};

const updateSegmentRow = async (segmentId, cityId, segmentPatch, client = pool) => {
  const resolved = await resolveSegmentRecord(segmentId, cityId, client);
  if (!resolved) return null;

  const payload = normalizeSegmentPatchPayload(segmentPatch, resolved.id_cidade);
  if (!hasOwn(segmentPatch, "osm_advanced") && hasAnyOwn(segmentPatch, SEGMENT_TECHNICAL_FIELDS)) {
    const segmentResult = await client.query(
      `SELECT osm_advanced FROM public.segments WHERE id = $1 LIMIT 1`,
      [resolved.id]
    );
    payload.osm_advanced = mergeSegmentTechnicalEnvelope(
      segmentResult.rows[0]?.osm_advanced,
      buildSegmentTechnicalPatch(segmentPatch)
    );
  }

  const { assignments, values } = buildUpdateAssignments(payload, JSON_COLUMN_CASTS);
  if (assignments.length === 0) {
    const result = await client.query(
      `SELECT * FROM public.segments WHERE id = $1 LIMIT 1`,
      [resolved.id]
    );
    return result.rows[0] || null;
  }

  values.push(resolved.id);
  const result = await client.query(
    `
      UPDATE public.segments
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values
  );

  return result.rows[0] || null;
};

const updateSegmentTechnicalRow = async (segmentId, cityId, updates, client = pool) => {
  const resolved = await resolveSegmentRecord(segmentId, cityId, client);
  if (!resolved) return null;
  const segmentResult = await client.query(
    `SELECT osm_advanced FROM public.segments WHERE id = $1 LIMIT 1`,
    [resolved.id]
  );
  const technicalPatch = buildSegmentTechnicalPatch(updates);

  if (!hasOwn(updates, "osm_advanced") && Object.keys(technicalPatch).length === 0) {
    const currentResult = await client.query(
      `SELECT * FROM public.segments WHERE id = $1 LIMIT 1`,
      [resolved.id]
    );
    return currentResult.rows[0] || null;
  }

  const nextOsmAdvanced = hasOwn(updates, "osm_advanced")
    ? updates.osm_advanced ?? null
    : mergeSegmentTechnicalEnvelope(segmentResult.rows[0]?.osm_advanced, technicalPatch);

  const result = await client.query(
    `
      UPDATE public.segments
      SET osm_advanced = $1::jsonb
      WHERE id = $2
      RETURNING *
    `,
    [asJsonb(nextOsmAdvanced), resolved.id]
  );

  return result.rows[0] || null;
};

const createFormRow = async (formData, client = pool) => {
  const payload = normalizeFormPayload(formData);
  const result = await client.query(
    `
      INSERT INTO public.forms (
        id,
        segment_id,
        city_id,
        researcher,
        date,
        street_name,
        neighborhood,
        extension,
        start_point,
        end_point,
        hierarchy,
        velocity,
        blocks_count,
        intersections_count,
        observations,
        responses
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb
      )
      RETURNING *
    `,
    [
      payload.id,
      payload.segment_id,
      payload.city_id,
      payload.researcher,
      payload.date,
      payload.street_name,
      payload.neighborhood,
      payload.extension,
      payload.start_point,
      payload.end_point,
      payload.hierarchy,
      payload.velocity,
      payload.blocks_count,
      payload.intersections_count,
      payload.observations,
      asJsonb(payload.responses),
    ]
  );

  return result.rows[0] || null;
};

const updateFormRow = async (formId, formData, client = pool) => {
  const payload = normalizeFormPatchPayload(formData);

  const { assignments, values } = buildUpdateAssignments(payload, {
    responses: "jsonb",
  });
  if (assignments.length === 0) {
    const result = await client.query(
      `SELECT * FROM public.forms WHERE id = $1 LIMIT 1`,
      [formId]
    );
    return result.rows[0] || null;
  }

  values.push(formId);
  const result = await client.query(
    `
      UPDATE public.forms
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values
  );

  return result.rows[0] || null;
};

const updateSegmentEvaluationStatusRow = async (
  segmentId,
  formId,
  cityId = null,
  client = pool
) => {
  const resolved = await resolveSegmentRecord(segmentId, cityId, client);
  if (!resolved) return false;

  await client.query(
    `
      UPDATE public.segments
      SET evaluated = true,
          id_form = $1
      WHERE id = $2
    `,
    [formId, resolved.id]
  );

  return true;
};

const saveReviewsRows = async (reviews, client = pool) => {
  for (const review of reviews.map(normalizeReviewPayload)) {
    await client.query(
      `
        INSERT INTO public.reviews (
          id,
          form_id,
          rating_name,
          rating,
          weight
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO UPDATE SET
          form_id = EXCLUDED.form_id,
          rating_name = EXCLUDED.rating_name,
          rating = EXCLUDED.rating,
          weight = EXCLUDED.weight
      `,
      [
        review.id,
        review.form_id,
        review.rating_name,
        review.rating,
        review.weight,
      ]
    );
  }
};

const resolveSegmentIds = async (segmentIds, client = pool) => {
  const resolvedIds = [];

  for (const segmentId of segmentIds) {
    const resolved = await resolveSegmentRecord(segmentId, null, client);
    if (resolved?.id) {
      resolvedIds.push(resolved.id);
    }
  }

  return Array.from(new Set(resolvedIds));
};

export const handleAuthRequest = async (request, response) => {
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
      const ipAddress = getClientIp(request);

      if (!email || !email.includes("@")) {
        json(response, 200, { message: GENERIC_LOGIN_MESSAGE });
        return;
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        await cleanupExpiredAuthState(client);

        const rateLimit = await assertMagicLinkRateLimit(email, ipAddress, client);
        await recordMagicLinkRequest(email, ipAddress, client);

        if (!rateLimit.allowed) {
          await client.query("COMMIT");
          json(response, 200, { message: GENERIC_LOGIN_MESSAGE });
          return;
        }

        const userResult = await client.query(
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

          await client.query(
            `
              INSERT INTO auth.magic_links (email, token_hash, expires_at)
              VALUES ($1, $2, now() + make_interval(mins => $3::int))
            `,
            [user.email, tokenHash, MAGIC_LINK_TTL_MINUTES]
          );

          await client.query("COMMIT");

          await sendMagicLinkEmail({
            email: user.email,
            token,
            redirectTo,
          });
        } else {
          await client.query("COMMIT");
        }
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
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
        await cleanupExpiredAuthState(client);

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

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/cities/upsert") {
      const body = await parseJsonBody(request);
      const city = body.city;

      if (!city?.id || !city?.name || !city?.state) {
        json(response, 400, { error: "Dados obrigatórios da cidade ausentes." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: city.state,
        city: city.name,
      });
      if (!auth) return;

      const savedCity = await upsertCityRow(city);
      json(response, 200, { city: savedCity });
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/db/cities/") &&
      requestUrl.pathname.endsWith("/ranking-visibility")
    ) {
      const cityId = requestUrl.pathname.split("/")[5];
      const body = await parseJsonBody(request);
      const visible = Boolean(body.visible);
      const cityScope = await fetchCityScope(cityId);

      if (!cityId || !cityScope) {
        json(response, 404, { error: "Cidade não encontrada." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: cityScope.state,
        city: cityScope.name,
      });
      if (!auth) return;

      await pool.query(
        `
          UPDATE public.cities
          SET show_in_ranking = $1
          WHERE id = $2
        `,
        [visible, cityId]
      );

      json(response, 200, { ok: true });
      return;
    }

    if (
      request.method === "DELETE" &&
      requestUrl.pathname.startsWith("/api/auth/db/cities/")
    ) {
      const cityId = requestUrl.pathname.split("/").pop();
      const cityScope = cityId ? await fetchCityScope(cityId) : null;

      if (!cityId || !cityScope) {
        json(response, 404, { error: "Cidade não encontrada." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: cityScope.state,
        city: cityScope.name,
      });
      if (!auth) return;

      await pool.query(`DELETE FROM public.cities WHERE id = $1`, [cityId]);
      json(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/segments/bulk-upsert") {
      const body = await parseJsonBody(request);
      const segments = Array.isArray(body.segments) ? body.segments : [];
      const cityId = segments[0]?.id_cidade || body.cityId;
      const cityScope = cityId ? await fetchCityScope(cityId) : null;

      if (!cityId || !cityScope || segments.length === 0) {
        json(response, 400, { error: "Segmentos inválidos para salvar." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: cityScope.state,
        city: cityScope.name,
      });
      if (!auth) return;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(`DELETE FROM public.segments WHERE id_cidade = $1`, [cityId]);

        for (const segment of segments) {
          await upsertSegmentRow(segment, client);
        }

        await client.query("COMMIT");
        json(response, 200, { ok: true });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/segments/upsert") {
      const body = await parseJsonBody(request);
      const segment = body.segment;
      const cityScope = segment?.id_cidade ? await fetchCityScope(segment.id_cidade) : null;

      if (!segment?.id || !segment?.id_cidade || !cityScope) {
        json(response, 400, { error: "Segmento inválido." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: cityScope.state,
        city: cityScope.name,
      });
      if (!auth) return;

      const savedSegment = await upsertSegmentRow(segment);
      json(response, 200, { segment: savedSegment });
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/db/segments/") &&
      !requestUrl.pathname.endsWith("/technical") &&
      !requestUrl.pathname.endsWith("/evaluation-status")
    ) {
      const segmentId = requestUrl.pathname.split("/").pop();
      const body = await parseJsonBody(request);
      const segment = body.segment || {};
      const segmentScope = segmentId
        ? await fetchSegmentScope(segmentId, segment.id_cidade || body.cityId)
        : null;

      if (!segmentId || !segmentScope) {
        json(response, 404, { error: "Segmento não encontrado." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: [
          "avaliacao_estrutura_cicloviaria",
          "refinamento_dados_cidade",
        ],
        state: segmentScope.state,
        city: segmentScope.city,
      });
      if (!auth) return;

      const updatedSegment = await updateSegmentRow(
        segmentId,
        segment.id_cidade || segmentScope.cityId,
        segment
      );

      if (!updatedSegment) {
        json(response, 404, { error: "Segmento não encontrado para atualização." });
        return;
      }

      json(response, 200, { segment: updatedSegment });
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/db/segments/") &&
      requestUrl.pathname.endsWith("/technical")
    ) {
      const segmentId = requestUrl.pathname.split("/")[5];
      const body = await parseJsonBody(request);
      const cityId = body.cityId;
      const updates = body.updates || {};
      const segmentScope = segmentId ? await fetchSegmentScope(segmentId, cityId) : null;

      if (!segmentId || !segmentScope) {
        json(response, 404, { error: "Segmento não encontrado." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: segmentScope.state,
        city: segmentScope.city,
      });
      if (!auth) return;

      const updatedSegment = await updateSegmentTechnicalRow(
        segmentId,
        cityId || segmentScope.cityId,
        updates
      );

      if (!updatedSegment) {
        json(response, 404, { error: "Segmento não encontrado para atualização." });
        return;
      }

      json(response, 200, { segment: updatedSegment });
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/db/segments/") &&
      requestUrl.pathname.endsWith("/evaluation-status")
    ) {
      const segmentId = requestUrl.pathname.split("/")[5];
      const body = await parseJsonBody(request);
      const formId = typeof body.formId === "string" ? body.formId : "";
      const segmentScope = segmentId ? await fetchSegmentScope(segmentId, body.cityId) : null;

      if (!segmentId || !formId || !segmentScope) {
        json(response, 400, { error: "Dados inválidos para atualizar a avaliação." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["avaliacao_estrutura_cicloviaria"],
        state: segmentScope.state,
        city: segmentScope.city,
      });
      if (!auth) return;

      const success = await updateSegmentEvaluationStatusRow(
        segmentId,
        formId,
        body.cityId ?? null
      );
      json(response, 200, { ok: success });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/segments/delete") {
      const body = await parseJsonBody(request);
      const segmentIds = Array.isArray(body.segmentIds) ? body.segmentIds : [];
      const hard = Boolean(body.hard);

      if (segmentIds.length === 0) {
        json(response, 400, { error: "Nenhum segmento informado." });
        return;
      }

      const resolvedIds = await resolveSegmentIds(segmentIds);
      if (resolvedIds.length === 0) {
        json(response, 404, { error: "Nenhum segmento encontrado." });
        return;
      }

      const cityRows = await pool.query(
        `
          SELECT DISTINCT c.name AS city, c.state
          FROM public.segments s
          INNER JOIN public.cities c ON c.id = s.id_cidade
          WHERE s.id = ANY($1::text[])
        `,
        [resolvedIds]
      );

      const auth = await requireSession(request, response);
      if (!auth) return;

      const allowed = cityRows.rows.every((scope) =>
        canAccessAnyModule({
          permissions: auth.session.permissions,
          modules: ["refinamento_dados_cidade"],
          state: scope.state,
          city: scope.city,
        })
      );

      if (!allowed) {
        json(response, 403, { error: "Acesso negado para remover segmentos." });
        return;
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `
            UPDATE public.segments
            SET parent_segment_id = null,
                is_merged = false
            WHERE parent_segment_id = ANY($1::text[])
          `,
          [resolvedIds]
        );

        if (hard) {
          await client.query(
            `DELETE FROM public.segments WHERE id = ANY($1::text[])`,
            [resolvedIds]
          );
        } else {
          await client.query(
            `
              UPDATE public.segments
              SET deleted_at = now()
              WHERE id = ANY($1::text[])
            `,
            [resolvedIds]
          );
        }

        await client.query("COMMIT");
        json(response, 200, { ok: true });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/segments/restore") {
      const body = await parseJsonBody(request);
      const segmentIds = Array.isArray(body.segmentIds) ? body.segmentIds : [];

      if (segmentIds.length === 0) {
        json(response, 400, { error: "Nenhum segmento informado." });
        return;
      }

      const resolvedIds = await resolveSegmentIds(segmentIds);
      const cityRows = await pool.query(
        `
          SELECT DISTINCT c.name AS city, c.state
          FROM public.segments s
          INNER JOIN public.cities c ON c.id = s.id_cidade
          WHERE s.id = ANY($1::text[])
        `,
        [resolvedIds]
      );

      const auth = await requireSession(request, response);
      if (!auth) return;

      const allowed = cityRows.rows.every((scope) =>
        canAccessAnyModule({
          permissions: auth.session.permissions,
          modules: ["refinamento_dados_cidade"],
          state: scope.state,
          city: scope.city,
        })
      );

      if (!allowed) {
        json(response, 403, { error: "Acesso negado para restaurar segmentos." });
        return;
      }

      await pool.query(
        `
          UPDATE public.segments
          SET deleted_at = null
          WHERE id = ANY($1::text[])
        `,
        [resolvedIds]
      );

      json(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/segments/unmerge") {
      const body = await parseJsonBody(request);
      const parentSegmentId = typeof body.parentSegmentId === "string" ? body.parentSegmentId : "";
      const segmentIdsToUnmerge = Array.isArray(body.segmentIdsToUnmerge)
        ? body.segmentIdsToUnmerge
        : [];
      const segmentScope = parentSegmentId
        ? await fetchSegmentScope(parentSegmentId, body.cityId)
        : null;

      if (!parentSegmentId || segmentIdsToUnmerge.length === 0 || !segmentScope) {
        json(response, 400, { error: "Dados inválidos para desfazer a mesclagem." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["refinamento_dados_cidade"],
        state: segmentScope.state,
        city: segmentScope.city,
      });
      if (!auth) return;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const parentResult = await client.query(
          `
            SELECT id, merged_segments
            FROM public.segments
            WHERE id = $1
            LIMIT 1
          `,
          [segmentScope.segmentId]
        );

        const parent = parentResult.rows[0];
        if (!parent) {
          await client.query("ROLLBACK");
          json(response, 404, { error: "Segmento pai não encontrado." });
          return;
        }

        const remainingMergedSegments = (parent.merged_segments || []).filter(
          (segment) => !segmentIdsToUnmerge.includes(segment.id)
        );

        if (remainingMergedSegments.length > 0) {
          await client.query(
            `
              UPDATE public.segments
              SET merged_segments = $1::jsonb,
                  is_merged = true
              WHERE id = $2
            `,
            [asJsonb(remainingMergedSegments), parent.id]
          );
        } else {
          await client.query(`DELETE FROM public.segments WHERE id = $1`, [parent.id]);
        }

        for (const segmentId of segmentIdsToUnmerge) {
          const resolved = await resolveSegmentRecord(segmentId, segmentScope.cityId, client);
          if (!resolved) continue;

          await client.query(
            `
              UPDATE public.segments
              SET parent_segment_id = null,
                  is_merged = false
              WHERE id = $1
            `,
            [resolved.id]
          );
        }

        await client.query("COMMIT");
        json(response, 200, { ok: true });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/forms") {
      const body = await parseJsonBody(request);
      const formData = body.formData || body.form;
      const cityScope = formData?.city_id ? await fetchCityScope(formData.city_id) : null;

      if (!formData?.id || !formData?.segment_id || !formData?.city_id || !cityScope) {
        json(response, 400, { error: "Formulário inválido." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["avaliacao_estrutura_cicloviaria"],
        state: cityScope.state,
        city: cityScope.name,
      });
      if (!auth) return;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const form = await createFormRow(formData, client);
        await updateSegmentEvaluationStatusRow(
          formData.segment_id,
          formData.id,
          formData.city_id,
          client
        );
        await client.query("COMMIT");
        json(response, 201, { form });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      return;
    }

    if (
      request.method === "PATCH" &&
      requestUrl.pathname.startsWith("/api/auth/db/forms/")
    ) {
      const formId = requestUrl.pathname.split("/").pop();
      const body = await parseJsonBody(request);
      const formScope = formId ? await fetchFormScope(formId) : null;

      if (!formId || !formScope) {
        json(response, 404, { error: "Formulário não encontrado." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["avaliacao_estrutura_cicloviaria"],
        state: formScope.state,
        city: formScope.city,
      });
      if (!auth) return;

      const form = await updateFormRow(formId, body.formData || {});
      json(response, 200, { form });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/db/reviews/bulk") {
      const body = await parseJsonBody(request);
      const reviews = Array.isArray(body.reviews) ? body.reviews : [];
      const formId = reviews[0]?.form_id;
      const formScope = formId ? await fetchFormScope(formId) : null;

      if (reviews.length === 0 || !formScope) {
        json(response, 400, { error: "Avaliações inválidas." });
        return;
      }

      const auth = await requireScopedModules(request, response, {
        modules: ["avaliacao_estrutura_cicloviaria"],
        state: formScope.state,
        city: formScope.city,
      });
      if (!auth) return;

      await saveReviewsRows(reviews);
      json(response, 200, { ok: true });
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
};

const server = http.createServer(handleAuthRequest);

const isMainModule =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
  server.listen(PORT, HOST, () => {
    console.log(`Auth server rodando em http://${HOST}:${PORT}`);
  });
}
