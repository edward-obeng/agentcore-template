import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

type DbRecord = Record<string, unknown>;

function readTable(table: string): DbRecord[] {
  const raw = localStorage.getItem(`mockdb:${table}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DbRecord[]) : [];
  } catch {
    return [];
  }
}

function writeTable(table: string, rows: DbRecord[]) {
  localStorage.setItem(`mockdb:${table}`, JSON.stringify(rows));
}

type ActionType = "select" | "insert" | "delete";

class MockQueryBuilder {
  private table: string;
  private filters: Array<{ col: string; value: unknown }> = [];
  private orderBy: { col: string; ascending: boolean } | null = null;
  private action: ActionType = "select";
  private insertPayload: DbRecord[] = [];
  private wantSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns?: string) {
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending !== false };
    return this;
  }

  eq(col: string, value: unknown) {
    this.filters.push({ col, value });
    return this;
  }

  insert(payload: DbRecord | DbRecord[]) {
    this.action = "insert";
    this.insertPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  single() {
    this.wantSingle = true;
    return this.execute();
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private applyFilters(rows: DbRecord[]) {
    return rows.filter((r) => this.filters.every((f) => r[f.col] === f.value));
  }

  private applyOrder(rows: DbRecord[]) {
    if (!this.orderBy) return rows;
    const { col, ascending } = this.orderBy;
    const sorted = [...rows].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return String(av).localeCompare(String(bv));
    });
    return ascending ? sorted : sorted.reverse();
  }

  private normalizeInsert(row: DbRecord): DbRecord {
    const now = new Date().toISOString();
    return {
      ...row,
      id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
      created_at: typeof row.created_at === "string" ? row.created_at : now,
    };
  }

  private async execute(): Promise<
    { data: unknown; error: null } | { data: null; error: Error }
  > {
    try {
      const current = readTable(this.table);

      if (this.action === "select") {
        const filtered = this.applyOrder(this.applyFilters(current));
        return {
          data: this.wantSingle ? (filtered[0] ?? null) : filtered,
          error: null,
        };
      }

      if (this.action === "insert") {
        const normalized = this.insertPayload.map((r) =>
          this.normalizeInsert(r),
        );
        const next = [...current, ...normalized];
        writeTable(this.table, next);
        const inserted = normalized;
        return {
          data: this.wantSingle ? (inserted[0] ?? null) : inserted,
          error: null,
        };
      }

      if (this.action === "delete") {
        const remaining = current.filter(
          (r) => !this.filters.every((f) => r[f.col] === f.value),
        );
        writeTable(this.table, remaining);
        return { data: null, error: null };
      }

      return { data: null, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  }
}

class MockSupabaseClient {
  from(table: string) {
    return new MockQueryBuilder(table);
  }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (new MockSupabaseClient() as unknown);
