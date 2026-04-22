// ─── Express / PostgreSQL client ──────────────────────────────────────────────
// Provides a query-builder API that routes all calls to the Express backend
// backed by PostgreSQL.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const TOKEN_KEY = "mongo_auth_token";
const USER_KEY = "mongo_auth_user";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null, user: any): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    /* ignore SSR */
  }
}

function getStoredUser(): any {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function dispatchAuthEvent(event: string, session: any): void {
  try {
    window.dispatchEvent(
      new CustomEvent("db:authStateChange", { detail: { event, session } }),
    );
  } catch {
    /* ignore SSR */
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    },
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text || "Unknown error" } };
  }
}

// ─── Query Builder ────────────────────────────────────────────────────────────

class QueryBuilder {
  private _table: string;
  private _filters: Array<{ op: string; field: string; value: any }> = [];
  private _selects: string = "*";
  private _orderBy: { field: string; ascending: boolean } | null = null;
  private _limitNum: number | null = null;
  private _isSingle: boolean = false;
  private _isMaybeSingle: boolean = false;
  private _isHead: boolean = false;
  private _countMode: string | null = null;
  private _operation: "select" | "insert" | "update" | "delete" | "upsert" =
    "select";
  private _data: any = null;
  private _upsertOn: string | null = null;
  private _returning: boolean = false;

  constructor(table: string) {
    this._table = table;
  }

  select(fields = "*", opts?: { head?: boolean; count?: string }): this {
    if (this._operation === "insert" || this._operation === "update" || this._operation === "upsert" || this._operation === "delete") {
      this._returning = true;
      return this;
    }
    this._operation = "select";
    this._selects = fields || "*";
    if (opts?.head) this._isHead = true;
    if (opts?.count) this._countMode = opts.count;
    return this;
  }

  eq(field: string, value: any): this {
    this._filters.push({ op: "eq", field, value });
    return this;
  }

  neq(field: string, value: any): this {
    this._filters.push({ op: "neq", field, value });
    return this;
  }

  gt(field: string, value: any): this {
    this._filters.push({ op: "gt", field, value });
    return this;
  }

  lt(field: string, value: any): this {
    this._filters.push({ op: "lt", field, value });
    return this;
  }

  gte(field: string, value: any): this {
    this._filters.push({ op: "gte", field, value });
    return this;
  }

  lte(field: string, value: any): this {
    this._filters.push({ op: "lte", field, value });
    return this;
  }

  like(field: string, value: any): this {
    this._filters.push({ op: "like", field, value });
    return this;
  }

  ilike(field: string, value: any): this {
    this._filters.push({ op: "ilike", field, value });
    return this;
  }

  in(field: string, values: any[]): this {
    this._filters.push({ op: "in", field, value: values });
    return this;
  }

  is(field: string, value: any): this {
    this._filters.push({ op: "is", field, value });
    return this;
  }

  or(filter: string): this {
    this._filters.push({ op: "or", field: "", value: filter });
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }): this {
    this._orderBy = { field, ascending: opts?.ascending !== false };
    return this;
  }

  limit(n: number): this {
    this._limitNum = n;
    return this;
  }

  insert(data: any): this {
    this._operation = "insert";
    this._data = data;
    return this;
  }

  update(data: any): this {
    this._operation = "update";
    this._data = data;
    return this;
  }

  delete(): this {
    this._operation = "delete";
    return this;
  }

  upsert(data: any, opts?: { onConflict?: string }): this {
    this._operation = "upsert";
    this._data = data;
    this._upsertOn = opts?.onConflict ?? null;
    return this;
  }

  single(): Promise<{ data: any; error: any }> {
    this._isSingle = true;
    return this._execute();
  }

  async maybeSingle(): Promise<{ data: any; error: any }> {
    this._isMaybeSingle = true;
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    const arr = Array.isArray(result.data)
      ? result.data
      : result.data != null
        ? [result.data]
        : [];
    return { data: arr[0] ?? null, error: null };
  }

  abortSignal(_signal: AbortSignal): this {
    return this;
  }

  then(resolve: (v: any) => any, reject?: (e: any) => any): Promise<any> {
    return this._execute().then(resolve, reject);
  }

  private async _execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const token = getToken();
      const baseHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      // ── SELECT ────────────────────────────────────────────────────────────
      if (this._operation === "select") {
        const params = new URLSearchParams();
        params.set("select", this._selects);
        if (this._filters.length > 0)
          params.set("filters", JSON.stringify(this._filters));
        if (this._orderBy) params.set("order", JSON.stringify(this._orderBy));
        if (this._limitNum !== null)
          params.set("limit", String(this._limitNum));
        if (this._isHead) params.set("head", "true");
        if (this._isSingle || this._isMaybeSingle) params.set("single", "true");
        if (this._countMode) params.set("count", this._countMode);

        const url = `${API_BASE}/api/db/${this._table}?${params.toString()}`;
        const res = await fetch(url, { headers: baseHeaders });
        const json = await res
          .json()
          .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));

        if (json.error)
          return { data: null, error: json.error, count: json.count };

        let data = json.data;
        const count = json.count;

        if (this._isSingle) {
          if (Array.isArray(data)) {
            if (data.length === 0)
              return {
                data: null,
                error: { message: "No rows found", code: "PGRST116" },
              };
            data = data[0];
          }
        } else if (this._isMaybeSingle) {
          if (Array.isArray(data)) {
            data = data.length > 0 ? data[0] : null;
          }
        }

        return { data: data ?? null, error: null, count };
      }

      // ── INSERT ────────────────────────────────────────────────────────────
      if (this._operation === "insert") {
        const res = await fetch(`${API_BASE}/api/db/${this._table}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...baseHeaders },
          body: JSON.stringify({ data: this._data, operation: "insert" }),
        });
        const json = await res
          .json()
          .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
        if (json.error) return { data: null, error: json.error };
        if (!this._returning) return { data: null, error: null };
        let data = json.data ?? null;
        if (data && !Array.isArray(data)) data = [data];
        if (this._isSingle) {
          if (!Array.isArray(data) || data.length === 0)
            return { data: null, error: { message: "No rows found", code: "PGRST116" } };
          data = data[0];
        } else if (this._isMaybeSingle) {
          data = Array.isArray(data) && data.length > 0 ? data[0] : null;
        }
        return { data, error: null };
      }

      // ── UPSERT ───────────────────────────────────────────────────────────
      if (this._operation === "upsert") {
        const body: any = { data: this._data, operation: "upsert" };
        if (this._upsertOn) body.onConflict = this._upsertOn;
        const res = await fetch(`${API_BASE}/api/db/${this._table}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...baseHeaders },
          body: JSON.stringify(body),
        });
        const json = await res
          .json()
          .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
        if (json.error) return { data: null, error: json.error };
        if (!this._returning) return { data: null, error: null };
        let data = json.data ?? null;
        if (data && !Array.isArray(data)) data = [data];
        if (this._isSingle) {
          if (!Array.isArray(data) || data.length === 0)
            return { data: null, error: { message: "No rows found", code: "PGRST116" } };
          data = data[0];
        } else if (this._isMaybeSingle) {
          data = Array.isArray(data) && data.length > 0 ? data[0] : null;
        }
        return { data, error: null };
      }

      // ── UPDATE ────────────────────────────────────────────────────────────
      if (this._operation === "update") {
        const res = await fetch(`${API_BASE}/api/db/${this._table}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...baseHeaders },
          body: JSON.stringify({ data: this._data, filters: this._filters }),
        });
        const json = await res
          .json()
          .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
        if (json.error) return { data: null, error: json.error };
        if (!this._returning) return { data: null, error: null };
        let data = json.data ?? null;
        if (data && !Array.isArray(data)) data = [data];
        if (this._isSingle) {
          if (!Array.isArray(data) || data.length === 0)
            return { data: null, error: { message: "No rows found", code: "PGRST116" } };
          data = data[0];
        } else if (this._isMaybeSingle) {
          data = Array.isArray(data) && data.length > 0 ? data[0] : null;
        }
        return { data, error: null };
      }

      // ── DELETE ────────────────────────────────────────────────────────────
      if (this._operation === "delete") {
        const res = await fetch(`${API_BASE}/api/db/${this._table}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...baseHeaders },
          body: JSON.stringify({ filters: this._filters }),
        });
        const json = await res
          .json()
          .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
        if (json.error) return { data: null, error: json.error };
        return { data: json.data ?? null, error: null };
      }

      return {
        data: null,
        error: { message: `Unknown operation: ${this._operation}` },
      };
    } catch (err: any) {
      return { data: null, error: { message: err?.message ?? String(err) } };
    }
  }
}

// ─── Auth module ──────────────────────────────────────────────────────────────

const auth = {
  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      const json = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (json.error)
        return { data: { user: null, session: null }, error: json.error };

      const session = json.data?.session ?? null;
      const user = json.data?.user ?? session?.user ?? null;
      const token = session?.access_token ?? null;

      setToken(token, user);
      if (token) dispatchAuthEvent("SIGNED_IN", session);

      return { data: { user, session }, error: null };
    } catch (err: any) {
      return {
        data: { user: null, session: null },
        error: { message: err?.message ?? String(err) },
      };
    }
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: { username?: string } };
  }) {
    try {
      const json = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, options }),
      });
      if (json.error)
        return { data: { user: null, session: null }, error: json.error };

      const session = json.data?.session ?? null;
      const user = json.data?.user ?? session?.user ?? null;
      const token = session?.access_token ?? null;

      setToken(token, user);
      if (token) dispatchAuthEvent("SIGNED_IN", session);

      return { data: { user, session }, error: null };
    } catch (err: any) {
      return {
        data: { user: null, session: null },
        error: { message: err?.message ?? String(err) },
      };
    }
  },

  async signOut(_opts?: { scope?: string }) {
    try {
      await apiFetch("/api/auth/logout", { method: "POST", body: "{}" });
    } catch {
      /* best-effort */
    }
    setToken(null, null);
    dispatchAuthEvent("SIGNED_OUT", null);
    return { error: null };
  },

  async getSession(): Promise<{ data: { session: any }; error: any }> {
    try {
      const token = getToken();
      if (!token) return { data: { session: null }, error: null };

      const json = await apiFetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` } as any,
      });
      if (json.error) return { data: { session: null }, error: json.error };

      return { data: { session: json.data?.session ?? null }, error: null };
    } catch (err: any) {
      return {
        data: { session: null },
        error: { message: err?.message ?? String(err) },
      };
    }
  },

  async getUser(): Promise<{ data: { user: any }; error: any }> {
    try {
      const token = getToken();
      if (!token) return { data: { user: null }, error: null };

      const json = await apiFetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` } as any,
      });
      if (json.error) return { data: { user: null }, error: json.error };

      return { data: { user: json.data?.user ?? null }, error: null };
    } catch (err: any) {
      return {
        data: { user: null },
        error: { message: err?.message ?? String(err) },
      };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      const token = getToken();
      const user = getStoredUser();
      const session = token ? { access_token: token, user } : null;
      setTimeout(() => callback("INITIAL_SESSION", session), 0);
    } catch {
      /* SSR */
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      callback(detail.event ?? "UNKNOWN", detail.session ?? null);
    };

    try {
      window.addEventListener("db:authStateChange", handler);
    } catch {
      /* SSR */
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            try {
              window.removeEventListener("db:authStateChange", handler);
            } catch {
              /* SSR */
            }
          },
        },
      },
    };
  },
};

// ─── Storage module ───────────────────────────────────────────────────────────

const storage = {
  from(bucket: string) {
    return {
      async upload(
        path: string,
        file: File,
        _opts?: any,
      ): Promise<{ data: { path: string } | null; error: any }> {
        try {
          const token = getToken();
          const form = new FormData();
          form.append("file", file);

          const headers: Record<string, string> = {};
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(
            `${API_BASE}/api/storage/${bucket}/upload?path=${encodeURIComponent(path)}`,
            { method: "POST", headers, body: form },
          );
          const json = await res
            .json()
            .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
          if (json.error) return { data: null, error: json.error };
          return { data: json.data ?? { path }, error: null };
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.message ?? String(err) },
          };
        }
      },

      getPublicUrl(filePath: string): { data: { publicUrl: string } } {
        const publicUrl = `${API_BASE}/uploads/${bucket}/${filePath}`;
        return { data: { publicUrl } };
      },

      async remove(paths: string[]): Promise<{ data: any; error: any }> {
        try {
          const token = getToken();
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(`${API_BASE}/api/storage/${bucket}/remove`, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ paths }),
          });
          const json = await res
            .json()
            .catch(() => ({ data: null, error: { message: "Invalid JSON" } }));
          if (json.error) return { data: null, error: json.error };
          return { data: json.data ?? null, error: null };
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.message ?? String(err) },
          };
        }
      },
    };
  },

  async listBuckets(): Promise<{ data: any[]; error: any }> {
    try {
      const json = await apiFetch("/api/storage/buckets");
      if (json.error) return { data: [], error: json.error };
      return { data: json.data ?? [], error: null };
    } catch (err: any) {
      return { data: [], error: { message: err?.message ?? String(err) } };
    }
  },
};

// ─── RPC ──────────────────────────────────────────────────────────────────────

const rpc = async (
  fnName: string,
  args?: any,
): Promise<{ data: any; error: any }> => {
  try {
    const json = await apiFetch(`/api/rpc/${fnName}`, {
      method: "POST",
      body: JSON.stringify(args ?? {}),
    });
    if (json.error) return { data: null, error: json.error };
    return { data: json.data ?? true, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message ?? String(err) } };
  }
};

// ─── Channel (no server-side realtime) ───────────────────────────────────────

const channel = (_name: string) => ({
  on: (..._args: any[]) => ({
    subscribe: () => ({ unsubscribe: () => {} }),
  }),
  subscribe: () => ({ unsubscribe: () => {} }),
});

// ─── Main client object ───────────────────────────────────────────────────────

export const dbClient = {
  auth,
  storage,
  rpc,
  channel,

  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  },
};

// Backward-compatible aliases
export const supabase = dbClient;
export { dbClient as db };

// ─── Connection check helpers ─────────────────────────────────────────────────

export const forceConnectionCheck = async (_force = true): Promise<boolean> => {
  try {
    const res = await fetch(
      `${API_BASE}/api/db/user_profiles?select=id&head=true&limit=1`,
    );
    return res.ok;
  } catch {
    return false;
  }
};

export const getConnectionStatus = (): boolean => true;

export default dbClient;
