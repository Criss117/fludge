import { describe, expect, it, mock } from "bun:test";

import { PGProductsCommandsRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-products-commands.repository";
import type { DbConnection } from "@fludge/db";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Mock helpers — Drizzle-style chainable builder stubs.
//
// The repository builds chains like:
//   db.insert(table).values(...).returning().execute()        -> Promise<rows[]>
//   db.select({...}).from(table).where(...).limit(1).execute() -> Promise<rows[]>
//   db.update(table).set(...).where(...).returning().execute()  -> Promise<rows[]>
//   db.delete(table).where(...).execute()                      -> Promise<void>
//   db.delete(table).where(...).returning(...).execute()       -> Promise<rows[]>
//
// Every builder stub records its own tag so we can assert internally which
// operations were called (insert vs select, etc.) if needed. The final
// `.execute()` returns whatever Promise the test supplied.
// ---------------------------------------------------------------------------

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  barcode: string | null;
  sku: string | null;
  status: string;
  createdAt: Date;
};

function makeProduct(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "00000000-0000-1000-8000-000000000000",
    name: "Gaseosa Cola 1.5L",
    slug: "gaseosa-cola-1-5l",
    organizationId: "org-1",
    barcode: "7791234567890",
    sku: null,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

/**
 * Builds a chainable builder whose terminal `.execute()` resolves to `rows`
 * (or rejects with `reject`). Designed to support every chain shape the repo
 * uses. `.returning()` and `.execute()` mutate the resolve target via chained
 * flag calls, but for the stub we just always return the supplied rows.
 */
function makeBuilder(resolve: any, reject?: Error) {
  const promise: any = reject ? Promise.reject(reject) : Promise.resolve(resolve);
  const builder: any = {
    values: () => builder,
    onConflictDoUpdate: () => builder,
    set: () => builder,
    from: () => builder,
    where: () => builder,
    returning: () => builder,
    limit: () => builder,
    execute: () => promise,
  };
  return builder;
}

function makeDb(reject?: Error, rows: any[] = []) {
  // primary builder factory — `.from()` lazy attribute on each call returns fresh
  // builder instances so per-test `resolve` overrides work cleanly.
  const factory = (resolve: any) => () => makeBuilder(resolve, reject);

  // Default resolve: return the supplied row set (used by `.insert().returning()`,
  // `.update().returning()`, `.select().limit(1)`, etc.).
  // Per-test factory customization happens inline via `.mockReturnValueOnce`.

  const resolveRef: { current: any } = { current: rows };
  const builderFactory = () => makeBuilder(resolveRef.current, reject);

  const dbMock: any = {
    insert: mock(builderFactory),
    select: mock(builderFactory),
    update: mock(builderFactory),
    delete: mock(builderFactory),
    transaction: (fn: (tx: any) => Promise<any>) =>
      fn({
        insert: mock(builderFactory),
        select: mock(builderFactory),
        update: mock(builderFactory),
        delete: mock(builderFactory),
      }),
  };

  return { db: dbMock as unknown as DbConnection, resolveRef };
}

describe("PGProductsCommandsRepository-save", () => {
  it("returns ok(created) when insert succeeds and a row was created", async () => {
    const product = makeProduct();
    const { db } = makeDb(undefined, [product]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.save({
      name: "Gaseosa Cola 1.5L",
      slug: "gaseosa-cola-1-5l",
      organizationId: "org-1",
      priceRetail: "15",
      pricePurchase: "10",
      priceWholesale: "8",
      barcode: "7791234567890",
      createdBy: "mem-1",
    } as never);

    expect(result).toEqual([product, null]);
  });

  it("returns err(Error) when insert rejects", async () => {
    const { db } = makeDb(new Error("unique constraint violation"));
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "X",
        slug: "x",
        organizationId: "org-1",
        priceRetail: "1",
        pricePurchase: "1",
        priceWholesale: "1",
        createdBy: "mem-1",
      } as never,
    );

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("unique constraint violation");
  });

  it("returns err('Error creando producto') when insert returns no rows", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "X",
        slug: "x",
        organizationId: "org-1",
        priceRetail: "1",
        pricePurchase: "1",
        priceWholesale: "1",
        createdBy: "mem-1",
      } as never,
    );

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("Error creando producto");
  });

  it("uses options.tx when provided", async () => {
    const txProduct = makeProduct({ id: "tx-id" });
    const txBuilder = makeBuilder([txProduct]);
    const tx = {
      insert: mock(() => txBuilder),
      select: mock(() => txBuilder),
      update: mock(() => txBuilder),
      delete: mock(() => txBuilder),
    } as any;
    const { db } = makeDb(undefined, [makeProduct()]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "X",
        slug: "x",
        organizationId: "org-1",
        priceRetail: "1",
        pricePurchase: "1",
        priceWholesale: "1",
        createdBy: "mem-1",
      } as never,
      { tx },
    );

    expect(result).toEqual([txProduct, null]);
    expect(tx.insert).toHaveBeenCalledTimes(1);
  });
});

describe("PGProductsCommandsRepository-insertInventoryMovement", () => {
  it("returns ok(created) when insert succeeds", async () => {
    const movement = { id: "mv-1" } as never;
    const { db } = makeDb(undefined, [movement]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.insertInventoryMovement({
      productId: "p-1",
      quantity: 5,
      type: "in",
    } as never);

    expect(result).toEqual(ok(movement));
  });

  it("returns err(Error) when insert rejects", async () => {
    const { db } = makeDb(new Error("FK violation"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.insertInventoryMovement({
      productId: "p-1",
      quantity: 1,
      type: "in",
    } as never);

    expect(data).toBeNull();
    expect((error as Error).message).toBe("FK violation");
  });

  it("returns err('Error creando movimiento de inventario') when no row is returned", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.insertInventoryMovement({
      productId: "p-1",
      quantity: 1,
      type: "in",
    } as never);

    expect(data).toBeNull();
    expect((error as Error).message).toBe(
      "Error creando movimiento de inventario",
    );
  });
});

describe("PGProductsCommandsRepository-findOne", () => {
  it("returns ok(row) when the product exists", async () => {
    const product = makeProduct();
    const { db } = makeDb(undefined, [product]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.findOne(product.id, product.organizationId);

    expect(result).toEqual(ok(product));
  });

  it("returns ok(null) when no rows match", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.findOne("missing-id", "org-none");

    expect(result).toEqual(ok(null));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("connection lost"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.findOne("p-1", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("connection lost");
  });
});

describe("PGProductsCommandsRepository-update", () => {
  it("returns ok(updated) when an update target is found", async () => {
    const updated = makeProduct({ name: "Updated" });
    const { db } = makeDb(undefined, [updated]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.update("p-1", "org-1", { name: "Updated" } as never);

    expect(result).toEqual(ok(updated));
  });

  it("returns ok(null) when no row was updated", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.update("missing-id", "org-1", { name: "X" } as never);

    expect(result).toEqual(ok(null));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("update failed"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.update("p-1", "org-1", { name: "X" } as never);

    expect(data).toBeNull();
    expect((error as Error).message).toBe("update failed");
  });

  it("uses options.tx when provided", async () => {
    const txUpdated = makeProduct({ name: "from-tx" });
    const txBuilder = makeBuilder([txUpdated]);
    const tx = {
      insert: mock(() => txBuilder),
      select: mock(() => txBuilder),
      update: mock(() => txBuilder),
      delete: mock(() => txBuilder),
    } as any;
    const { db } = makeDb(undefined, [makeProduct()]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.update(
      "p-1",
      "org-1",
      { name: "from-tx" } as never,
      { tx },
    );

    expect(result).toEqual(ok(txUpdated));
    expect(tx.update).toHaveBeenCalledTimes(1);
  });
});

describe("PGProductsCommandsRepository-slugAvailable", () => {
  it("returns ok(true) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.slugAvailable("free-slug", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns ok(false) when a matching row exists", async () => {
    const { db } = makeDb(undefined, [{ id: "p-1" }]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.slugAvailable("taken-slug", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.slugAvailable("s", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGProductsCommandsRepository-nameExists", () => {
  it("returns ok(false) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.nameExists("Free Name", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("returns ok(true) when a matching row exists", async () => {
    const { db } = makeDb(undefined, [{ id: "p-1" }]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.nameExists("Taken Name", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.nameExists("X", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGProductsCommandsRepository-barcodeExists", () => {
  it("returns ok(false) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.barcodeExists("7790000000000", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("returns ok(true) when a matching row exists", async () => {
    const { db } = makeDb(undefined, [{ id: "p-1" }]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.barcodeExists("7790000000000", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.barcodeExists("X", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGProductsCommandsRepository-skuExists", () => {
  it("returns ok(false) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.skuExists("SKU-FREE", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("returns ok(true) when a matching row exists", async () => {
    const { db } = makeDb(undefined, [{ id: "p-1" }]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.skuExists("SKU-TAKEN", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.skuExists("X", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGProductsCommandsRepository-hardDelete", () => {
  it("returns ok(count) when the transaction succeeds (count from returned rows)", async () => {
    // hardDelete runs two operations inside a transaction.
    // builder 1: tx.delete(inventoryMovement).where(...).execute() — awaited, void.
    // builder 2: tx.delete(product).where(...).returning(...).execute() — returns rows.
    const returningRows = [{ id: "p-1" }, { id: "p-2" }];
    let deleteCallCount = 0;
    const tx: any = {
      delete: mock(() => {
        deleteCallCount += 1;
        // First call (inventoryMovement): no .returning() needed, executes void
        // Second call (product): has .returning(), resolves with rows
        return deleteCallCount === 1
          ? makeBuilder(undefined)
          : makeBuilder(returningRows);
      }),
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
    };

    // The repo's hardDelete calls `this.transaction(fn)` — the base class's
    // `transaction` calls `this.connection.transaction(fn)` with `tx`.
    // Here we provide a db whose transaction synchronously invokes fn(tx).
    const txHandled: any = {
      delete: tx.delete,
      insert: tx.insert,
      select: tx.select,
      update: tx.update,
    };

    const db = {
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
      delete: mock(() => makeBuilder([])),
      transaction: (fn: (txConnection: any) => Promise<any>) => fn(txHandled),
    } as unknown as DbConnection;

    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.hardDelete("org-1", ["p-1", "p-2"]);

    expect(result).toEqual(ok(2));
  });

  it("returns ok(0) when no products are deleted", async () => {
    const tx: any = {
      delete: mock(() => makeBuilder([])),
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
    };

    const db = {
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
      delete: mock(() => makeBuilder([])),
      transaction: (fn: (txConnection: any) => Promise<any>) => fn(tx),
    } as unknown as DbConnection;

    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.hardDelete("org-1", ["p-1"]);

    expect(result).toEqual(ok(0));
  });

  it("returns err(Error) when the product delete inside the transaction rejects", async () => {
    // First tx.delete (inventoryMovement).execute() must resolve; the second
    // (products returning) must reject so tryCatch captures it.
    const movementDelete = makeBuilder(undefined);
    const productDeleteReject = makeBuilder([], new Error("delete failed"));

    let deleteCallCount = 0;
    const tx: any = {
      delete: mock(() => {
        deleteCallCount += 1;
        return deleteCallCount === 1 ? movementDelete : productDeleteReject;
      }),
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
    };

    const db = {
      insert: mock(() => makeBuilder([])),
      select: mock(() => makeBuilder([])),
      update: mock(() => makeBuilder([])),
      delete: mock(() => makeBuilder([])),
      transaction: (fn: (txConnection: any) => Promise<any>) => fn(tx),
    } as unknown as DbConnection;

    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.hardDelete("org-1", ["p-1"]);

    expect(data).toBeNull();
    expect((error as Error).message).toBe("delete failed");
  });
});

describe("PGProductsCommandsRepository-checkUniqueFields", () => {
  it("returns all-false when there are no fields to compare", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.checkUniqueFields({}, "org-1");

    expect(result).toEqual(
      ok({
        slugTaken: false,
        nameTaken: false,
        barcodeTaken: false,
        skuTaken: false,
      }),
    );
  });

  it("returns all-false when no rows match any of the or conditions", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.checkUniqueFields(
      { slug: "free", name: "free", barcode: "free", sku: "free" },
      "org-1",
    );

    expect(result).toEqual(
      ok({
        slugTaken: false,
        nameTaken: false,
        barcodeTaken: false,
        skuTaken: false,
      }),
    );
  });

  it("flags slugTaken when a row with the same slug exists", async () => {
    const { db } = makeDb(undefined, [
      {
        id: "p-1",
        slug: "taken-slug",
        name: "other",
        barcode: null,
        sku: null,
      },
    ]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.checkUniqueFields({ slug: "taken-slug" }, "org-1");

    expect(result).toEqual(
      ok({
        slugTaken: true,
        nameTaken: false,
        barcodeTaken: false,
        skuTaken: false,
      }),
    );
  });

  it("flags nameTaken, barcodeTaken, and skuTaken in a single query when all those rows exist", async () => {
    const { db } = makeDb(undefined, [
      { id: "p-1", slug: "s1", name: "Taken Name", barcode: "BAR-1", sku: null },
      { id: "p-2", slug: "s2", name: "X", barcode: "X", sku: "SKU-X" },
    ]);
    const repo = new PGProductsCommandsRepository(db);

    const result = await repo.checkUniqueFields(
      {
        slug: "free",
        name: "Taken Name",
        barcode: "BAR-1",
        sku: "SKU-X",
      },
      "org-1",
    );

    expect(result).toEqual(
      ok({
        slugTaken: false,
        nameTaken: true,
        barcodeTaken: true,
        skuTaken: true,
      }),
    );
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGProductsCommandsRepository(db);

    const [data, error] = await repo.checkUniqueFields(
      { slug: "s", name: "n", barcode: "b", sku: "k" },
      "org-1",
    );

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});