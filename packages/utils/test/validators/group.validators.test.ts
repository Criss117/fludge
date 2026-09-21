import { describe, expect, it } from "bun:test";

import {
  createGroupValidator,
  updateGroupValidator,
  assignMembersToGroupValidator,
  deleteGroupsValidator,
} from "@fludge/utils/validators/group.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

type CreateGroupInput = {
  name: string;
  description: string;
  permissions: string[];
};

function validCreateGroup(overrides?: Partial<CreateGroupInput>): CreateGroupInput {
  return {
    name: "Equipo de Ventas",
    description: "Equipo encargado de ventas",
    permissions: ["products:create"],
    ...overrides,
  };
}

describe("createGroupValidator", () => {
  it("accepts a valid group", () => {
    const result = createGroupValidator.parse(validCreateGroup());

    expect(result.name).toBe("Equipo de Ventas");
    expect(result.description).toBe("Equipo encargado de ventas");
    expect(result.permissions).toEqual(["products:create"]);
  });

  it("accepts an empty description", () => {
    const result = createGroupValidator.parse(
      validCreateGroup({ description: "" }),
    );

    expect(result.description).toBe("");
  });

  it("rejects a short name", () => {
    expect(() =>
      createGroupValidator.parse(validCreateGroup({ name: "ABC" })),
    ).toThrow();
  });

  it("rejects a short description", () => {
    expect(() =>
      createGroupValidator.parse(validCreateGroup({ description: "Corta" })),
    ).toThrow();
  });

  it("rejects invalid permissions", () => {
    expect(() =>
      createGroupValidator.parse(
        validCreateGroup({ permissions: ["not:a:permission"] as never }),
      ),
    ).toThrow();
  });
});

describe("updateGroupValidator", () => {
  it("accepts a partial update with id", () => {
    const result = updateGroupValidator.parse({ id: VALID_UUID, name: "Nuevo" });

    expect(result.name).toBe("Nuevo");
  });

  it("rejects a missing id", () => {
    expect(() => updateGroupValidator.parse({ name: "Nuevo" })).toThrow();
  });

  it("accepts a status update", () => {
    const result = updateGroupValidator.parse({
      id: VALID_UUID,
      status: "inactive",
    });

    expect(result.status).toBe("inactive");
  });

  it("rejects an invalid status", () => {
    expect(() =>
      updateGroupValidator.parse({ id: VALID_UUID, status: "bogus" }),
    ).toThrow();
  });
});

describe("assignMembersToGroupValidator", () => {
  it("accepts a valid assignment", () => {
    expect(
      assignMembersToGroupValidator.parse({
        groupId: VALID_UUID,
        memberIds: [VALID_UUID],
      }),
    ).toEqual({ groupId: VALID_UUID, memberIds: [VALID_UUID] });
  });

  it("rejects an empty memberIds array", () => {
    expect(() =>
      assignMembersToGroupValidator.parse({
        groupId: VALID_UUID,
        memberIds: [],
      }),
    ).toThrow();
  });
});

describe("deleteGroupsValidator", () => {
  it("accepts a valid deletion", () => {
    expect(deleteGroupsValidator.parse({ groupIds: [VALID_UUID] })).toEqual({
      groupIds: [VALID_UUID],
    });
  });

  it("rejects an empty groupIds array", () => {
    expect(() => deleteGroupsValidator.parse({ groupIds: [] })).toThrow();
  });
});