import { describe, expect, it, mock } from "bun:test";

import {
  CreateCategoryCommand,
  createCategoryCommand,
} from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const validBase = { name: "Bebidas" };

describe("createCategoryCommand schema — name", () => {
  it("accepts a valid 3-char name", () => {
    expect(createCategoryCommand.safeParse({ ...validBase, name: "abc" }).success).toBe(true);
  });

  it("accepts a valid 50-char name", () => {
    expect(
      createCategoryCommand.safeParse({ ...validBase, name: "x".repeat(50) }).success,
    ).toBe(true);
  });

  it("rejects a name shorter than 3 chars", () => {
    const result = createCategoryCommand.safeParse({ ...validBase, name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    }
  });

  it("rejects a name longer than 50 chars", () => {
    const result = createCategoryCommand.safeParse({
      ...validBase,
      name: "x".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy largo");
    }
  });

  it("rejects missing name", () => {
    const result = createCategoryCommand.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createCategoryCommand schema — parentId", () => {
  it("accepts a valid UUID parentId", () => {
    expect(
      createCategoryCommand.safeParse({
        ...validBase,
        parentId: "00000000-0000-1000-8000-000000000000",
      }).success,
    ).toBe(true);
  });

  it("accepts null parentId", () => {
    expect(
      createCategoryCommand.safeParse({ ...validBase, parentId: null }).success,
    ).toBe(true);
  });

  it("accepts omitted parentId", () => {
    expect(createCategoryCommand.safeParse({ ...validBase }).success).toBe(true);
  });

  it("rejects an invalid UUID parentId", () => {
    const result = createCategoryCommand.safeParse({ ...validBase, parentId: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "parentId");
      expect(issue?.message).toBe("El id de la categoría padre no es válido");
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
  const saveMock = mock(async () => ok(makeCategory()));
  const slugAvailableMock = mock(async () => ok(true));
  const existsMock = mock(async () => ok(false));
  const findActiveOneMock = mock(async () => ok(makeCategory()));
  const parentDepthMock = mock(async () => ok(0));

  const repo = {
    save: saveMock,
    slugAvailable: slugAvailableMock,
    exists: existsMock,
    findActiveOne: findActiveOneMock,
    parentDepth: parentDepthMock,
  } as unknown as PGCategoriesCommandsRepository;

  const cmd = new CreateCategoryCommand(repo);

  return { repo, saveMock, slugAvailableMock, existsMock, findActiveOneMock, parentDepthMock, cmd };
}

describe("CreateCategoryCommand handler", () => {
  it("saves a root category when slug and name are available", async () => {
    const { cmd, saveMock } = setup();

    const result = await cmd.execute({
      name: "Bebidas",
      parentId: undefined,
      organizationId: "org-1",
      createdBy: { memberId: "mem-1" },
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bebidas",
        slug: "bebidas",
        organizationId: "org-1",
        parentId: null,
        createdBy: "mem-1",
      }),
    );
    expect(result).toEqual(expect.objectContaining({ name: "Bebidas", slug: "bebidas" }));
  });

  it("throws CONFLICT when slug is already in use", async () => {
    const slugAvailableMock = mock(async () => ok(false));

    const repo = {
      slugAvailable: slugAvailableMock,
      exists: async () => ok(false),
      save: async () => ok(makeCategory()),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({ name: "Bebidas", organizationId: "org-1", createdBy: null });
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when slugAvailable returns error", async () => {
    const slugAvailableMock = mock(async () => err(new Error("DB down")));

    const repo = {
      slugAvailable: slugAvailableMock,
      exists: async () => ok(false),
      save: async () => ok(makeCategory()),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({ name: "Bebidas", organizationId: "org-1", createdBy: null });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("throws CONFLICT when name already exists under same scope", async () => {
    const existsMock = mock(async () => ok(true));

    const repo = {
      slugAvailable: async () => ok(true),
      exists: existsMock,
      save: async () => ok(makeCategory()),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({ name: "Bebidas", organizationId: "org-1", createdBy: null });
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when exists returns error", async () => {
    const existsMock = mock(async () => err(new Error("DB down")));

    const repo = {
      slugAvailable: async () => ok(true),
      exists: existsMock,
      save: async () => ok(makeCategory()),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({ name: "Bebidas", organizationId: "org-1", createdBy: null });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("succeeds when parentId is provided and parent is active with depth 0", async () => {
    const { cmd, saveMock } = setup();

    await cmd.execute({
      name: "Colas",
      parentId: "00000000-0000-0000-0000-000000000000",
      organizationId: "org-1",
      createdBy: { memberId: "mem-1" },
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: "00000000-0000-0000-0000-000000000000",
      }),
    );
  });

  it("throws NOT_FOUND when parent does not exist", async () => {
    const findActiveOneMock = mock(async () => ok(null));

    const repo = {
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
      save: async () => ok(makeCategory()),
      findActiveOne: findActiveOneMock,
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({
        name: "Colas",
        parentId: "00000000-0000-0000-0000-000000000000",
        organizationId: "org-1",
        createdBy: null,
      });
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("throws BAD_REQUEST when parent has depth > 1 (level 3 not allowed)", async () => {
    const parentDepthMock = mock(async () => ok(2));

    const repo = {
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
      save: async () => ok(makeCategory()),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: parentDepthMock,
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({
        name: "Colas",
        parentId: "00000000-0000-0000-0000-000000000000",
        organizationId: "org-1",
        createdBy: null,
      });
      expect.unreachable("Expected BAD_REQUEST");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when save returns error", async () => {
    const saveMock = mock(async () => err(new Error("DB down")));

    const repo = {
      save: saveMock,
      slugAvailable: async () => ok(true),
      exists: async () => ok(false),
      findActiveOne: async () => ok(makeCategory()),
      parentDepth: async () => ok(0),
    } as unknown as PGCategoriesCommandsRepository;

    const cmd = new CreateCategoryCommand(repo);

    try {
      await cmd.execute({ name: "Bebidas", organizationId: "org-1", createdBy: null });
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});