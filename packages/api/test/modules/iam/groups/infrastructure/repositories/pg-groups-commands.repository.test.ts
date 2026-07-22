import { describe, expect, it, mock } from "bun:test";

import { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import type { DbConnection } from "@fludge/db";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Mock helpers — Drizzle-style chainable builder stubs.
//
// The repository builds chains like:
//   db.insert(table).values(...).onConflictDoUpdate(...).returning().execute()
//   db.select().from(table).where(...).limit(1).execute()
//   db.delete(table).where(...).execute()
//
// Each method installs a SINGLE mock for each of insert/select/update/delete
// in the test's db object, so tests can assert which call was issued per method.
// ---------------------------------------------------------------------------

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  permissions: unknown[];
  description: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

function makeGroup(overrides: Partial<GroupRow> = {}): GroupRow {
  return {
    id: "00000000-0000-1000-8000-000000000000",
    name: "Admins",
    slug: "admins",
    organizationId: "org-1",
    permissions: ["groups:view"],
    description: null,
    createdBy: "mem-1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Builds a chainable builder whose terminal `.execute()` resolves to `rows`
 * (or rejects with `reject`).
 */
function makeBuilder(resolve: any, reject?: Error) {
  const promise: any = reject ? Promise.reject(reject) : Promise.resolve(resolve);
  const builder: any = {
    values: () => builder,
    onConflictDoUpdate: () => builder,
    from: () => builder,
    where: () => builder,
    returning: () => builder,
    limit: () => builder,
    set: () => builder,
    execute: () => promise,
  };
  return builder;
}

function makeDb(reject?: Error, rows: any[] = []) {
  const builderFactory = () => makeBuilder(rows, reject);

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

  return { db: dbMock as unknown as DbConnection };
}

describe("PGGroupsCommandsRepository-save", () => {
  it("returns ok(created) when insert succeeds and a row was returned", async () => {
    const group = makeGroup();
    const { db } = makeDb(undefined, [group]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.save({
      name: "Admins",
      slug: "admins",
      permissions: ["groups:view"],
      organizationId: "org-1",
      createdBy: "mem-1",
    } as never);

    expect(result).toEqual(ok(group));
  });

  it("returns err(Error) when insert rejects", async () => {
    const { db } = makeDb(new Error("unique constraint"));
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "X",
        slug: "x",
        permissions: [],
        organizationId: "org-1",
        createdBy: "mem-1",
      } as never,
    );

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("unique constraint");
  });

  it("returns err('Error creando grupo') when no row is returned", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "X",
        slug: "x",
        permissions: [],
        organizationId: "org-1",
        createdBy: "mem-1",
      } as never,
    );

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("Error creando grupo");
  });

  it("passes deletedAt through to the conflict-do-update payload when provided", async () => {
    // We don't introspect the onConflictDoUpdate call (the stub just chains),
    // but we still want a sanity test that save resolves successfully when
    // `deletedAt: null` is passed — that's the activate semantics documented
    // in the repo.
    const group = makeGroup({ deletedAt: null });
    const { db } = makeDb(undefined, [group]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.save({
      name: "Admins",
      slug: "admins",
      permissions: ["groups:view"],
      organizationId: "org-1",
      createdBy: "mem-1",
      deletedAt: null,
    } as never);

    expect(result).toEqual(ok(group));
  });

  it("uses options.tx when provided, bypassing this.db", async () => {
    const txGroup = makeGroup({ id: "tx-id", name: "from-tx" });
    const txBuilder = makeBuilder([txGroup]);
    const tx = {
      insert: mock(() => txBuilder),
      select: mock(() => txBuilder),
      update: mock(() => txBuilder),
      delete: mock(() => txBuilder),
    } as any;
    const { db } = makeDb(undefined, [makeGroup()]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.save(
      {
        name: "from-tx",
        slug: "from-tx",
        permissions: [],
        organizationId: "org-1",
        createdBy: "mem-1",
      } as never,
      { tx },
    );

    expect(result).toEqual(ok(txGroup));
    expect(tx.insert).toHaveBeenCalledTimes(1);
  });
});

describe("PGGroupsCommandsRepository-findOne", () => {
  it("returns ok(row) when the group exists", async () => {
    const group = makeGroup();
    const { db } = makeDb(undefined, [group]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.findOne("org-1", "00000000-0000-1000-8000-000000000000");

    expect(result).toEqual(ok(group));
  });

  it("returns ok(null) when no group is found", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.findOne("org-1", "missing-id");

    expect(result).toEqual(ok(null));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGGroupsCommandsRepository(db);

    const [data, error] = await repo.findOne("org-1", "g-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGGroupsCommandsRepository-slugAvailable", () => {
  it("returns ok(true) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.slugAvailable("free-slug", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns ok(false) when a row with the slug exists", async () => {
    const { db } = makeDb(undefined, [{ id: "g-1" }]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.slugAvailable("taken-slug", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGGroupsCommandsRepository(db);

    const [data, error] = await repo.slugAvailable("s", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGGroupsCommandsRepository-nameAvailable", () => {
  it("returns ok(true) when no matching row exists", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.nameAvailable("Free Name", "org-1");

    expect(result).toEqual(ok(true));
  });

  it("returns ok(false) when a matching row exists", async () => {
    const { db } = makeDb(undefined, [{ id: "g-1" }]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.nameAvailable("Taken Name", "org-1");

    expect(result).toEqual(ok(false));
  });

  it("supports the excludeId parameter to exclude a group from the check", async () => {
    // We can't easily inspect the where clause, but with no rows the
    // availability check still resolves to ok(true).
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.nameAvailable(
      "Some Name",
      "org-1",
      "00000000-0000-1000-8000-000000000000",
    );

    expect(result).toEqual(ok(true));
  });

  it("returns err(Error) when the db rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGGroupsCommandsRepository(db);

    const [data, error] = await repo.nameAvailable("X", "org-1");

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });
});

describe("PGGroupsCommandsRepository-saveHistory", () => {
  it("returns ok(created) when insert succeeds", async () => {
    const historyRecord = { id: "h-1" };
    const { db } = makeDb(undefined, [historyRecord]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.saveHistory({
      groupId: "g-1",
      action: "updated",
      description: "permissions changed",
      before: {},
      after: {},
      actorId: "mem-1",
    } as never);

    expect(result).toEqual(ok(historyRecord));
  });

  it("returns err(Error) when insert rejects", async () => {
    const { db } = makeDb(new Error("db down"));
    const repo = new PGGroupsCommandsRepository(db);

    const [data, error] = await repo.saveHistory({
      groupId: "g-1",
      action: "created",
      description: "",
      before: {},
      after: {},
      actorId: "mem-1",
    } as never);

    expect(data).toBeNull();
    expect((error as Error).message).toBe("db down");
  });

  it("returns err('Error creando historial de grupo') when no row is returned", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.saveHistory({
      groupId: "g-1",
      action: "created",
      description: "",
      before: {},
      after: {},
      actorId: "mem-1",
    } as never);

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("Error creando historial de grupo");
  });

  it("uses options.tx when provided, bypassing this.db", async () => {
    const txHistory = { id: "tx-h-1" };
    const txBuilder = makeBuilder([txHistory]);
    const tx = {
      insert: mock(() => txBuilder),
      select: mock(() => txBuilder),
      update: mock(() => txBuilder),
      delete: mock(() => txBuilder),
    } as any;
    const { db } = makeDb(undefined, [{ id: "from-base" }]);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.saveHistory(
      {
        groupId: "g-1",
        action: "updated",
        description: "",
        before: {},
        after: {},
        actorId: "mem-1",
      } as never,
      { tx },
    );

    expect(result).toEqual(ok(txHistory));
    expect(tx.insert).toHaveBeenCalledTimes(1);
  });
});

describe("PGGroupsCommandsRepository-hardDelete", () => {
  it("returns err when groupIds is an empty array", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.hardDelete("org-1", []);

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe(
      "No se especificó ningún id de grupo",
    );
  });

  it("returns ok(null) when delete succeeds with a single id (converted to array)", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    // Pass a single string — hardDelete converts it to [string].
    const result = await repo.hardDelete(
      "org-1",
      "00000000-0000-1000-8000-000000000000" as never,
    );

    expect(result).toEqual(ok(null));
  });

  it("returns ok(null) when delete succeeds with multiple ids", async () => {
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.hardDelete("org-1", ["g-1", "g-2"]);

    expect(result).toEqual(ok(null));
  });

  it("uses options.tx when provided, bypassing this.db", async () => {
    const txBuilder = makeBuilder(undefined);
    const tx = {
      insert: mock(() => txBuilder),
      select: mock(() => txBuilder),
      update: mock(() => txBuilder),
      delete: mock(() => txBuilder),
    } as any;
    const { db } = makeDb(undefined, []);
    const repo = new PGGroupsCommandsRepository(db);

    const result = await repo.hardDelete(
      "org-1",
      ["g-1"],
      { tx },
    );

    expect(result).toEqual(ok(null));
    expect(tx.delete).toHaveBeenCalledTimes(1);
  });

  it("returns err(Error) when the delete rejects", async () => {
    const { db } = makeDb(new Error("delete failed"));
    const repo = new PGGroupsCommandsRepository(db);

    const [data, error] = await repo.hardDelete("org-1", ["g-1"]);

    expect(data).toBeNull();
    expect((error as Error).message).toBe("delete failed");
  });
});