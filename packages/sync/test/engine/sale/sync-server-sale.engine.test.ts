import { describe, expect, test } from "bun:test";

import { SyncServerSaleEngine } from "@fludge/sync/engine/sale/sync-server-sale.engine";
import type { ServerSyncSaleRepository } from "@fludge/sync/repositories/sale/server-sync-sale.repository";
import type { SaleSyncAllItems } from "@fludge/sync/types/sale.types";

const sales = [
  {
    id: "sale-1",
    saleNumber: "2026-000001",
    paymentType: "cash",
    total: 2000,
    status: "completed",
    organizationId: "org-1",
    updatedAt: new Date("2026-09-01T10:00:00Z"),
  },
];

const saleItems = [
  {
    id: "sale-item-1",
    saleId: "sale-1",
    productPresentationName: "Espresso 250g",
    productPresentationPrice: 1000,
    quantity: 2,
    subtotal: 2000,
    organizationId: "org-1",
    updatedAt: new Date("2026-09-01T10:00:00Z"),
  },
];

describe("SyncServerSaleEngine", () => {
  test("delegates the delta fetch to the server sync repository", async () => {
    const values: SaleSyncAllItems = { sales, saleItems };

    const calls: {
      organizationIds: string[];
      lastSyncedAt: { sale: Date | null; saleItem: Date | null };
    }[] = [];

    const repository: ServerSyncSaleRepository = {
      findAllItems: async (organizationIds, lastSyncedAt) => {
        calls.push({ organizationIds, lastSyncedAt });

        return values;
      },
    };

    const engine = new SyncServerSaleEngine(repository);

    const result = await engine.getLastSyncedAt(["org-1"], {
      sale: new Date("2026-08-31T00:00:00Z"),
      saleItem: null,
    });

    expect(calls).toEqual([
      {
        organizationIds: ["org-1"],
        lastSyncedAt: {
          sale: new Date("2026-08-31T00:00:00Z"),
          saleItem: null,
        },
      },
    ]);
    expect(result).toEqual({ sales, saleItems });
  });

  test("returns empty collections when there is nothing to sync", async () => {
    const repository: ServerSyncSaleRepository = {
      findAllItems: async () => ({ sales: [], saleItems: [] }),
    };

    const engine = new SyncServerSaleEngine(repository);

    const result = await engine.getLastSyncedAt(["org-1"], {
      sale: null,
      saleItem: null,
    });

    expect(result).toEqual({ sales: [], saleItems: [] });
  });
});
