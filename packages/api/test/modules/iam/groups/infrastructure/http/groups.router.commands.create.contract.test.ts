import { describe, expect, it, mock } from "bun:test";
import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";

mock.module("@fludge/db", () => ({
  dbConnection: {},
}));

mock.module("@fludge/auth", () => ({
  auth: {
    api: {
      getSession: mock(async () => null),
      getFullOrganization: mock(async () => null),
    },
  },
}));

const { groupsRouter } = await import(
  "@fludge/api/modules/iam/groups/infrastructure/http/groups.router"
);

describe("groupsRouter.commands.create contract", () => {
  const procedure = groupsRouter.commands.create as any;
  const inputSchema = procedure["~orpc"].inputSchema;

  it("accepts a valid payload via input schema", () => {
    const parsed = inputSchema.parse({
      name: "Admins",
      permissions: ["groups:view"],
    });

    expect(parsed).toBeDefined();
    expect(parsed.name).toBe("Admins");
    expect(parsed.permissions).toContain("groups:view");
  });

  it("rejects a payload with empty permissions", () => {
    expect(() =>
      createGroupCommand.parse({ name: "x", permissions: [] }),
    ).toThrow();
  });
});