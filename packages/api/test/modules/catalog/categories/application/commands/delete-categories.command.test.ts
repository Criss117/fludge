import { describe, expect, it, mock } from "bun:test";

import {
  HardDeleteCategoriesCommand,
  deleteCategoriesCommand,
} from "@fludge/api/modules/catalog/categories/application/commands/delete-categories.command";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const uuid1 = "00000000-0000-1000-8000-000000000001";

describe("deleteCategoriesCommand schema — ids", () => {
  it("accepts a non-empty array of valid UUIDs", () => {
    expect(deleteCategoriesCommand.safeParse({ ids: [uuid1] }).success).toBe(true);
  });

  it("accepts multiple UUIDs", () => {
    expect(
      deleteCategoriesCommand.safeParse({
        ids: [
          "00000000-0000-1000-8000-000000000001",
          "00000000-0000-1000-8000-000000000002",
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty ids array", () => {
    const result = deleteCategoriesCommand.safeParse({ ids: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "ids");
      expect(issue?.message).toBe("Debe especificar al menos un id de categoría");
    }
  });

  it("rejects missing ids", () => {
    expect(deleteCategoriesCommand.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid UUID inside the array", () => {
    const result = deleteCategoriesCommand.safeParse({ ids: ["not-a-uuid"] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Id de categoría no válido",
      );
      expect(issue).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  parentId: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

function makeCategory(overrides: Partial<CategoryRecord> = {}): CategoryRecord {
  return {
    id: "cat-1",
    name: "Bebidas",
    slug: "bebidas",
    organizationId: "org-1",
    parentId: null,
    createdBy: "mem-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function setup() {
  const findOneMock = mock(async () => ok(makeCategory()));
  const hasActiveChildrenMock = mock(async () => ok(0));
  const hardDeleteMock = mock(async () => ok(null));
  const transactionMock = mock(async (fn: (tx: unknown) => Promise<unknown>) => fn({}));

  const repo = {
    findOne: findOneMock,
    hasActiveChildren: hasActiveChildrenMock,
    hardDelete: hardDeleteMock,
    transaction: transactionMock,
  } as unknown as PGCategoriesCommandsRepository;

  const cmd = new HardDeleteCategoriesCommand(repo);

  return { repo, findOneMock, hasActiveChildrenMock, hardDeleteMock, transactionMock, cmd };
}

describe("HardDeleteCategoriesCommand handler", () => {
  it("deletes a single category when it has no active children", async () => {
    const { cmd, hardDeleteMock } = setup();

    const result = await cmd.execute({ ids: [uuid1], organizationId: "org-1" });

    expect(hardDeleteMock).toHaveBeenCalledTimes(1);
    expect(hardDeleteMock).toHaveBeenCalledWith(uuid1, "org-1", { tx: {} });
    expect(result).toBe(1);
  });

  it("deletes multiple categories and returns correct count", async () => {
    const { cmd, hardDeleteMock } = setup();

    const result = await cmd.execute({
      ids: [
        "00000000-0000-1000-8000-000000000001",
        "00000000-0000-1000-8000-000000000002",
      ],
      organizationId: "org-1",
    });

    expect(hardDeleteMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(2);
  });

  it("skips categories that are not found (already hard-deleted)", async () => {
    const findOneMock = mock(async () => ok(null));
    const hardDeleteMock = mock(async () => ok(null));

    const repo = {
      findOne: findOneMock,
      hasActiveChildren: async () => ok(0),
      hardDelete: hardDeleteMock,
      transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new HardDeleteCategoriesCommand(repo);

    const result = await cmd.execute({ ids: [uuid1], organizationId: "org-1" });

    expect(hardDeleteMock).not.toHaveBeenCalled();
    expect(result).toBe(0);
  });

  it("throws BAD_REQUEST when category has active children", async () => {
    const hasActiveChildrenMock = mock(async () => ok(3));

    const repo = {
      findOne: async () => ok(makeCategory({ name: "Bebidas" })),
      hasActiveChildren: hasActiveChildrenMock,
      hardDelete: async () => ok(null),
      transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new HardDeleteCategoriesCommand(repo);

    try {
      await cmd.execute({ ids: [uuid1], organizationId: "org-1" });
      expect.unreachable("Expected BAD_REQUEST");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Bebidas");
      expect(error.message).toContain("3");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when findOne returns error", async () => {
    const findOneMock = mock(async () => err(new Error("DB down")));

    const repo = {
      findOne: findOneMock,
      hasActiveChildren: async () => ok(0),
      hardDelete: async () => ok(null),
      transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new HardDeleteCategoriesCommand(repo);

    try {
      await cmd.execute({ ids: [uuid1], organizationId: "org-1" });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when hasActiveChildren returns error", async () => {
    const hasActiveChildrenMock = mock(async () => err(new Error("DB down")));

    const repo = {
      findOne: async () => ok(makeCategory()),
      hasActiveChildren: hasActiveChildrenMock,
      hardDelete: async () => ok(null),
      transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new HardDeleteCategoriesCommand(repo);

    try {
      await cmd.execute({ ids: [uuid1], organizationId: "org-1" });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when hardDelete returns error", async () => {
    const hardDeleteMock = mock(async () => err(new Error("DB down")));

    const repo = {
      findOne: async () => ok(makeCategory()),
      hasActiveChildren: async () => ok(0),
      hardDelete: hardDeleteMock,
      transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new HardDeleteCategoriesCommand(repo);

    try {
      await cmd.execute({ ids: [uuid1], organizationId: "org-1" });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("passes the transaction context to hasActiveChildren and hardDelete", async () => {
    const { cmd, hasActiveChildrenMock, hardDeleteMock } = setup();

    await cmd.execute({ ids: [uuid1], organizationId: "org-1" });

    expect(hasActiveChildrenMock).toHaveBeenCalledWith(uuid1, "org-1", { tx: {} });
    expect(hardDeleteMock).toHaveBeenCalledWith(uuid1, "org-1", { tx: {} });
  });
});