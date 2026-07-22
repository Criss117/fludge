import { describe, expect, it, mock } from "bun:test";
import { ORPCError } from "@orpc/client";

import { FindAllCategoriesQuery } from "@fludge/api/modules/catalog/categories/application/queries/find-all-categories.query";
import type { DbConnection } from "@fludge/db";

// ---------------------------------------------------------------------------
// Mock helpers — chainable Drizzle query builder stubs.
// ---------------------------------------------------------------------------

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  parentId: string | null;
  createdAt: Date;
};

function makeCategory(overrides: Partial<CategoryRow> = {}): CategoryRow {
  return {
    id: "00000000-0000-1000-8000-000000000000",
    name: "Bebidas",
    slug: "bebidas",
    organizationId: "org-1",
    parentId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeQueryBuilder(rows: CategoryRow[], reject?: Error) {
  const promise: any = reject ? Promise.reject(reject) : Promise.resolve(rows);
  const builder: any = {
    from: () => builder,
    where: () => builder,
    orderBy: () => promise,
  };
  return builder;
}

function makeDb(rows: CategoryRow[] = [], reject?: Error) {
  const selectMock = mock(() => makeQueryBuilder(rows, reject));
  const db = {
    select: selectMock,
  } as unknown as DbConnection;
  return { db, selectMock };
}

describe("FindAllCategoriesQuery", () => {
  it("returns the rows resolved by the db query", async () => {
    const rows = [
      makeCategory({ id: "00000000-0000-1000-8000-000000000001", name: "Bebidas" }),
      makeCategory({ id: "00000000-0000-1000-8000-000000000002", name: " alimentos" }),
    ];
    const { db } = makeDb(rows);
    const query = new FindAllCategoriesQuery(db);

    const result = await query.execute({ organizationId: "org-1" });

    expect(result).toEqual(rows);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when the db resolves with no rows", async () => {
    const { db } = makeDb([]);
    const query = new FindAllCategoriesQuery(db);

    const result = await query.execute({ organizationId: "org-1" });

    expect(result).toEqual([]);
  });

  it("calls db.select to build the query", async () => {
    const { db, selectMock } = makeDb([]);
    const query = new FindAllCategoriesQuery(db);

    await query.execute({ organizationId: "org-1" });

    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it("throws ORPCError INTERNAL_SERVER_ERROR when the db rejects", async () => {
    const { db } = makeDb([], new Error("connection refused"));
    const query = new FindAllCategoriesQuery(db);

    try {
      await query.execute({ organizationId: "org-1" });
      expect.unreachable("Expected ORPCError to be thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(ORPCError);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.message).toBe("Algo salió mal al buscar categorías");
    }
  });

  it("scopes the result rows to the provided organizationId", async () => {
    const rows = [makeCategory({ organizationId: "org-2" })];
    const { db } = makeDb(rows);
    const query = new FindAllCategoriesQuery(db);

    const result = await query.execute({ organizationId: "org-2" });

    expect(result[0].organizationId).toBe("org-2");
  });
});