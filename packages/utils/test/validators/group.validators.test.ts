import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  assignMembersToGroupValidator,
  createGroupValidator,
  deleteGroupsValidator,
  updateGroupValidator,
} from "../../src/validators/group.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const OTHER_UUID = "00000000-0000-4000-8000-000000000002";

function expectParsed<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
) {
  const result = schema.safeParse(value);
  expect(result.success, `expected success for ${JSON.stringify(value)}`).toBe(
    true,
  );
  if (!result.success) {
    throw new Error(`expected success but got: ${result.error.message}`);
  }
  return result.data;
}

function expectFirstIssue<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
): string {
  const result = schema.safeParse(value);
  expect(result.success, `expected failure for ${JSON.stringify(value)}`).toBe(
    false,
  );
  if (result.success) {
    throw new Error(`expected failure for ${JSON.stringify(value)}`);
  }
  return result.error.issues[0]?.message ?? "";
}

const VALID_CREATE_GROUP = {
  name: "Equipo de Ventas",
  description: "Grupo del equipo de ventas",
  permissions: ["groups:read"],
};

describe("createGroupValidator", () => {
  it("accepts a complete valid payload", () => {
    const data = expectParsed(createGroupValidator, VALID_CREATE_GROUP);
    expect(data.name).toBe("Equipo de Ventas");
    expect(data.description).toBe("Grupo del equipo de ventas");
    expect(data.permissions).toEqual(["groups:read"]);
  });

  it("accepts permissions from several resources", () => {
    const data = expectParsed(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      permissions: ["groups:read", "products:create", "customers:update"],
    });
    expect(data.permissions).toEqual([
      "groups:read",
      "products:create",
      "customers:update",
    ]);
  });

  it("accepts an empty permissions array", () => {
    const data = expectParsed(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      permissions: [],
    });
    expect(data.permissions).toEqual([]);
  });

  it("accepts an empty description", () => {
    expectParsed(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      description: "",
    });
  });

  it("trims the name", () => {
    expect(
      expectParsed(createGroupValidator, {
        name: "  Equipo de Ventas  ",
        description: "Grupo del equipo de ventas",
        permissions: [],
      }).name,
    ).toBe("Equipo de Ventas");
  });

  it("accepts a description at its boundaries (15 and 100 characters)", () => {
    expectParsed(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      description: "a".repeat(15),
    });
    expectParsed(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      description: "a".repeat(100),
    });
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects a name longer than 50 characters", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      name: "a".repeat(51),
    })).toBe("validators.name.max_length");
  });

  it("rejects a description shorter than 15 characters", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      description: "x",
    })).toBe("validators.description.min_length");
  });

  it("rejects a description longer than 100 characters", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      description: "a".repeat(101),
    })).toBe("validators.description.max_length");
  });

  it("rejects an invalid permission", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      permissions: ["groups:nope"],
    })).toMatch(/Invalid option/);
  });

  it("rejects a non-array permissions value", () => {
    expect(expectFirstIssue(createGroupValidator, {
      ...VALID_CREATE_GROUP,
      permissions: "groups:read",
    })).toMatch(/expected array/);
  });

  it("rejects a missing permissions field", () => {
    const { permissions: _permissions, ...withoutPermissions } =
      VALID_CREATE_GROUP;
    expect(expectFirstIssue(createGroupValidator, withoutPermissions)).toMatch(
      /expected array/,
    );
  });

  it("rejects a missing name", () => {
    const { name: _name, ...withoutName } = VALID_CREATE_GROUP;
    expect(expectFirstIssue(createGroupValidator, withoutName)).toBe(
      "validators.name.required",
    );
  });
});

describe("updateGroupValidator", () => {
  it("accepts an id-only payload (all other fields optional)", () => {
    expect(expectParsed(updateGroupValidator, { id: VALID_UUID }).id).toBe(
      VALID_UUID,
    );
  });

  it("accepts a full update payload", () => {
    const data = expectParsed(updateGroupValidator, {
      id: VALID_UUID,
      name: "Equipo Actualizado",
      description: "Grupo del equipo actualizado",
      permissions: ["products:read"],
      status: "inactive",
    });
    expect(data.name).toBe("Equipo Actualizado");
    expect(data.description).toBe("Grupo del equipo actualizado");
    expect(data.permissions).toEqual(["products:read"]);
    expect(data.status).toBe("inactive");
  });

  it("accepts every status value", () => {
    expectParsed(updateGroupValidator, { id: VALID_UUID, status: "active" });
    expectParsed(updateGroupValidator, { id: VALID_UUID, status: "inactive" });
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateGroupValidator, {
      id: VALID_UUID,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid description when provided", () => {
    expect(expectFirstIssue(updateGroupValidator, {
      id: VALID_UUID,
      description: "x",
    })).toBe("validators.description.min_length");
  });

  it("rejects an invalid permission when provided", () => {
    expect(expectFirstIssue(updateGroupValidator, {
      id: VALID_UUID,
      permissions: ["nope"],
    })).toMatch(/Invalid option/);
  });

  it("rejects a status outside the enum", () => {
    expect(expectFirstIssue(updateGroupValidator, {
      id: VALID_UUID,
      status: "archived",
    })).toBe("validators.status.invalid");
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(updateGroupValidator, { name: "Nuevo" })).toBe(
      "validators.uuid.invalid",
    );
  });
});

describe("assignMembersToGroupValidator", () => {
  it("accepts a group id with a single member id", () => {
    const data = expectParsed(assignMembersToGroupValidator, {
      groupId: VALID_UUID,
      memberIds: [OTHER_UUID],
    });
    expect(data.groupId).toBe(VALID_UUID);
    expect(data.memberIds).toEqual([OTHER_UUID]);
  });

  it("accepts multiple member ids", () => {
    const data = expectParsed(assignMembersToGroupValidator, {
      groupId: VALID_UUID,
      memberIds: [OTHER_UUID, VALID_UUID],
    });
    expect(data.memberIds).toEqual([OTHER_UUID, VALID_UUID]);
  });

  it("rejects an empty memberIds array", () => {
    expect(expectFirstIssue(assignMembersToGroupValidator, {
      groupId: VALID_UUID,
      memberIds: [],
    })).toBe("validators.array.at_least_one");
  });

  it("rejects an invalid uuid inside memberIds", () => {
    expect(expectFirstIssue(assignMembersToGroupValidator, {
      groupId: VALID_UUID,
      memberIds: ["not-a-uuid"],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing memberIds field", () => {
    expect(expectFirstIssue(assignMembersToGroupValidator, {
      groupId: VALID_UUID,
    })).toMatch(/expected array/);
  });

  it("rejects a missing groupId", () => {
    expect(expectFirstIssue(assignMembersToGroupValidator, {
      memberIds: [VALID_UUID],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects an invalid groupId", () => {
    expect(expectFirstIssue(assignMembersToGroupValidator, {
      groupId: "not-a-uuid",
      memberIds: [VALID_UUID],
    })).toBe("validators.uuid.invalid");
  });
});

describe("deleteGroupsValidator", () => {
  it("accepts a single group id", () => {
    const data = expectParsed(deleteGroupsValidator, {
      groupIds: [VALID_UUID],
    });
    expect(data.groupIds).toEqual([VALID_UUID]);
  });

  it("accepts multiple group ids", () => {
    const data = expectParsed(deleteGroupsValidator, {
      groupIds: [VALID_UUID, OTHER_UUID],
    });
    expect(data.groupIds).toEqual([VALID_UUID, OTHER_UUID]);
  });

  it("rejects an empty groupIds array", () => {
    expect(expectFirstIssue(deleteGroupsValidator, { groupIds: [] })).toBe(
      "validators.array.at_least_one",
    );
  });

  it("rejects an invalid uuid inside groupIds", () => {
    expect(expectFirstIssue(deleteGroupsValidator, {
      groupIds: ["not-a-uuid"],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing groupIds field", () => {
    expect(expectFirstIssue(deleteGroupsValidator, {})).toMatch(
      /expected array/,
    );
  });
});