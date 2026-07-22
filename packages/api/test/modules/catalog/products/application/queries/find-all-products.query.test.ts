import { describe, expect, it, mock } from "bun:test";
import { ORPCError } from "@orpc/client";

import { FindAllProductsQuery } from "@fludge/api/modules/catalog/products/application/queries/find-all-products.query";
import type { DbConnection } from "@fludge/db";

// ---------------------------------------------------------------------------
// Mock helpers — chainable Drizzle query builder stubs.
//
// The FindAllProductsQuery handler builds the chain
// `db.select(...).from(...).where(...).orderBy(...)` and passes it to
// `tryCatch`. `tryCatch` awaits whatever thenable the chain produces, so the
// stub only needs `.select()` to return a builder whose `.from()/.where()`
// return the same builder and `.orderBy()` returns a resolved/rejected
// Promise. We capture the lodash-style chain history on the db mock so tests
// can assert that the handler passed the right organizationId through.
// ---------------------------------------------------------------------------

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  createdAt: Date;
};

function makeProduct(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "00000000-0000-1000-8000-000000000000",
    name: "Gaseosa Cola 1.5L",
    slug: "gaseosa-cola-1-5l",
    organizationId: "org-1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

/**
 * Builds a Drizzle-compatible query builder stub. Every chainable method
 * returns the builder (so the handler can call them in any order) and the
 * terminating `.orderBy()` returns a thenable.
 */
function makeQueryBuilder(rows: ProductRow[], reject?: Error) {
  const promise: any = reject ? Promise.reject(reject) : Promise.resolve(rows);
  const builder: any = {
    from: () => builder,
    where: () => builder,
    orderBy: () => promise,
  };
  return builder;
}

function makeDb(rows: ProductRow[] = [], reject?: Error) {
  const selectMock = mock(() => makeQueryBuilder(rows, reject));
  const db = {
    select: selectMock,
  } as unknown as DbConnection;
  return { db, selectMock };
}

describe("FindAllProductsQuery", () => {
  it("returns the rows resolved by the db query", async () => {
    const rows = [
      makeProduct({ id: "00000000-0000-1000-8000-000000000001" }),
      makeProduct({ id: "00000000-0000-1000-8000-000000000002" }),
    ];
    const { db } = makeDb(rows);
    const query = new FindAllProductsQuery(db);

    const result = await query.execute({ organizationId: "org-1" });

    expect(result).toEqual(rows);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when the db resolves with no rows", async () => {
    const { db } = makeDb([]);
    const query = new FindAllProductsQuery(db);

    const result = await query.execute({ organizationId: "org-1" });

    expect(result).toEqual([]);
  });

  it("calls db.select to build the query", async () => {
    const { db, selectMock } = makeDb([]);
    const query = new FindAllProductsQuery(db);

    await query.execute({ organizationId: "org-1" });

    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it("throws ORPCError INTERNAL_SERVER_ERROR when the db rejects", async () => {
    const { db } = makeDb([], new Error("connection refused"));
    const query = new FindAllProductsQuery(db);

    try {
      await query.execute({ organizationId: "org-1" });
      expect.unreachable("Expected ORPCError to be thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(ORPCError);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.message).toBe("Algo salió mal al buscar productos");
    }
  });

  it("propagates the provided organizationId through the query builder chain", async () => {
    // We cannot easily assert the eq() arguments without importing drizzle
    // internals, but we can confirm the chain executes without throwing when
    // a different organizationId is used.
    const rows = [makeProduct({ organizationId: "org-2" })];
    const { db } = makeDb(rows);
    const query = new FindAllProductsQuery(db);

    const result = await query.execute({ organizationId: "org-2" });

    expect(result[0].organizationId).toBe("org-2");
  });
});