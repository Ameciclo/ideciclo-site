import type { Database } from "./types";

type Primitive = string | number | boolean | null;

type QueryResult<T = any> = {
  data: T | null;
  error: any;
  status: number;
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const DATABASE_API_URL = import.meta.env.VITE_DATABASE_API_URL;

const resolveApiUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).toString();
  }

  return url;
};

const resolvedDatabaseApiUrl = resolveApiUrl(DATABASE_API_URL);

if (!resolvedDatabaseApiUrl) {
  throw new Error(
    "Env vars ausentes. Defina VITE_DATABASE_API_URL para conectar a API do banco de dados."
  );
}

const encodeInValue = (value: Primitive) => {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  const escaped = String(value).replace(/"/g, '\\"');
  return `"${escaped}"`;
};

class PostgrestQueryBuilder implements PromiseLike<QueryResult<any>> {
  private readonly baseUrl: string;
  private readonly table: string;
  private method: HttpMethod = "GET";
  private bodyPayload: any = undefined;
  private queryParams: URLSearchParams = new URLSearchParams();
  private returnRepresentation = false;
  private expectSingle = false;
  private expectMaybeSingle = false;

  constructor(baseUrl: string, table: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.table = table;
  }

  select(columns = "*") {
    this.queryParams.set("select", columns);
    if (this.method !== "GET") {
      this.returnRepresentation = true;
    }
    return this;
  }

  insert(payload: any) {
    this.method = "POST";
    this.bodyPayload = payload;
    return this;
  }

  update(payload: any) {
    this.method = "PATCH";
    this.bodyPayload = payload;
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  eq(column: string, value: Primitive) {
    this.queryParams.set(column, `eq.${value}`);
    return this;
  }

  is(column: string, value: Primitive) {
    if (value === null) {
      this.queryParams.set(column, "is.null");
      return this;
    }
    this.queryParams.set(column, `is.${value}`);
    return this;
  }

  in(column: string, values: Primitive[]) {
    const encodedValues = values.map((value) => encodeInValue(value)).join(",");
    this.queryParams.set(column, `in.(${encodedValues})`);
    return this;
  }

  like(column: string, pattern: string) {
    this.queryParams.set(column, `like.${pattern}`);
    return this;
  }

  not(column: string, operator: string, value: Primitive) {
    const valueText = value === null ? "null" : `${value}`;
    this.queryParams.set(column, `not.${operator}.${valueText}`);
    return this;
  }

  or(expression: string) {
    this.queryParams.set("or", `(${expression})`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? "desc" : "asc";
    this.queryParams.append("order", `${column}.${direction}`);
    return this;
  }

  limit(value: number) {
    this.queryParams.set("limit", String(value));
    return this;
  }

  single() {
    this.expectSingle = true;
    this.expectMaybeSingle = false;
    return this;
  }

  maybeSingle() {
    this.expectMaybeSingle = true;
    this.expectSingle = false;
    return this;
  }

  private async execute(): Promise<QueryResult<any>> {
    const url = `${this.baseUrl}/${this.table}?${this.queryParams.toString()}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.expectSingle || this.expectMaybeSingle) {
      headers.Accept = "application/vnd.pgrst.object+json";
    } else {
      headers.Accept = "application/json";
    }

    if (this.method !== "GET") {
      headers.Prefer = this.returnRepresentation
        ? "return=representation"
        : "return=minimal";
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: this.method,
        headers,
        body:
          this.method === "GET" || this.bodyPayload === undefined
            ? undefined
            : JSON.stringify(this.bodyPayload),
      });
    } catch (networkError) {
      return {
        data: null,
        error: {
          message: networkError instanceof Error ? networkError.message : "Network error",
        },
        status: 0,
      };
    }

    const responseText = await response.text();
    let parsed: any = null;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = { message: responseText };
      }
    }

    if (!response.ok) {
      if (this.expectMaybeSingle && response.status === 406) {
        return { data: null, error: null, status: response.status };
      }

      return {
        data: null,
        error:
          parsed ||
          ({
            message: response.statusText,
            code: response.status,
          } as any),
        status: response.status,
      };
    }

    return {
      data: parsed,
      error: null,
      status: response.status,
    };
  }

  then<TResult1 = QueryResult<any>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<any>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }
}

class PostgrestHttpClient {
  private readonly baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  from(table: string) {
    return new PostgrestQueryBuilder(this.baseUrl, table);
  }
}

export const databaseClient = new PostgrestHttpClient(
  resolvedDatabaseApiUrl
) as any;

export const authClient = {
  refreshSession: async () => ({
    data: { session: null },
    error: null,
  }),
};

export type { Database };
