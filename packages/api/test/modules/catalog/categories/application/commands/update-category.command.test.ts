import { describe, expect, it, mock } from "bun:test";

import {
  UpdateCategoryCommand,
  updateCategoryCommand,
} from "@fludge/api/modules/catalog/categories/application/commands/update-category.command";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const uuid = "00000000-0000-1000-8000-000000000000";

describe("updateCategoryCommand schema — id", () => {
  it("requires a valid UUID id", () => {
    expect(updateCategoryCommand.safeParse({ id: "not-a-uuid", name: "Bebidas" }).success).toBe(false);
  });

  it("requires id to be present", () => {
    expect(updateCategoryCommand.safeParse({ name: "Bebidas" }).success).toBe(false);
  });
});

describe("updateCategoryCommand schema — at-least-one-field refine", () => {
  it("rejects when only id is provided (no name, parentId, or deletedAt)", () => {
    const result = updateCategoryCommand.safeParse({ id: uuid });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message.includes("actualizar"));
      expect(issue).toBeDefined();
    }
  });

  it("accepts when name is provided", () => {
    expect(updateCategoryCommand.safeParse({ id: uuid, name: "Bebidas" }).success).toBe(true);
  });

  it("accepts when parentId is provided (null to clear)", () => {
    expect(updateCategoryCommand.safeParse({ id: uuid, parentId: null }).success).toBe(true);
  });

  it("accepts when deletedAt is provided (null to activate)", () => {
    expect(updateCategoryCommand.safeParse({ id: uuid, deletedAt: null }).success).toBe(true);
  });

  it("accepts when deletedAt is a Date (to deactivate)", () => {
    expect(
      updateCategoryCommand.safeParse({ id: uuid, deletedAt: new Date("2026-01-01") }).success,
    ).toBe(true);
  });
});

describe("updateCategoryCommand schema — name length still enforced", () => {
  it("rejects name shorter than 3 chars", () => {
    const result = updateCategoryCommand.safeParse({ id: uuid, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 chars", () => {
    const result = updateCategoryCommand.safeParse({ id: uuid, name: "x".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("accepts valid name length when provided", () => {
    expect(updateCategoryCommand.safeParse({ id: uuid, name: "Bebidas" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

type ExistingCategory = {
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

function makeExisting(overrides: Partial<ExistingCategory> = {}): ExistingCategory {
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

function setup(existing: ExistingCategory) {
  const updateMock = mock(async () => ok({ ...existing, ...makeExisting() }));
  const findOneMock = mock(async () => ok(existing));

  const repo = {
    findOne: findOneMock,
    update: updateMock,
    slugAvailable: async () => ok(true as never),
    exists: async () => ok(false as never),
    findActiveOne: async () => ok(makeExisting() as never),
    parentDepth: async () => ok(0 as never),
    wouldCreateCycle: async () => ok(false as never),
  } as unknown as PGCategoriesCommandsRepository;

  const cmd = new UpdateCategoryCommand(repo);

  return { repo, updateMock, findOneMock, cmd };
}

describe("UpdateCategoryCommand handler — status-only fast path", () => {
  it("skips validation and only persists deletedAt when only deletedAt is provided", async () => {
    const existing = makeExisting();
    const { cmd, updateMock } = setup(existing);

    const result = await cmd.execute({
      id: "cat-1",
      deletedAt: new Date("2026-01-01"),
      organizationId: "org-1",
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      "cat-1",
      "org-1",
      expect.objectContaining({
        name: existing.name,
        slug: existing.slug,
        parentId: existing.parentId,
        deletedAt: new Date("2026-01-01"),
      }),
    );
    expect(result).toBeDefined();
  });
});

describe("UpdateCategoryCommand handler — findOne guard", () => {
  it("throws NOT_FOUND when category does not exist", async () => {
    const findOneMock = mock(async () => ok(null));

    const repo = {
      findOne: findOneMock,
      update: async () => ok(makeExisting()),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Nuevo", organizationId: "org-1" });
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when findOne returns error", async () => {
    const findOneMock = mock(async () => err(new Error("DB down")));

    const repo = {
      findOne: findOneMock,
      update: async () => ok(makeExisting()),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Nuevo", organizationId: "org-1" });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});

describe("UpdateCategoryCommand handler — name change", () => {
  it("re-slugifies and checks slug+name uniqueness when name changes", async () => {
    const existing = makeExisting({ name: "Bebidas", slug: "bebidas" });
    let capturedValues: any;
    const updateMock = mock(async (_id: string, _orgId: string, values: any) => {
      capturedValues = values;
      return ok({ ...existing, ...values });
    });

    const repo = {
      findOne: async () => ok(existing),
      update: updateMock,
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    await cmd.execute({ id: "cat-1", name: "Gaseosas", organizationId: "org-1" });

    expect(capturedValues.slug).toBe("gaseosas");
    expect(capturedValues.name).toBe("Gaseosas");
  });

  it("throws CONFLICT when new slug is taken", async () => {
    const existing = makeExisting({ name: "Bebidas", slug: "bebidas" });
    const slugAvailableMock = mock(async () => ok(false));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      slugAvailable: slugAvailableMock,
      exists: async () => ok(false),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Gaseosas", organizationId: "org-1" });
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });

  it("throws CONFLICT when new name already exists under same scope", async () => {
    const existing = makeExisting({ name: "Bebidas", slug: "bebidas" });
    const existsMock = mock(async () => ok(true));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      slugAvailable: async () => ok(true),
      exists: existsMock,
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Gaseosas", organizationId: "org-1" });
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });
});

describe("UpdateCategoryCommand handler — parent change", () => {
  it("throws BAD_REQUEST when moving category under itself (id === parentId)", async () => {
    const existing = makeExisting({ id: "cat-1", parentId: null });

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", parentId: "cat-1", organizationId: "org-1" });
      expect.unreachable("Expected BAD_REQUEST");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("throws BAD_REQUEST when moving category would create a cycle", async () => {
    const existing = makeExisting({ id: "cat-1", parentId: "cat-2" });
    const wouldCreateCycleMock = mock(async () => ok(true));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      wouldCreateCycle: wouldCreateCycleMock,
      findActiveOne: async () => ok(makeExisting()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", parentId: uuid, organizationId: "org-1" });
      expect.unreachable("Expected BAD_REQUEST");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("throws NOT_FOUND when new parent is not active (soft-deleted)", async () => {
    const existing = makeExisting({ id: "cat-1", parentId: null });
    const findActiveOneMock = mock(async () => ok(null));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      wouldCreateCycle: async () => ok(false),
      findActiveOne: findActiveOneMock,
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", parentId: uuid, organizationId: "org-1" });
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("throws BAD_REQUEST when new parent has depth > 1", async () => {
    const existing = makeExisting({ id: "cat-1", parentId: null });
    const parentDepthMock = mock(async () => ok(2));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      wouldCreateCycle: async () => ok(false),
      findActiveOne: async () => ok(makeExisting()),
      parentDepth: parentDepthMock,
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", parentId: uuid, organizationId: "org-1" });
      expect.unreachable("Expected BAD_REQUEST");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("re-checks name uniqueness under new parent scope when only parent changes", async () => {
    const existing = makeExisting({ id: "cat-1", name: "Bebidas", parentId: null });
    const existsMock = mock(async () => ok(true));

    const repo = {
      findOne: async () => ok(existing),
      update: async () => ok(existing),
      wouldCreateCycle: async () => ok(false),
      findActiveOne: async () => ok(makeExisting()),
      parentDepth: async () => ok(0),
      exists: existsMock,
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", parentId: uuid, organizationId: "org-1" });
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });
});

describe("UpdateCategoryCommand handler — clear parent", () => {
  it("allows clearing parent with parentId = null", async () => {
    const existing = makeExisting({ id: "cat-1", name: "Bebidas", parentId: "parent-1" });
    let capturedValues: any;
    const updateMock = mock(async (_id: string, _orgId: string, values: any) => {
      capturedValues = values;
      return ok({ ...existing, ...values });
    });

    const repo = {
      findOne: async () => ok(existing),
      update: updateMock,
      exists: async () => ok(false),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    await cmd.execute({ id: "cat-1", parentId: null, organizationId: "org-1" });

    expect(capturedValues.parentId).toBeNull();
  });
});

describe("UpdateCategoryCommand handler — update error", () => {
  it("throws INTERNAL_SERVER_ERROR when update returns error", async () => {
    const existing = makeExisting({ name: "Bebidas", slug: "bebidas" });
    const updateMock = mock(async () => err(new Error("DB down")));

    const repo = {
      findOne: async () => ok(existing),
      update: updateMock,
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Nuevo", organizationId: "org-1" });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("throws NOT_FOUND when update returns null (row no longer exists)", async () => {
    const existing = makeExisting({ name: "Bebidas", slug: "bebidas" });
    const updateMock = mock(async () => ok(null));

    const repo = {
      findOne: async () => ok(existing),
      update: updateMock,
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new UpdateCategoryCommand(repo);

    try {
      await cmd.execute({ id: "cat-1", name: "Nuevo", organizationId: "org-1" });
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});