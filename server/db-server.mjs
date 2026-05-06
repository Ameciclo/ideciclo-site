import { config as loadEnv } from "dotenv";
import pg from "pg";

const { Pool } = pg;

loadEnv({ path: ".env.local", override: false });
loadEnv({ override: false });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || "ideciclo"}:${
    process.env.POSTGRES_PASSWORD || "change_me_local_password"
  }@127.0.0.1:${process.env.POSTGRES_PORT || 54322}/${process.env.POSTGRES_DB || "ideciclo"}`;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL é obrigatória para acessar a API de leitura do banco.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
};

const notFound = (response) => json(response, 404, { error: "Not found" });

const decodePathPart = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const hasMissingColumn = (error, columnName) =>
  error?.code === "42703" &&
  typeof error?.message === "string" &&
  error.message.includes(columnName);

const fetchSingleRow = async (text, values) => {
  const result = await pool.query(text, values);
  return result.rows[0] || null;
};

const fetchCityRow = async (cityId) =>
  fetchSingleRow(`SELECT * FROM public.cities WHERE id = $1 LIMIT 1`, [cityId]);

const fetchAllCitiesRows = async () => {
  const result = await pool.query(`
    SELECT *
    FROM public.cities
    ORDER BY state ASC, name ASC
  `);
  return result.rows;
};

const fetchCitiesByStateRows = async (state) => {
  const result = await pool.query(
    `
      SELECT *
      FROM public.cities
      WHERE state = $1
      ORDER BY name ASC
    `,
    [state]
  );
  return result.rows;
};

const fetchDistinctStatesRows = async () => {
  const result = await pool.query(`
    SELECT DISTINCT state
    FROM public.cities
    WHERE state IS NOT NULL
    ORDER BY state ASC
  `);
  return result.rows;
};

const fetchFormsByCityIdRows = async (cityId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM public.forms
      WHERE city_id = $1
    `,
    [cityId]
  );
  return result.rows;
};

const fetchFormRow = async (formId) =>
  fetchSingleRow(`SELECT * FROM public.forms WHERE id = $1 LIMIT 1`, [formId]);

const resolveSegmentRecord = async (segmentId, cityId, client = pool) => {
  if (!segmentId) return null;

  const candidateIds = Array.from(
    new Set(
      [
        segmentId,
        cityId && !segmentId.includes("_") ? `${cityId}_${segmentId}` : null,
        segmentId.includes("_") ? segmentId.split("_").slice(1).join("_") : null,
      ].filter(Boolean)
    )
  );

  for (const candidateId of candidateIds) {
    const result = await client.query(
      `
        SELECT *
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
    const likeResult = await client.query(
      `
        SELECT *
        FROM public.segments
        WHERE id LIKE $1
        LIMIT 1
      `,
      [`%_${segmentId}`]
    );

    if (likeResult.rows[0]) {
      return likeResult.rows[0];
    }
  }

  return null;
};

const fetchFormBySegmentIdRow = async (segmentId) => {
  const directMatch = await fetchSingleRow(
    `
      SELECT *
      FROM public.forms
      WHERE segment_id = $1
      LIMIT 1
    `,
    [segmentId]
  );

  if (directMatch) {
    return directMatch;
  }

  const resolvedSegment = await resolveSegmentRecord(segmentId);
  if (!resolvedSegment || resolvedSegment.id === segmentId) {
    return null;
  }

  return fetchSingleRow(
    `
      SELECT *
      FROM public.forms
      WHERE segment_id = $1
      LIMIT 1
    `,
    [resolvedSegment.id]
  );
};

const fetchExistingFormIds = async (formIds) => {
  const result = await pool.query(
    `
      SELECT id
      FROM public.forms
      WHERE id = ANY($1::text[])
    `,
    [formIds]
  );
  return result.rows.map((row) => row.id);
};

const fetchReviewsForFormRows = async (formId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM public.reviews
      WHERE form_id = $1
    `,
    [formId]
  );
  return result.rows;
};

const fetchSegmentsForCityRows = async (cityId) => {
  let topLevelRows = [];

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.segments
        WHERE id_cidade = $1
          AND parent_segment_id IS NULL
          AND deleted_at IS NULL
      `,
      [cityId]
    );
    topLevelRows = result.rows;
  } catch (error) {
    if (hasMissingColumn(error, "deleted_at")) {
      const fallbackWithoutDeletedAt = await pool.query(
        `
          SELECT *
          FROM public.segments
          WHERE id_cidade = $1
            AND parent_segment_id IS NULL
        `,
        [cityId]
      );
      topLevelRows = fallbackWithoutDeletedAt.rows;
    } else {
      console.warn(
        "Error fetching top-level segments, falling back to all city segments:",
        error
      );
    }
  }

  if (topLevelRows.length > 0) {
    return topLevelRows;
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.segments
        WHERE id_cidade = $1
          AND deleted_at IS NULL
      `,
      [cityId]
    );
    return result.rows;
  } catch (error) {
    if (hasMissingColumn(error, "deleted_at")) {
      const fallbackWithoutDeletedAt = await pool.query(
        `
          SELECT *
          FROM public.segments
          WHERE id_cidade = $1
        `,
        [cityId]
      );
      return fallbackWithoutDeletedAt.rows;
    }

    throw error;
  }
};

const fetchDeletedSegmentsForCityRows = async (cityId) => {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.segments
        WHERE id_cidade = $1
          AND deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
        LIMIT 200
      `,
      [cityId]
    );
    return result.rows;
  } catch (error) {
    if (hasMissingColumn(error, "deleted_at")) {
      return [];
    }

    throw error;
  }
};

export const handleDbRequest = async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    const pathParts = requestUrl.pathname.split("/").filter(Boolean).map(decodePathPart);

    if (request.method === "GET" && requestUrl.pathname === "/api/db/states") {
      const states = await fetchDistinctStatesRows();
      json(response, 200, {
        states: states.map((row) => ({
          id: row.state,
          name: row.state,
        })),
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/db/cities") {
      const state = requestUrl.searchParams.get("state");
      const cities = state
        ? await fetchCitiesByStateRows(state)
        : await fetchAllCitiesRows();
      json(response, 200, { cities });
      return;
    }

    if (request.method === "GET" && pathParts[0] === "api" && pathParts[1] === "db") {
      if (pathParts[2] === "cities" && pathParts.length === 4) {
        const city = await fetchCityRow(pathParts[3]);
        json(response, 200, { city });
        return;
      }

      if (pathParts[2] === "segments" && pathParts[3] === "resolve" && pathParts.length === 5) {
        const resolved = await resolveSegmentRecord(pathParts[4], requestUrl.searchParams.get("cityId"));
        json(response, 200, {
          segment: resolved
            ? {
                dbId: resolved.id,
                cityId: resolved.id_cidade,
              }
            : null,
        });
        return;
      }

      if (pathParts[2] === "segments" && pathParts[3] === "city" && pathParts.length === 5) {
        const segments = await fetchSegmentsForCityRows(pathParts[4]);
        json(response, 200, { segments });
        return;
      }

      if (
        pathParts[2] === "segments" &&
        pathParts[3] === "city" &&
        pathParts[5] === "deleted" &&
        pathParts.length === 6
      ) {
        const segments = await fetchDeletedSegmentsForCityRows(pathParts[4]);
        json(response, 200, { segments });
        return;
      }

      if (pathParts[2] === "segments" && pathParts.length === 4) {
        const segment = await resolveSegmentRecord(
          pathParts[3],
          requestUrl.searchParams.get("cityId")
        );
        json(response, 200, { segment });
        return;
      }

      if (pathParts[2] === "forms" && pathParts[3] === "city" && pathParts.length === 5) {
        const forms = await fetchFormsByCityIdRows(pathParts[4]);
        json(response, 200, { forms });
        return;
      }

      if (pathParts[2] === "forms" && pathParts[3] === "exists" && pathParts.length === 4) {
        const ids = requestUrl.searchParams
          .getAll("id")
          .map((value) => value.trim())
          .filter(Boolean);
        const formIds = ids.length > 0 ? await fetchExistingFormIds(ids) : [];
        json(response, 200, { formIds });
        return;
      }

      if (
        pathParts[2] === "forms" &&
        pathParts[3] === "by-segment" &&
        pathParts.length === 5
      ) {
        const form = await fetchFormBySegmentIdRow(pathParts[4]);
        json(response, 200, { form });
        return;
      }

      if (pathParts[2] === "forms" && pathParts.length === 4) {
        const form = await fetchFormRow(pathParts[3]);
        json(response, 200, { form });
        return;
      }

      if (
        pathParts[2] === "reviews" &&
        pathParts[3] === "form" &&
        pathParts.length === 5
      ) {
        const reviews = await fetchReviewsForFormRows(pathParts[4]);
        json(response, 200, { reviews });
        return;
      }
    }

    notFound(response);
  } catch (error) {
    console.error("Erro na API de leitura do banco:", error);
    json(response, 500, {
      error: error instanceof Error ? error.message : "Erro interno do servidor.",
    });
  }
};
