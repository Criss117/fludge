import { describe, expect, test } from "bun:test";

import { findSyncSaleQuery } from "@fludge/api/modules/sync/application/queries/find-sync-sale.query";

describe("findSyncSaleQuery schema", () => {
  test("defaults both cursors to null", () => {
    const parsed = findSyncSaleQuery.parse({});

    expect(parsed).toEqual({ sale: null, saleItem: null });
  });

  test("coerces ISO date strings into Date objects", () => {
    const parsed = findSyncSaleQuery.parse({
      sale: "2026-09-01T10:00:00.000Z",
      saleItem: "2026-09-02T10:00:00.000Z",
    });

    expect(parsed.sale).toEqual(new Date("2026-09-01T10:00:00.000Z"));
    expect(parsed.saleItem).toEqual(new Date("2026-09-02T10:00:00.000Z"));
  });

  test("accepts explicit null cursors", () => {
    const parsed = findSyncSaleQuery.parse({ sale: null, saleItem: null });

    expect(parsed).toEqual({ sale: null, saleItem: null });
  });
});
